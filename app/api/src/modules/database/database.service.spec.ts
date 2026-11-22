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
});
