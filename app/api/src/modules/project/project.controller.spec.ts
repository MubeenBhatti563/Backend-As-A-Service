import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

describe('ProjectController', () => {
  let controller: ProjectController;
  let projectServiceMock: {
    createProject: jest.Mock;
    getAllProjects: jest.Mock;
    getRecentActivity: jest.Mock;
  };

  beforeEach(async () => {
    projectServiceMock = {
      createProject: jest.fn(),
      getAllProjects: jest.fn(),
      getRecentActivity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [{ provide: ProjectService, useValue: projectServiceMock }],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createProject', () => {
    const dto = {
      name: 'alpha-db',
      region: 'us-east-1' as const,
      description: 'Alpha database project',
    };
    const userId = 'user-abc-123';

    it('should delegate to projectService.createProject and return the result', async () => {
      const mockResult = {
        project: {
          id: 'proj-1',
          name: 'alpha-db',
          schemaName: 'proj_abc123',
          deploymentRegion: 'us-east-1',
          description: 'Alpha database project',
          ownerId: userId,
          status: 'PENDING',
        },
        keys: {
          anon: 'pk_live_mock_anon_key',
          service: 'sk_live_mock_service_key',
        },
      };

      projectServiceMock.createProject.mockResolvedValue(mockResult);

      const result = await controller.createProject(dto, userId);

      expect(projectServiceMock.createProject).toHaveBeenCalledTimes(1);
      expect(projectServiceMock.createProject).toHaveBeenCalledWith(dto, userId);
      expect(result).toEqual(mockResult);
    });

    it('should propagate errors from projectService.createProject', async () => {
      const error = new Error('Creation failed');
      projectServiceMock.createProject.mockRejectedValue(error);

      await expect(controller.createProject(dto, userId)).rejects.toThrow(
        'Creation failed',
      );
    });
  });

  describe('getAllProjects', () => {
    const userId = 'user-abc-123';

    it('should delegate to projectService.getAllProjects and return projects list', async () => {
      const mockProjects = [
        {
          id: 'proj-1',
          name: 'alpha-db',
          schemaName: 'proj_abc123',
          deploymentRegion: 'us-east-1',
          ownerId: userId,
          status: 'READY',
        },
      ];

      projectServiceMock.getAllProjects.mockResolvedValue(mockProjects);

      const result = await controller.getAllProjects(userId);

      expect(projectServiceMock.getAllProjects).toHaveBeenCalledTimes(1);
      expect(projectServiceMock.getAllProjects).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockProjects);
    });

    it('should propagate errors from projectService.getAllProjects', async () => {
      const error = new Error('Fetch failed');
      projectServiceMock.getAllProjects.mockRejectedValue(error);

      await expect(controller.getAllProjects(userId)).rejects.toThrow(
        'Fetch failed',
      );
    });
  });

  describe('getRecentActivity', () => {
    const userId = 'user-abc-123';

    it('should delegate to projectService.getRecentActivity and return activities list', async () => {
      const mockActivities = [
        {
          id: 'act-1',
          userId,
          projectId: 'proj-1',
          projectName: 'alpha-db',
          type: 'PROJECT_CREATED',
          description: 'Project created',
          createdAt: '2026-11-08T12:00:00.000Z',
        },
      ];

      projectServiceMock.getRecentActivity.mockResolvedValue(mockActivities);

      const result = await controller.getRecentActivity(userId);

      expect(projectServiceMock.getRecentActivity).toHaveBeenCalledTimes(1);
      expect(projectServiceMock.getRecentActivity).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockActivities);
    });

    it('should propagate errors from projectService.getRecentActivity', async () => {
      const error = new Error('Activity fetch failed');
      projectServiceMock.getRecentActivity.mockRejectedValue(error);

      await expect(controller.getRecentActivity(userId)).rejects.toThrow(
        'Activity fetch failed',
      );
    });
  });
});

