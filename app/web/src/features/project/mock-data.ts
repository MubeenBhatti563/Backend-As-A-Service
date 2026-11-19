import type { ProjectOverviewData } from "./types";

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const points = (values: number[]) => WEEK.map((label, i) => ({ label, value: values[i] ?? 0 }));

/**
 * Sample data that matches the Figma frame. Replace the body with real queries:
 *  - project            -> prisma.project.findFirst({ where: { id, ownerId } })
 *  - stats / charts     -> ProjectUsage rows for the current period
 *  - activity           -> ActivityLog (projectId = id), newest first
 */
export async function getProjectOverview(id: string): Promise<ProjectOverviewData> {
  return {
    project: {
      id,
      name: "my-saas-app",
      identifier: "proj_ds_8932fa",
      region: "US-East-1 (N. Virginia)",
      regionCode: "US-EAST",
      status: "active",
      createdAt: "Oct 24, 2025",
    },
    projects: [
      { id, name: "my-saas-app" },
      { id: "proj_ds_71c0de", name: "analytics-lab" },
    ],
    user: { email: "admin@devstack.com" },
    stats: [
      { key: "api", label: "API Requests (Today)", value: "12,847", change: "+14.2%", tone: "success" },
      { key: "db", label: "Database Size", value: "2.4 GB", change: "30% limit", tone: "info" },
      { key: "storage", label: "Storage Usage", value: "856 MB", change: "8.5% limit", tone: "success", hideOnMobile: true },
      { key: "users", label: "Active Users", value: "1,203", change: "+5.8%", tone: "success" },
    ],
    charts: [
      { title: "API Requests Over Time", mobileTitle: "API Requests over time", unit: "requests", color: "primary", points: points([80, 100, 70, 120, 140, 110, 160]) },
      { title: "Database Usage (MB)", unit: "MB", color: "secondary", hideOnMobile: true, points: points([40, 60, 75, 90, 115, 130, 150]) },
    ],
    activity: [
      { id: "a1", icon: "user", title: "New user registered", detail: "alice@devstack.com", time: "2m ago" },
      { id: "a2", icon: "database", title: "Table users created", detail: "schema: public", time: "15m ago" },
      { id: "a3", icon: "function", title: "Function deployed", detail: "sendWelcomeEmail (Node.js)", time: "1h ago" },
      { id: "a4", icon: "database", title: "File uploaded", detail: "avatar_29.png (142 KB)", time: "3h ago" },
    ],
    health: [
      { id: "gw", name: "API Gateway", status: "operational" },
      { id: "db", name: "Database Service", status: "operational" },
      { id: "rt", name: "Realtime WebSockets", status: "operational" },
      { id: "cdn", name: "Storage CDN", status: "operational" },
    ],
  };
}
