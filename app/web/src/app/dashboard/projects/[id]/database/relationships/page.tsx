import type { Metadata } from "next";
import { Box } from "@mui/material";
import {
  DatabaseHeader,
  DatabaseTabs,
  RelationshipsView,
  getDatabaseOverview,
  getRelationshipsData,
} from "@/features/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Database Relationships" };

export default async function RelationshipsPage({ params }: PageProps) {
  const { id } = await params;
  const [data, overview] = await Promise.all([
    getRelationshipsData(id),
    getDatabaseOverview(id),
  ]);

  const stats = overview?.stats ?? {
    size: "0 B",
    totalTables: data.tables.length,
    activeConnections: 0,
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
      <DatabaseHeader
        projectId={id}
        stats={stats}
        currentSection="Relationships"
        title="Relationships"
      />
      <DatabaseTabs projectId={id} value="relationships" />
      <RelationshipsView data={data} />
    </Box>
  );
}
