export interface ProjectOverviewPresenterParams {
  project: {
    id: string;
    name: string;
    schemaName: string;
    deploymentRegion: string;
    status: string;
    createdAt: Date;
  };
  projects: Array<{ id: string; name: string }>;
  userEmail?: string;
  usage?: {
    dbBytes: bigint | number;
    fileBytes: bigint | number;
    apiRequests: bigint | number;
  } | null;
  activityLogs: Array<{
    id: string;
    type: string;
    description: string;
    projectName?: string | null;
    createdAt: Date;
  }>;
  now?: Date;
}

export function formatBytes(bytes: bigint | number): string {
  const b = typeof bytes === 'bigint' ? Number(bytes) : bytes;
  if (b >= 1024 * 1024 * 1024) {
    return `${(b / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
  return `${Math.max(1, Math.round(b / (1024 * 1024)))} MB`;
}

export function timeAgo(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
}

const REGION_LABELS: Record<string, { label: string; code: string }> = {
  'us-east-1': { label: 'US-East-1 (N. Virginia)', code: 'US-EAST' },
  'eu-central-1': { label: 'EU-Central-1 (Frankfurt)', code: 'EU-CENT' },
  'ap-southeast-1': { label: 'AP-Southeast-1 (Singapore)', code: 'AP-SE' },
};

export function presentProjectOverview({
  project,
  projects,
  userEmail,
  usage,
  activityLogs,
  now = new Date(),
}: ProjectOverviewPresenterParams) {
  const regionInfo = REGION_LABELS[project.deploymentRegion] ?? {
    label: project.deploymentRegion,
    code: project.deploymentRegion.toUpperCase().slice(0, 8),
  };

  const createdAtFormatted = project.createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const dbSizeFormatted = usage ? formatBytes(usage.dbBytes) : '0 MB';
  const storageFormatted = usage ? formatBytes(usage.fileBytes) : '0 MB';
  const apiRequestsCount = usage ? Number(usage.apiRequests) : 0;

  // Clean domain metrics with UI-only fields (tone, hideOnMobile) stripped
  const stats = [
    {
      key: 'api',
      label: 'API Requests (Today)',
      value: apiRequestsCount.toLocaleString(),
      change: '+0.0%',
    },
    {
      key: 'db',
      label: 'Database Size',
      value: dbSizeFormatted,
      change: '0% limit',
    },
    {
      key: 'storage',
      label: 'Storage Usage',
      value: storageFormatted,
      change: '0% limit',
    },
    {
      key: 'users',
      label: 'Active Users',
      value: '0',
      change: '+0.0%',
    },
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDayIdx = (now.getDay() + 6) % 7; // Monday = 0
  const pointsApi = weekDays.map((label, idx) => ({
    label,
    value:
      idx <= currentDayIdx
        ? Math.round(apiRequestsCount / (currentDayIdx + 1))
        : 0,
  }));
  const pointsDb = weekDays.map((label, idx) => ({
    label,
    value:
      idx <= currentDayIdx
        ? Math.round(Number(usage?.dbBytes ?? 0n) / (1024 * 1024))
        : 0,
  }));

  // Clean chart series with UI-only fields (hideOnMobile) stripped
  const charts = [
    {
      title: 'API Requests Over Time',
      mobileTitle: 'API Requests over time',
      unit: 'requests',
      color: 'primary' as const,
      points: pointsApi,
    },
    {
      title: 'Database Usage (MB)',
      unit: 'MB',
      color: 'secondary' as const,
      points: pointsDb,
    },
  ];

  const activity = activityLogs.map((log) => ({
    id: log.id,
    icon: (log.type === 'PROJECT_CREATED'
      ? 'database'
      : log.type === 'API_KEY_CREATED'
        ? 'user'
        : 'function') as 'database' | 'user' | 'function',
    title: log.description,
    detail: log.projectName ?? project.schemaName,
    time: timeAgo(log.createdAt, now),
  }));

  if (activity.length === 0) {
    activity.push({
      id: `created-${project.id}`,
      icon: 'database',
      title: 'Project provisioned',
      detail: `schema: ${project.schemaName}`,
      time: timeAgo(project.createdAt, now),
    });
  }

  const isProvisioned = project.status === 'ACTIVE';

  const health = [
    { id: 'gw', name: 'API Gateway', status: 'operational' as const },
    {
      id: 'db',
      name: 'Database Service',
      status: isProvisioned
        ? ('operational' as const)
        : ('degraded' as const),
    },
    { id: 'fn', name: 'Functions Runtime', status: 'operational' as const },
    { id: 'auth', name: 'Auth Service', status: 'operational' as const },
  ];

  return {
    project: {
      id: project.id,
      name: project.name,
      identifier: project.schemaName,
      region: regionInfo.label,
      regionCode: regionInfo.code,
      status: (project.status === 'ACTIVE'
        ? 'active'
        : project.status === 'PAUSED'
          ? 'paused'
          : 'pending') as 'active' | 'paused' | 'pending',
      createdAt: createdAtFormatted,
    },
    projects: projects.map((p) => ({ id: p.id, name: p.name })),
    user: { email: userEmail ?? '' },
    stats,
    charts,
    activity,
    health,
  };
}
