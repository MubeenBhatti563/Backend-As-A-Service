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
  dailyUsage: Array<{ day: Date; apiRequests: bigint; dbBytes: bigint }>;
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
  dailyUsage,
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

  const dbSizeFormatted = usage ? formatBytes(usage.dbBytes) : '0 B';
  const storageFormatted = usage ? formatBytes(usage.fileBytes) : '0 B';
  const apiRequestsCount = usage ? Number(usage.apiRequests) : 0;

  // Clean domain metrics with UI-only fields (tone, hideOnMobile) stripped
  const stats = [
    {
      key: 'api',
      label: 'API Requests (Current Period)',
      value: apiRequestsCount.toLocaleString(),
      change: 'Current period',
    },
    {
      key: 'db',
      label: 'Database Size',
      value: dbSizeFormatted,
      change: 'Current period',
    },
    {
      key: 'storage',
      label: 'Storage Usage',
      value: storageFormatted,
      change: 'Current period',
    },
  ];

  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now);
    day.setUTCHours(0, 0, 0, 0);
    day.setUTCDate(day.getUTCDate() - (6 - index));
    return day;
  });
  const byDay = new Map(dailyUsage.map((usageRow) => [usageRow.day.toISOString().slice(0, 10), usageRow]));
  let lastDbBytes = 0;
  const requestsPoints = days.map((day) => {
    const row = byDay.get(day.toISOString().slice(0, 10));
    return { label: day.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }), value: Number(row?.apiRequests ?? 0n) };
  });
  const dbPoints = days.map((day) => {
    const row = byDay.get(day.toISOString().slice(0, 10));
    if (row) lastDbBytes = Number(row.dbBytes);
    return { label: day.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }), value: lastDbBytes / (1024 * 1024) };
  });
  const charts = [
    {
      title: 'API Requests Over Time',
      mobileTitle: 'API Requests over time',
      unit: 'requests',
      color: 'primary' as const,
      points: requestsPoints,
    },
    {
      title: 'Database Usage (MB)',
      unit: 'MB',
      color: 'secondary' as const,
      points: dbPoints,
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

  // The API has no health probe records. Never infer component health from a
  // project's lifecycle status; the UI renders an explicit unavailable state.
  const health: [] = [];

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
