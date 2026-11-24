import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box } from "@mui/material";
import {
  DatabaseHeader,
  DatabaseIndexesView,
  DatabaseTabs,
  getDatabaseIndexes,
} from "@/features/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Database Indexes" };

export default async function IndexesPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getDatabaseIndexes(id);
  if (!data) notFound();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
      <DatabaseHeader
        projectId={id}
        stats={data.databaseStats}
        currentSection="Indexes"
        title="Indexes"
      />
      <DatabaseTabs projectId={id} value="indexes" />
      <DatabaseIndexesView data={data} />
    </Box>
  );
}
