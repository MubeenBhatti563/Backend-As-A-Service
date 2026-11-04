export type ProjectStatus = "active" | "paused";
export type ProjectIconKey = "box" | "flask";

export interface Project {
  id: string;
  name: string;
  /** e.g. proj_ds_8932fa */
  identifier: string;
  description: string;
  region: string;
  status: ProjectStatus;
  dbSize: string;
  fileSize: string;
  /** Already formatted by the API/server, e.g. "Updated 2 min ago" or "Paused Oct 29, 2026". */
  lastActivity: string;
  /** ISO date, only used for sorting. */
  updatedAt: string;
  icon?: ProjectIconKey;
}

export type UsageIconKey = "database" | "files" | "api" | "realtime";

export interface UsageMetric {
  key: string;
  label: string;
  icon: UsageIconKey;
  used: number;
  limit: number;
  /** "GB" for storage; leave empty for plain counts. */
  unit?: string;
  /** Small footnote under the meter, e.g. "Monthly · Nov 1–30, 2026". */
  basis?: string;
}

export type ActivityIconKey = "updated" | "created" | "paused";

export interface ActivityEvent {
  id: string;
  icon: ActivityIconKey;
  description: string;
  project: string;
  /** Already formatted, e.g. "2 min ago". */
  time: string;
}

export interface AccountUser {
  name: string;
  email: string;
  plan: string;
  tier: string;
}
