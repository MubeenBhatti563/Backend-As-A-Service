import type { DatabaseOverview } from "./types";

export async function getDatabaseOverview(
  projectId: string,
): Promise<DatabaseOverview | null> {
  void projectId;

  return {
    stats: { size: "3.2 GB", totalTables: 12, activeConnections: 8 },
    tables: [
      {
        name: "users",
        rows: 2450,
        size: "12 MB",
        lastModified: "2m ago",
        rls: "active",
      },
      {
        name: "posts",
        rows: 8932,
        size: "45 MB",
        lastModified: "10m ago",
        rls: "active",
      },
      {
        name: "comments",
        rows: 15201,
        size: "28 MB",
        lastModified: "1h ago",
        rls: "disabled",
      },
      {
        name: "categories",
        rows: 24,
        size: "1 KB",
        lastModified: "1d ago",
        rls: "disabled",
      },
      {
        name: "orders",
        rows: 5678,
        size: "34 MB",
        lastModified: "2d ago",
        rls: "active",
      },
    ],
  };
}
