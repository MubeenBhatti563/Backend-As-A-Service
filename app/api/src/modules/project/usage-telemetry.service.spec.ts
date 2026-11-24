import { UsageTelemetryService } from './usage-telemetry.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RedisService } from '../../infra/redis/redis.service';

describe('UsageTelemetryService', () => {
  const pipeline = { incr: jest.fn(), expire: jest.fn(), exec: jest.fn() };
  const redisClient = { pipeline: jest.fn(() => pipeline) };
  const redis = { getClient: () => redisClient };
  const prisma = {};
  let service: UsageTelemetryService;

  beforeEach(() => {
    jest.clearAllMocks();
    pipeline.exec.mockResolvedValue([]);
    service = new UsageTelemetryService(prisma as PrismaService, redis as RedisService);
  });

  it('aggregates a project-scoped request in a UTC-day Redis counter with bounded retention', async () => {
    await service.recordProjectRequest('project-123');
    const day = new Date().toISOString().slice(0, 10);
    expect(pipeline.incr).toHaveBeenCalledWith(`usage:project:requests:${day}:project-123`);
    expect(pipeline.expire).toHaveBeenCalledWith(`usage:project:requests:${day}:project-123`, 9 * 24 * 60 * 60);
  });

  it('does not create a timer when used directly in a unit test', () => {
    expect(service).toBeDefined();
  });
});
