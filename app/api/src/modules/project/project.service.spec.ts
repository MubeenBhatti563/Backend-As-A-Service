import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ProjectService } from './project.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { DB_QUEUE } from '../../workers/db-workers/db.constants';
import * as crypto from 'crypto';

describe('ProjectService', () => {
  let service: ProjectService;
  let prismaMock: {
    $transaction: jest.Mock;
    project: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
    subscription: {
      findUnique: jest.Mock;
    };
    plan: {
      findUniqueOrThrow: jest.Mock;
    };
    apiKey: {
      createMany: jest.Mock;
    };
    projectUsage: {
      findFirst: jest.Mock;
    };
    activityLog: {
      findMany: jest.Mock;
      createMany: jest.Mock;
    };
  };
  let dbQueueMock: { add: jest.Mock };

  const mockTx = {
    project: {
      create: jest.fn(),
    },
    apiKey: {
      createMany: jest.fn(),
    },
    activityLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    prismaMock = {
      $transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(mockTx);
      }),
      project: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      subscription: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      plan: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 'plan-hobby',
          code: 'HOBBY',
          name: 'Hobby',
          maxProjects: 2,
        }),
      },
      apiKey: {
        createMany: jest.fn(),
      },
      projectUsage: {
        findFirst: jest.fn(),
      },
      activityLog: {
        findMany: jest.fn(),
        createMany: jest.fn(),
      },
    };

    dbQueueMock = { add: jest.fn().mockResolvedValue({ id: 'job-1' }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: getQueueToken(DB_QUEUE), useValue: dbQueueMock },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProject', () => {
    const dto = {
      name: 'my-saas-app',
      region: 'us-east-1' as const,
      description: 'Test application project',
    };
    const userId = 'user-uuid-123';

    it('should create project and API keys inside a transaction, then enqueue tenant provisioning', async () => {
      const mockCreatedProject = {
        id: 'proj-123',
        name: dto.name,
        schemaName: 'proj_abcdef123456abcdef123456',
        deploymentRegion: dto.region,
        description: dto.description,
        ownerId: userId,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTx.project.create.mockResolvedValue(mockCreatedProject);
      mockTx.apiKey.createMany.mockResolvedValue({ count: 2 });

      const result = await service.createProject(dto, userId);

      // Verify transaction was used
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);

      // Verify project creation parameters
      expect(mockTx.project.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          schemaName: expect.stringMatching(/^proj_[a-f0-9]{24}$/),
          deploymentRegion: dto.region,
          description: dto.description,
          ownerId: userId,
          status: 'PENDING',
        },
      });

      // Verify API keys creation
      expect(mockTx.apiKey.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            projectId: mockCreatedProject.id,
            createdBy: userId,
            name: 'Default publishable key',
            role: 'anon',
            keyPrefix: expect.stringMatching(/^pk_live_/),
            keyHash: expect.any(String),
          }),
          expect.objectContaining({
            projectId: mockCreatedProject.id,
            createdBy: userId,
            name: 'Default secret key',
            role: 'service',
            keyPrefix: expect.stringMatching(/^sk_live_/),
            keyHash: expect.any(String),
          }),
        ]),
      });

      // Verify BullMQ job was enqueued
      expect(dbQueueMock.add).toHaveBeenCalledTimes(1);
      expect(dbQueueMock.add).toHaveBeenCalledWith(
        'create-new-tenant',
        expect.objectContaining({
          projectId: mockCreatedProject.id,
          schemaName: expect.stringMatching(/^proj_[a-f0-9]{24}$/),
          dbRole: expect.stringMatching(/^role_proj_[a-f0-9]{12}$/),
          dbPassword: expect.stringMatching(/^[a-f0-9]{32}$/),
        }),
      );

      // Verify result structure
      expect(result.project).toEqual(mockCreatedProject);
      expect(result.keys.anon).toMatch(/^pk_live_[a-f0-9]{64}$/);
      expect(result.keys.service).toMatch(/^sk_live_[a-f0-9]{64}$/);

      // Verify key hashing and prefix integrity
      const anonCall = mockTx.apiKey.createMany.mock.calls[0][0].data.find(
        (k: { role: string }) => k.role === 'anon',
      );
      const expectedAnonHash = crypto
        .createHash('sha256')
        .update(result.keys.anon)
        .digest('hex');
      expect(anonCall.keyHash).toBe(expectedAnonHash);
      expect(anonCall.keyPrefix).toBe(result.keys.anon.slice(0, 12));

      const serviceCall = mockTx.apiKey.createMany.mock.calls[0][0].data.find(
        (k: { role: string }) => k.role === 'service',
      );
      const expectedServiceHash = crypto
        .createHash('sha256')
        .update(result.keys.service)
        .digest('hex');
      expect(serviceCall.keyHash).toBe(expectedServiceHash);
      expect(serviceCall.keyPrefix).toBe(result.keys.service.slice(0, 12));
    });

    it('should propagate errors if transaction fails', async () => {
      const error = new Error('Database transaction failed');
      prismaMock.$transaction.mockRejectedValue(error);

      await expect(service.createProject(dto, userId)).rejects.toThrow(
        'Database transaction failed',
      );
      // Queue should not be called if the transaction failed
      expect(dbQueueMock.add).not.toHaveBeenCalled();
    });

    it('should propagate errors if queue.add fails', async () => {
      const mockCreatedProject = {
        id: 'proj-999',
        name: dto.name,
        schemaName: 'proj_xxxxxxxxxxxxxxxxxxxx',
        deploymentRegion: dto.region,
        description: dto.description,
        ownerId: userId,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockTx.project.create.mockResolvedValue(mockCreatedProject);
      mockTx.apiKey.createMany.mockResolvedValue({ count: 2 });
      dbQueueMock.add.mockRejectedValue(new Error('Redis connection refused'));

      await expect(service.createProject(dto, userId)).rejects.toThrow(
        'Redis connection refused',
      );
    });

    it('should throw ForbiddenException when HOBBY limit (2) is reached', async () => {
      prismaMock.project.count.mockResolvedValue(2);

      await expect(service.createProject(dto, userId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.createProject(dto, userId)).rejects.toThrow(
        'Your Hobby plan allows up to 2 project(s). Upgrade your plan to create more.',
      );
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('should allow project creation when under HOBBY limit', async () => {
      prismaMock.project.count.mockResolvedValue(1);
      const mockCreatedProject = {
        id: 'proj-123',
        name: dto.name,
        schemaName: 'proj_abcdef123456abcdef123456',
        deploymentRegion: dto.region,
        description: dto.description,
        ownerId: userId,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockTx.project.create.mockResolvedValue(mockCreatedProject);
      mockTx.apiKey.createMany.mockResolvedValue({ count: 2 });

      const result = await service.createProject(dto, userId);
      expect(result.project).toEqual(mockCreatedProject);
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should throw ForbiddenException when PRO limit (10) is reached', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        plan: { code: 'PRO', name: 'Pro', maxProjects: 10 },
      });
      prismaMock.project.count.mockResolvedValue(10);

      await expect(service.createProject(dto, userId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.createProject(dto, userId)).rejects.toThrow(
        'Your Pro plan allows up to 10 project(s). Upgrade your plan to create more.',
      );
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('should allow unlimited projects on ENTERPRISE plan', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        plan: { code: 'ENTERPRISE', name: 'Enterprise', maxProjects: null },
      });
      prismaMock.project.count.mockResolvedValue(100);

      const mockCreatedProject = {
        id: 'proj-enterprise-1',
        name: dto.name,
        schemaName: 'proj_enterprise123456789012',
        deploymentRegion: dto.region,
        description: dto.description,
        ownerId: userId,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockTx.project.create.mockResolvedValue(mockCreatedProject);
      mockTx.apiKey.createMany.mockResolvedValue({ count: 2 });

      const result = await service.createProject(dto, userId);
      expect(result.project).toEqual(mockCreatedProject);
      // count might not even be called, or if called, maxProjects is null so it doesn't throw
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAllProjects', () => {
    const userId = 'user-uuid-123';

    it('should return all projects belonging to the user', async () => {
      const mockProjects = [
        {
          id: 'proj-1',
          name: 'project-one',
          schemaName: 'proj_111111111111',
          deploymentRegion: 'us-east-1',
          ownerId: userId,
          status: 'ACTIVE',
        },
        {
          id: 'proj-2',
          name: 'project-two',
          schemaName: 'proj_222222222222',
          deploymentRegion: 'eu-west-1',
          ownerId: userId,
          status: 'PENDING',
        },
      ];

      prismaMock.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.getAllProjects(userId);

      expect(prismaMock.project.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.project.findMany).toHaveBeenCalledWith({
        where: { ownerId: userId },
      });
      expect(result).toEqual(mockProjects);
    });

    it('should return an empty array if user has no projects', async () => {
      prismaMock.project.findMany.mockResolvedValue([]);

      const result = await service.getAllProjects(userId);

      expect(prismaMock.project.findMany).toHaveBeenCalledWith({
        where: { ownerId: userId },
      });
      expect(result).toEqual([]);
    });

    it('should propagate errors if findMany fails', async () => {
      const dbError = new Error('Database connection failed');
      prismaMock.project.findMany.mockRejectedValue(dbError);

      await expect(service.getAllProjects(userId)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('getRecentActivity', () => {
    const userId = 'user-123';
    const now = new Date('2026-11-08T12:00:00Z');

    it('should return mapped activity logs when they exist', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          userId,
          projectId: 'proj-1',
          projectName: 'My Project',
          type: 'PROJECT_CREATED',
          description: 'Project created',
          metadata: null,
          createdAt: now,
        },
      ];
      prismaMock.activityLog.findMany.mockResolvedValueOnce(mockLogs);

      const result = await service.getRecentActivity(userId);

      expect(prismaMock.activityLog.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('log-1');
      expect(result[0].createdAt).toBe(now.toISOString());
    });

    it('should backfill from projects if no activity logs exist', async () => {
      prismaMock.activityLog.findMany
        .mockResolvedValueOnce([]) // First query returns empty
        .mockResolvedValueOnce([
          {
            id: 'log-backfilled',
            userId,
            projectId: 'proj-1',
            projectName: 'Old Project',
            type: 'PROJECT_CREATED',
            description: 'Project created',
            metadata: null,
            createdAt: now,
          },
        ]);
      prismaMock.project.findMany.mockResolvedValueOnce([
        {
          id: 'proj-1',
          name: 'Old Project',
          createdAt: now,
        },
      ]);
      prismaMock.activityLog.createMany.mockResolvedValueOnce({ count: 1 });

      const result = await service.getRecentActivity(userId);

      expect(prismaMock.project.findMany).toHaveBeenCalledWith({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      expect(prismaMock.activityLog.createMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should return empty array if no logs and no projects exist', async () => {
      prismaMock.activityLog.findMany.mockResolvedValueOnce([]);
      prismaMock.project.findMany.mockResolvedValueOnce([]);

      const result = await service.getRecentActivity(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getProjectById', () => {
    const projectId = 'proj-123';
    const userId = 'user-abc';

    it('should return the project when found', async () => {
      const mockProject = {
        id: projectId,
        name: 'my-project',
        ownerId: userId,
        status: 'ACTIVE',
      };
      prismaMock.project.findFirst.mockResolvedValue(mockProject);

      const result = await service.getProjectById(projectId, userId);

      expect(prismaMock.project.findFirst).toHaveBeenCalledWith({
        where: { id: projectId, ownerId: userId },
      });
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException if project not found', async () => {
      prismaMock.project.findFirst.mockResolvedValue(null);

      await expect(
        service.getProjectById(projectId, userId),
      ).rejects.toThrow('Project not found');
    });
  });

  describe('getProjectOverview', () => {
    const projectId = 'proj-123';
    const userId = 'user-abc';
    const now = new Date('2026-11-19T12:00:00.000Z');

    it('should return complete overview data', async () => {
      const mockProject = {
        id: projectId,
        name: 'my-project',
        schemaName: 'proj_schema_123',
        deploymentRegion: 'us-east-1',
        ownerId: userId,
        status: 'ACTIVE',
        createdAt: now,
        owner: { email: 'owner@example.com' },
      };

      prismaMock.project.findFirst.mockResolvedValue(mockProject);
      prismaMock.project.findMany.mockResolvedValue([
        { id: projectId, name: 'my-project' },
      ]);
      prismaMock.projectUsage.findFirst.mockResolvedValue({
        dbBytes: 10485760n, // 10MB
        fileBytes: 5242880n, // 5MB
        apiRequests: 1500n,
      });
      prismaMock.activityLog.findMany.mockResolvedValue([
        {
          id: 'log-1',
          type: 'PROJECT_CREATED',
          description: 'Project created',
          projectName: 'my-project',
          createdAt: now,
        },
      ]);

      const result = await service.getProjectOverview(projectId, userId);

      expect(result.project.id).toBe(projectId);
      expect(result.project.name).toBe('my-project');
      expect(result.project.identifier).toBe('proj_schema_123');
      expect(result.project.status).toBe('active');
      expect(result.project.regionCode).toBe('US-EAST');
      expect(result.user.email).toBe('owner@example.com');
      expect(result.stats).toBeDefined();
      expect(result.charts).toHaveLength(2);
      expect(result.activity).toHaveLength(1);
      expect(result.health).toHaveLength(4);
    });

    it('should throw NotFoundException if project not found', async () => {
      prismaMock.project.findFirst.mockResolvedValue(null);

      await expect(
        service.getProjectOverview(projectId, userId),
      ).rejects.toThrow('Project not found');
    });
  });
});
