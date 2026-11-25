import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;
  const prisma = {
    project: { findFirst: jest.fn() },
    $queryRaw: jest.fn(),
    $queryRawUnsafe: jest.fn(),
    $executeRawUnsafe: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(DatabaseService);
    prisma.project.findFirst.mockResolvedValue({
      id: 'project-1',
      schemaName: 'tenant_abc',
    });
  });

  it('rejects access when the project is not owned by the caller', async () => {
    prisma.project.findFirst.mockResolvedValue(null);
    await expect(
      service.getOverview('project-1', 'user-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.$queryRawUnsafe).not.toHaveBeenCalled();
  });

  it('returns project index metadata and exact allocated byte totals', async () => {
    prisma.$queryRawUnsafe
      .mockResolvedValueOnce([
        {
          name: 'profiles_pkey',
          tableName: 'profiles',
          method: 'btree',
          columns: ['id'],
          isUnique: true,
          isPrimary: true,
          isValid: true,
          definition: 'CREATE UNIQUE INDEX profiles_pkey ON tenant_abc.profiles USING btree (id)',
          sizeBytes: 8192n,
        },
        {
          name: 'profiles_email_idx',
          tableName: 'profiles',
          method: 'btree',
          columns: ['email'],
          isUnique: true,
          isPrimary: false,
          isValid: true,
          definition: 'CREATE UNIQUE INDEX profiles_email_idx ON tenant_abc.profiles USING btree (email)',
          sizeBytes: 4096n,
        },
      ])
      .mockResolvedValueOnce([
        { size: '24 kB', totalTables: 1n, activeConnections: 4n },
      ]);

    const result = await service.getIndexes('project-1', 'user-1');

    expect(result.stats).toEqual({
      totalIndexes: 2,
      uniqueIndexes: 2,
      totalSizeBytes: '12288',
    });
    expect(result.databaseStats).toEqual({
      size: '24 kB',
      totalTables: 1,
      activeConnections: 4,
    });
    expect(result.indexes[0]).toMatchObject({
      name: 'profiles_pkey',
      tableName: 'profiles',
      columns: ['id'],
      sizeBytes: '8192',
    });
    expect(prisma.$queryRawUnsafe).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('WHERE table_namespace.nspname = $1'),
      'tenant_abc',
    );
    expect(prisma.$queryRawUnsafe).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('WHERE n.nspname = $1'),
      'tenant_abc',
    );
  });

  it('does not read index catalogs when the caller does not own the project', async () => {
    prisma.project.findFirst.mockResolvedValue(null);

    await expect(
      service.getIndexes('project-1', 'other-user'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.$queryRawUnsafe).not.toHaveBeenCalled();
  });

  it('rejects unsafe tenant schema names before interpolating SQL identifiers', async () => {
    prisma.project.findFirst.mockResolvedValue({
      id: 'project-1',
      schemaName: 'tenant; DROP SCHEMA public',
    });
    await expect(
      service.getOverview('project-1', 'user-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.$queryRawUnsafe).not.toHaveBeenCalled();
  });

  it('rejects invalid table names and pagination before database queries', async () => {
    await expect(
      service.getTable('project-1', 'user-1', 'users;DROP'),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.getTable('project-1', 'user-1', 'users', '0'),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.getTable('project-1', 'user-1', 'users', '1', '101'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.project.findFirst).not.toHaveBeenCalled();
  });

  it('creates a table with a generated UUID primary key and quoted identifiers', async () => {
    prisma.$queryRawUnsafe.mockResolvedValue([{ exists: false }]);
    prisma.$executeRawUnsafe.mockResolvedValue(0);
    const result = await service.createTable('project-1', 'user-1', {
      name: 'notes',
      columns: [{ name: 'body', type: 'text', nullable: false }],
    });
    expect(result).toEqual({ name: 'notes' });
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      'CREATE TABLE "tenant_abc"."notes" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "body" TEXT NOT NULL)',
    );
  });

  it('rejects duplicate table names and invalid column definitions', async () => {
    prisma.$queryRawUnsafe.mockResolvedValue([{ exists: true }]);
    await expect(
      service.createTable('project-1', 'user-1', {
        name: 'notes',
        columns: [{ name: 'body', type: 'text', nullable: true }],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    prisma.$queryRawUnsafe.mockResolvedValue([{ exists: false }]);
    await expect(
      service.createTable('project-1', 'user-1', {
        name: 'notes',
        columns: [{ name: 'bad-name', type: 'text', nullable: true }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
  });

  it('retrieves overview stats without performing sequential table count scans', async () => {
    prisma.$queryRawUnsafe
      .mockResolvedValueOnce([
        {
          name: 'users',
          rows: 42n,
          bytes: 16384n,
          dataBytes: 8192n,
          indexBytes: 8192n,
          rls: false,
          modified: new Date('2026-11-20T10:00:00Z'),
        },
      ])
      .mockResolvedValueOnce([{ bytes: 16384n }]);
    prisma.$queryRaw.mockResolvedValueOnce([{ count: 2n }]);

    const overview = await service.getOverview('project-1', 'user-1');

    expect(overview.tables).toHaveLength(1);
    expect(overview.tables[0].name).toBe('users');
    expect(overview.tables[0].rows).toBe(42);
    // Verified: no batch COUNT(*) queries dispatched
    expect(prisma.$queryRawUnsafe).toHaveBeenCalledTimes(2);
  });

  it('applies parameterized ILIKE filter when searching table records', async () => {
    prisma.$queryRawUnsafe
      .mockResolvedValueOnce([
        {
          name: 'id',
          type: 'uuid',
          primary: true,
          estimatedRows: 1n,
          writable: false,
          nullable: false,
          hasDefault: true,
          isForeignKey: false,
          foreignKeyTable: null,
          foreignKeyColumn: null,
        },
        {
          name: 'title',
          type: 'text',
          primary: false,
          estimatedRows: 1n,
          writable: true,
          nullable: false,
          hasDefault: false,
          isForeignKey: false,
          foreignKeyTable: null,
          foreignKeyColumn: null,
        },
      ])
      .mockResolvedValueOnce([{ __row_id: '123', id: '123', title: 'hello world' }])
      .mockResolvedValueOnce([{ count: 1n }])
      .mockResolvedValueOnce([{ bytes: 8192n, rls: false }]);

    const result = await service.getTable('project-1', 'user-1', 'notes', '1', '10', 'hello');

    expect(result.rows).toHaveLength(1);
    expect(result.pagination.totalRows).toBe(1);
    expect(prisma.$queryRawUnsafe).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('WHERE (CAST("id" AS TEXT) ILIKE $1 OR CAST("title" AS TEXT) ILIKE $1)'),
      '%hello%',
      10,
      0,
    );
  });

  it('rejects object values for non-jsonb columns in insertRow', async () => {
    prisma.$queryRawUnsafe.mockResolvedValueOnce([
      {
        name: 'title',
        type: 'text',
        nullable: false,
        writable: true,
        hasDefault: false,
        isForeignKey: false,
      },
    ]);

    await expect(
      service.insertRow('project-1', 'user-1', 'notes', {
        title: { nested: 'value' } as never,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
