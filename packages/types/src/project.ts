export interface CreateProjectInput {
  name: string;
  description?: string;
  region: string;
}

export interface ProjectData {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  schemaName: string;
  description: string | null;
  deploymentRegion: string;
  status: "ACTIVE" | "PAUSED" | "PENDING";
  ownerId: string;
}

export interface CreateProjectResponse {
  project: ProjectData;
  keys: {
    anon: string;
    service: string;
  };
}

export interface ActivityLogData {
  id: string;
  userId: string;
  projectId: string | null;
  projectName: string | null;
  type:
    | "PROJECT_CREATED"
    | "PROJECT_UPDATED"
    | "PROJECT_PAUSED"
    | "PROJECT_RESUMED"
    | "API_KEY_CREATED"
    | "API_KEY_REVOKED";
  description: string;
  metadata?: unknown;
  createdAt: string;
}

export type OverviewProjectStatus = "active" | "paused" | "pending";
export type ProjectStatus = OverviewProjectStatus;
export type StatTone = "success" | "info";
export type ActivityIconKey = "user" | "database" | "function";
export type HealthStatus = "operational" | "degraded" | "down";

export interface ProjectInfo {
  id: string;
  name: string;
  identifier: string;
  region: string;
  regionCode: string;
  status: OverviewProjectStatus;
  createdAt: string;
}

export interface ProjectOption {
  id: string;
  name: string;
}

export interface StatMetric {
  key: string;
  label: string;
  value: string;
  change: string;
  tone?: StatTone;
  hideOnMobile?: boolean;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface ChartSeries {
  title: string;
  mobileTitle?: string;
  unit: string;
  color: "primary" | "secondary";
  points: ChartPoint[];
  hideOnMobile?: boolean;
}

export interface OverviewActivityEvent {
  id: string;
  icon: ActivityIconKey;
  title: string;
  detail: string;
  time: string;
}
export type ActivityEvent = OverviewActivityEvent;

export interface ServiceHealth {
  id: string;
  name: string;
  status: HealthStatus;
}

export interface ProjectOverviewData {
  project: ProjectInfo;
  projects: ProjectOption[];
  user: { email: string };
  stats: StatMetric[];
  charts: ChartSeries[];
  activity: OverviewActivityEvent[];
  health: ServiceHealth[];
}
