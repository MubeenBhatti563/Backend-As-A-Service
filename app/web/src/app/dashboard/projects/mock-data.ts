import {
  AccountUser,
  ActivityEvent,
  Project,
  UsageMetric,
} from "@/types/projectPage";

export const MOCK_USER: AccountUser = {
  name: "Admin",
  email: "admin@devstack.com",
  plan: "Developer",
  tier: "Free",
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: "my-saas-app",
    name: "my-saas-app",
    identifier: "proj_ds_8932fa",
    description: "Production backend for application services",
    region: "US-East-1 (N. Virginia)",
    status: "active",
    dbSize: "2.4 GB",
    fileSize: "856 MB",
    lastActivity: "Updated 2 min ago",
    updatedAt: "2026-11-03T11:28:00Z",
  },
  {
    id: "commerce-api",
    name: "commerce-api",
    identifier: "proj_ds_b71e04",
    description: "Storefront, orders, and payment workflows",
    region: "EU-West-1 (Ireland)",
    status: "active",
    dbSize: "0.8 GB",
    fileSize: "544 MB",
    lastActivity: "Updated 35 min ago",
    updatedAt: "2026-11-03T10:55:00Z",
  },
  {
    id: "analytics-hub",
    name: "analytics-hub",
    identifier: "proj_ds_62c9ab",
    description: "Event ingestion and product analytics",
    region: "US-East-1 (N. Virginia)",
    status: "active",
    dbSize: "0.4 GB",
    fileSize: "400 MB",
    lastActivity: "Updated 2 hours ago",
    updatedAt: "2026-11-03T09:30:00Z",
  },
  {
    id: "sandbox",
    name: "sandbox",
    identifier: "proj_ds_e84d12",
    description: "Experiments and SDK integration tests",
    region: "AP-South-1 (Mumbai)",
    status: "paused",
    dbSize: "0.4 GB",
    fileSize: "200 MB",
    lastActivity: "Paused Oct 29, 2026",
    updatedAt: "2026-10-29T08:00:00Z",
    icon: "flask",
  },
];

export const MOCK_USAGE: UsageMetric[] = [
  {
    key: "db",
    label: "Database storage",
    icon: "database",
    used: 4,
    limit: 8,
    unit: "GB",
  },
  {
    key: "files",
    label: "File storage",
    icon: "files",
    used: 2,
    limit: 5,
    unit: "GB",
  },
  {
    key: "api",
    label: "API requests",
    icon: "api",
    used: 600000,
    limit: 1000000,
    basis: "Monthly · Nov 1–30, 2026",
  },
  {
    key: "realtime",
    label: "Realtime connections",
    icon: "realtime",
    used: 28,
    limit: 100,
    basis: "Concurrent · current connections",
  },
];

export const MOCK_ACTIVITY: ActivityEvent[] = [
  {
    id: "1",
    icon: "updated",
    description: "Project configuration updated",
    project: "my-saas-app",
    time: "2 min ago",
  },
  {
    id: "2",
    icon: "created",
    description: "Project created",
    project: "commerce-api",
    time: "Yesterday",
  },
  {
    id: "3",
    icon: "paused",
    description: "Project paused",
    project: "sandbox",
    time: "Oct 29",
  },
];
