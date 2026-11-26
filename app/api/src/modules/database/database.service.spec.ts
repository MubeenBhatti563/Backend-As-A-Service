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

  it('returns project tables, columns, and foreign key relationships with topological layout positions', async () => {
    prisma.$queryRawUnsafe
      .mockResolvedValueOnce([
        {
          tableName: 'users',
          columnName: 'id',
          type: 'uuid',
          isPrimary: true,
          isForeignKey: false,
        },
        {
          tableName: 'users',
          columnName: 'name',
          type: 'character varying(255)',
          isPrimary: false,
          isForeignKey: false,
        },
        {
          tableName: 'posts',
          columnName: 'id',
          type: 'uuid',
          isPrimary: true,
          isForeignKey: false,
        },
        {
          tableName: 'posts',
          columnName: 'user_id',
          type: 'uuid',
          isPrimary: false,
          isForeignKey: true,
        },
      ])
      .mockResolvedValueOnce([
        {
          constraintName: 'posts_user_id_fkey',
          childTable: 'posts',
          childColumn: 'user_id',
          parentTable: 'users',
          parentColumn: 'id',
          isUnique: false,
        },
      ]);

    const result = await service.getRelationships('project-1', 'user-1');

    expect(result.tables).toHaveLength(2);
    const usersTable = result.tables.find((t) => t.id === 'users');
    const postsTable = result.tables.find((t) => t.id === 'posts');

    expect(usersTable).toBeDefined();
    expect(usersTable?.columns).toEqual([
      { name: 'id', type: 'uuid', key: 'pk' },
      { name: 'name', type: 'varchar' },
    ]);
    expect(postsTable).toBeDefined();
    expect(postsTable?.columns).toEqual([
      { name: 'id', type: 'uuid', key: 'pk' },
      { name: 'user_id', type: 'uuid', key: 'fk' },
    ]);
    // users is parent, posts is child -> users x should be <= posts x
    expect(usersTable!.x).toBeLessThan(postsTable!.x);

    expect(result.relations).toHaveLength(1);
    expect(result.relations[0]).toEqual({
      id: 'posts-user_id-users-id',
      from: { table: 'users', column: 'id' },
      to: { table: 'posts', column: 'user_id' },
      cardinality: '1:N',
      tone: 'secondary',
    });
  });

  it('does not read relationships when the caller does not own the project', async () => {
    prisma.project.findFirst.mockResolvedValue(null);

    await expect(
      service.getRelationships('project-1', 'other-user'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.$queryRawUnsafe).not.toHaveBeenCalled();
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

  it('creates a table with unique, default, and foreign key constraints', async () => {
    prisma.$queryRawUnsafe
      .mockResolvedValueOnce([{ exists: false }]) // tableExists check
      .mockResolvedValueOnce([{ exists: true }]); // foreign key refExists check
    prisma.$executeRawUnsafe.mockResolvedValue(0);

    const result = await service.createTable('project-1', 'user-1', {
      name: 'comments',
      columns: [
        {
          name: 'post_id',
          type: 'uuid',
          nullable: false,
          foreignKey: { table: 'posts', column: 'id' },
        },
        {
          name: 'slug',
          type: 'text',
          nullable: false,
          isUnique: true,
          defaultValue: 'test-slug',
        },
      ],
    });

    expect(result).toEqual({ name: 'comments' });
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      'CREATE TABLE "tenant_abc"."comments" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "post_id" UUID NOT NULL REFERENCES "tenant_abc"."posts"("id") ON DELETE CASCADE, "slug" TEXT DEFAULT \'test-slug\' NOT NULL UNIQUE)',
    );
  });

  it('drops a table successfully', async () => {
    prisma.$queryRawUnsafe.mockResolvedValueOnce([{ exists: true }]);
    prisma.$executeRawUnsafe.mockResolvedValue(0);

    const result = await service.dropTable('project-1', 'user-1', 'comments');
    expect(result).toEqual({ dropped: true, name: 'comments' });
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      'DROP TABLE "tenant_abc"."comments" CASCADE',
    );
  });

  it('updates a row by primary key', async () => {
    prisma.$queryRawUnsafe
      .mockResolvedValueOnce([
        {
          name: 'id',
          type: 'uuid',
          primary: true,
          writable: false,
          nullable: false,
          hasDefault: true,
        },
        {
          name: 'title',
          type: 'text',
          primary: false,
          writable: true,
          nullable: false,
          hasDefault: false,
        },
      ])
      .mockResolvedValueOnce([{ id: 'row-1', title: 'Updated title' }]);

    const result = await service.updateRow('project-1', 'user-1', 'posts', 'row-1', {
      title: 'Updated title',
    });

    expect(result).toEqual({ updated: true });
    expect(prisma.$queryRawUnsafe).toHaveBeenNthCalledWith(
      2,
      'UPDATE "tenant_abc"."posts" SET "title" = $1::TEXT WHERE "id"::text = $2 RETURNING *',
      'Updated title',
      'row-1',
    );
  });

  it('deletes a row and deletes multiple rows', async () => {
    prisma.$queryRawUnsafe.mockResolvedValue([
      { name: 'id', primary: true },
    ]);
    prisma.$executeRawUnsafe.mockResolvedValue(1);

    const deleteOne = await service.deleteRow('project-1', 'user-1', 'posts', 'row-1');
    expect(deleteOne).toEqual({ deleted: true });
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      'DELETE FROM "tenant_abc"."posts" WHERE "id"::text = $1',
      'row-1',
    );

    const deleteMany = await service.deleteRows('project-1', 'user-1', 'posts', ['row-1', 'row-2']);
    expect(deleteMany).toEqual({ deleted: true, count: 2 });
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      'DELETE FROM "tenant_abc"."posts" WHERE "id"::text = ANY($1::text[])',
      ['row-1', 'row-2'],
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

  it('retrieves table structure with columns, primary keys, and constraint counts', async () => {
    prisma.$queryRawUnsafe
      .mockResolvedValueOnce([{ bytes: 16384n, rls: false, rows: 10n }]) // tableMeta
      .mockResolvedValueOnce([
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          isUnique: false,
          isNullable: false,
          isWritable: false,
          hasDefault: true,
          defaultValue: 'gen_random_uuid()',
          isForeignKey: false,
          foreignKeyTable: null,
          foreignKeyColumn: null,
          foreignKeyConstraint: null,
        },
        {
          name: 'title',
          type: 'text',
          isPrimary: false,
          isUnique: true,
          isNullable: false,
          isWritable: true,
          hasDefault: false,
          defaultValue: null,
          isForeignKey: false,
          foreignKeyTable: null,
          foreignKeyColumn: null,
          foreignKeyConstraint: null,
        },
      ]);

    const result = await service.getTableStructure('project-1', 'user-1', 'posts');
    expect(result.table.name).toBe('posts');
    expect(result.columns).toHaveLength(2);
    expect(result.primaryKeys).toEqual(['id']);
    expect(result.uniqueConstraintsCount).toBe(1);
    expect(result.foreignKeysCount).toBe(0);
  });

  it('adds a column to a table and drops a column', async () => {
    prisma.$queryRawUnsafe.mockResolvedValueOnce([{ exists: false }]);
    prisma.$executeRawUnsafe.mockResolvedValue(0);

    const addRes = await service.addColumn('project-1', 'user-1', 'posts', {
      name: 'views',
      type: 'integer',
      nullable: true,
      defaultValue: '0',
    });
    expect(addRes).toEqual({ added: true, column: 'views' });
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      'ALTER TABLE "tenant_abc"."posts" ADD COLUMN "views" INTEGER DEFAULT 0',
    );

    prisma.$queryRawUnsafe.mockResolvedValueOnce([{ isPrimary: false }]);
    const dropRes = await service.dropColumn('project-1', 'user-1', 'posts', 'views');
    expect(dropRes).toEqual({ dropped: true, column: 'views' });
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      'ALTER TABLE "tenant_abc"."posts" DROP COLUMN "views" CASCADE',
    );
  });

  it('retrieves table indexes and creates/drops an index', async () => {
    prisma.$queryRawUnsafe
      .mockResolvedValueOnce([{ bytes: 16384n, rls: false, rows: 10n }])
      .mockResolvedValueOnce([
        {
          name: 'posts_title_idx',
          tableName: 'posts',
          method: 'btree',
          columns: ['title'],
          isUnique: false,
          isPrimary: false,
          isValid: true,
          definition: 'CREATE INDEX posts_title_idx ON posts USING btree (title)',
          sizeBytes: 8192n,
        },
      ]);

    const indexRes = await service.getTableIndexes('project-1', 'user-1', 'posts');
    expect(indexRes.table.name).toBe('posts');
    expect(indexRes.indexes).toHaveLength(1);
    expect(indexRes.stats.totalIndexes).toBe(1);

    prisma.$executeRawUnsafe.mockResolvedValue(0);
    const createRes = await service.createTableIndex('project-1', 'user-1', 'posts', {
      columns: ['created_at'],
      method: 'btree',
      isUnique: false,
    });
    expect(createRes.created).toBe(true);

    prisma.$queryRawUnsafe.mockResolvedValueOnce([{ isPrimary: false }]);
    const dropRes = await service.dropTableIndex('project-1', 'user-1', 'posts', 'posts_title_idx');
    expect(dropRes).toEqual({ dropped: true, name: 'posts_title_idx' });
  });
});
