import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import * as crypto from 'crypto';

describe('ProjectService', () => {
  let service: ProjectService;
  let prismaMock: {
    $transaction: jest.Mock;
    project: {
      create: jest.Mock;
      findMany: jest.Mock;
    };
    apiKey: {
      createMany: jest.Mock;
    };
  };

  const mockTx = {
    project: {
      create: jest.fn(),
    },
    apiKey: {
      createMany: jest.fn(),
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
      },
      apiKey: {
        createMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: PrismaService, useValue: prismaMock },
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

    it('should create project and API keys inside a transaction', async () => {
      const mockCreatedProject = {
        id: 'proj-123',
        name: dto.name,
        schemaName: 'proj_abcdef123456',
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
          status: 'READY',
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
});

