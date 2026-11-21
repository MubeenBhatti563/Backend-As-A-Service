import {
  formatBytes,
  presentProjectOverview,
  timeAgo,
} from './project-overview.presenter';

describe('ProjectOverviewPresenter', () => {
  describe('formatBytes', () => {
    it('should format megabytes correctly', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(52428800)).toBe('50 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(formatBytes(1073741824)).toBe('1.0 GB');
      expect(formatBytes(2684354560n)).toBe('2.5 GB');
    });
  });

  describe('timeAgo', () => {
    it('should calculate relative time strings', () => {
      const now = new Date('2026-11-21T12:00:00Z');
      const justNow = new Date('2026-11-21T11:59:45Z');
      const minsAgo = new Date('2026-11-21T11:45:00Z');
      const hoursAgo = new Date('2026-11-21T09:00:00Z');
      const daysAgo = new Date('2026-11-19T12:00:00Z');

      expect(timeAgo(justNow, now)).toBe('Just now');
      expect(timeAgo(minsAgo, now)).toBe('15m ago');
      expect(timeAgo(hoursAgo, now)).toBe('3h ago');
      expect(timeAgo(daysAgo, now)).toBe('2d ago');
    });
  });

  describe('presentProjectOverview', () => {
    const fixedNow = new Date('2026-11-21T12:00:00Z');

    it('should decouple UI from API and not return hideOnMobile or tone fields', () => {
      const mockProject = {
        id: 'proj-1',
        name: 'test-project',
        schemaName: 'proj_schema_1',
        deploymentRegion: 'us-east-1',
        status: 'ACTIVE',
        createdAt: new Date('2026-10-01T00:00:00Z'),
      };

      const result = presentProjectOverview({
        project: mockProject,
        projects: [{ id: 'proj-1', name: 'test-project' }],
        userEmail: 'dev@test.com',
        usage: {
          dbBytes: 10485760n,
          fileBytes: 20971520n,
          apiRequests: 5000n,
        },
        activityLogs: [
          {
            id: 'act-1',
            type: 'PROJECT_CREATED',
            description: 'Created',
            createdAt: fixedNow,
          },
        ],
        now: fixedNow,
      });

      expect(result.project.regionCode).toBe('US-EAST');
      expect(result.project.status).toBe('active');
      expect(result.stats).toBeDefined();

      // Verify that UI-only fields (tone, hideOnMobile) are stripped from API response DTOs
      for (const stat of result.stats) {
        expect(stat).not.toHaveProperty('tone');
        expect(stat).not.toHaveProperty('hideOnMobile');
      }

      for (const chart of result.charts) {
        expect(chart).not.toHaveProperty('hideOnMobile');
      }

      expect(result.activity).toHaveLength(1);
      expect(result.health).toHaveLength(4);
    });
  });
});
