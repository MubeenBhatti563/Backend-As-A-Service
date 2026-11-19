export type ProjectStatus = "active" | "paused" | "pending";
export type StatTone = "success" | "info";
export type ActivityIconKey = "user" | "database" | "function";
export type HealthStatus = "operational" | "degraded" | "down";

export interface ProjectInfo {
  id: string;
  name: string;
  /** e.g. proj_ds_8932fa (the project's schema name) */
  identifier: string;
  /** e.g. "US-East-1 (N. Virginia)" */
  region: string;
  /** Short badge for the mobile layout, e.g. "US-EAST" */
  regionCode: string;
  status: ProjectStatus;
  /** Already formatted, e.g. "Oct 24, 2025" */
  createdAt: string;
}

export interface ProjectOption {
  id: string;
  name: string;
}

export interface StatMetric {
  key: string;
  label: string;
  /** Already formatted, e.g. "12,847" or "2.4 GB" */
  value: string;
  /** Pill text, e.g. "+14.2%" or "30% limit" */
  change: string;
  tone: StatTone;
  /** The mobile design only shows three cards. */
  hideOnMobile?: boolean;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface ChartSeries {
  title: string;
  /** Mobile uses a different casing: "API Requests over time". */
  mobileTitle?: string;
  /** Used for the screen-reader summary, e.g. "requests per day". */
  unit: string;
  color: "primary" | "secondary";
  points: ChartPoint[];
  hideOnMobile?: boolean;
}

export interface ActivityEvent {
  id: string;
  icon: ActivityIconKey;
  title: string;
  /** Monospace second line: an email, a schema, a file name… */
  detail: string;
  /** Already formatted, e.g. "2m ago". The mobile layout drops " ago". */
  time: string;
}

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
  activity: ActivityEvent[];
  health: ServiceHealth[];
}
