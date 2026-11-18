import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { DBProcessor } from './db.processor';
import { DB_JOBS } from './db.constants';
import { PrismaService } from '../../infra/prisma/prisma.service';

describe('DBProcessor', () => {
  let processor: DBProcessor;
  let prismaMock: {
    $executeRawUnsafe: jest.Mock;
    project: {
      update: jest.Mock;
    };
  };

  const sampleTenantPayload = {
    projectId: 'proj-uuid-123',
    schemaName: 'proj_test_1234567890ab',
    dbRole: 'role_proj_abcdef123456',
    dbPassword: 'secure_password_test_123',
  };

  beforeEach(async () => {
    prismaMock = {
      $executeRawUnsafe: jest.fn().mockResolvedValue(1),
      project: {
        update: jest.fn().mockResolvedValue({
          id: sampleTenantPayload.projectId,
          status: 'ACTIVE',
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DBProcessor,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    processor = module.get<DBProcessor>(DBProcessor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process create-new-tenant job', () => {
    it('should provision tenant role, schema, default tables, and mark project ACTIVE', async () => {
      const job = {
        id: 'job_db_1',
        name: DB_JOBS.createDb,
        attemptsMade: 0,
        data: sampleTenantPayload,
      } as unknown as Job;

      await processor.process(job);

      // Verify DDL operations executed
      const executedSqls = prismaMock.$executeRawUnsafe.mock.calls.map(
        (call: [string]) => call[0],
      );

      // 1. Role creation
      expect(
        executedSqls.some((sql: string) =>
          sql.includes(`CREATE ROLE "${sampleTenantPayload.dbRole}" WITH LOGIN PASSWORD`),
        ),
      ).toBe(true);

      // 2. Revoke public schema access
      expect(
        executedSqls.some((sql: string) =>
          sql.includes(`REVOKE ALL ON SCHEMA public FROM "${sampleTenantPayload.dbRole}"`),
        ),
      ).toBe(true);

      // 3. Schema creation
      expect(
        executedSqls.some((sql: string) =>
          sql.includes(
            `CREATE SCHEMA "${sampleTenantPayload.schemaName}" AUTHORIZATION "${sampleTenantPayload.dbRole}"`,
          ),
        ),
      ).toBe(true);

      // 4. Privileges on schema
      expect(
        executedSqls.some((sql: string) =>
          sql.includes(
            `GRANT ALL PRIVILEGES ON SCHEMA "${sampleTenantPayload.schemaName}" TO "${sampleTenantPayload.dbRole}"`,
          ),
        ),
      ).toBe(true);

      // 5. search_path configuration
      expect(
        executedSqls.some((sql: string) =>
          sql.includes(
            `ALTER ROLE "${sampleTenantPayload.dbRole}" SET search_path TO "${sampleTenantPayload.schemaName}"`,
          ),
        ),
      ).toBe(true);

      // 6. Default tables: users, profiles, storage_objects
      expect(
        executedSqls.some((sql: string) =>
          sql.includes(`CREATE TABLE "${sampleTenantPayload.schemaName}"."users"`),
        ),
      ).toBe(true);
      expect(
        executedSqls.some((sql: string) =>
          sql.includes(`CREATE TABLE "${sampleTenantPayload.schemaName}"."profiles"`),
        ),
      ).toBe(true);
      expect(
        executedSqls.some((sql: string) =>
          sql.includes(`CREATE TABLE "${sampleTenantPayload.schemaName}"."storage_objects"`),
        ),
      ).toBe(true);

      // 7. Table privileges granted to dbRole
      expect(
        executedSqls.some((sql: string) =>
          sql.includes(
            `GRANT SELECT, INSERT, UPDATE, DELETE\n          ON "${sampleTenantPayload.schemaName}"."users"`,
          ),
        ),
      ).toBe(true);

      // 8. Project status update to ACTIVE
      expect(prismaMock.project.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.project.update).toHaveBeenCalledWith({
        where: { id: sampleTenantPayload.projectId },
        data: { status: 'ACTIVE' },
      });
    });

    it('should propagate errors when DDL execution fails to trigger BullMQ retry', async () => {
      const dbError = new Error('Postgres syntax error or connection drop');
      prismaMock.$executeRawUnsafe.mockRejectedValueOnce(dbError);

      const job = {
        id: 'job_db_fail',
        name: DB_JOBS.createDb,
        attemptsMade: 0,
        data: sampleTenantPayload,
      } as unknown as Job;

      await expect(processor.process(job)).rejects.toThrow(
        'Postgres syntax error or connection drop',
      );

      // Project should NOT be updated to ACTIVE if provisioning failed
      expect(prismaMock.project.update).not.toHaveBeenCalled();
    });

    it('should propagate errors when project status update fails to trigger BullMQ retry', async () => {
      prismaMock.project.update.mockRejectedValueOnce(
        new Error('Database unavailable for status update'),
      );

      const job = {
        id: 'job_db_update_fail',
        name: DB_JOBS.createDb,
        attemptsMade: 1,
        data: sampleTenantPayload,
      } as unknown as Job;

      await expect(processor.process(job)).rejects.toThrow(
        'Database unavailable for status update',
      );
    });
  });

  describe('process unknown job', () => {
    it('should not execute DDL or update project for unrecognized job names', async () => {
      const job = {
        id: 'job_unknown',
        name: 'unrecognized-job-name',
        attemptsMade: 0,
        data: {},
      } as unknown as Job;

      await processor.process(job);

      expect(prismaMock.$executeRawUnsafe).not.toHaveBeenCalled();
      expect(prismaMock.project.update).not.toHaveBeenCalled();
    });
  });

  describe('worker lifecycle events', () => {
    it('should handle completed and failed events cleanly without throwing', () => {
      const job = {
        id: 'job_lifecycle',
        name: DB_JOBS.createDb,
        attemptsMade: 2,
        opts: { attempts: 3 },
      } as unknown as Job;

      expect(() => processor.onCompleted(job)).not.toThrow();
      expect(() =>
        processor.onFailed(job, new Error('Fatal database connection issue')),
      ).not.toThrow();
    });
  });
});
