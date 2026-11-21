import { describe, it, expect, afterEach } from 'vitest';
import { getProjectOverview } from './mock-data';

describe('mock-data getProjectOverview', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalMockFlag = process.env.NEXT_PUBLIC_ENABLE_MOCKS;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    if (originalMockFlag !== undefined) {
      process.env.NEXT_PUBLIC_ENABLE_MOCKS = originalMockFlag;
    } else {
      delete process.env.NEXT_PUBLIC_ENABLE_MOCKS;
    }
  });

  it('should return mock overview data in development or test environment', async () => {
    process.env.NODE_ENV = 'development';
    const data = await getProjectOverview('test-proj-123');
    expect(data.project.id).toBe('test-proj-123');
    expect(data.stats).toBeDefined();
    expect(data.charts).toBeDefined();
  });

  it('should throw an error in production if API fails and mocks are not enabled', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.NEXT_PUBLIC_ENABLE_MOCKS;

    await expect(getProjectOverview('test-proj-123')).rejects.toThrow(
      /Mock fallback is disabled in production/,
    );
  });
});
