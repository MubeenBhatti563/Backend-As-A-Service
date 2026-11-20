import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box } from "@mui/material";
import {
  DatabaseHeader,
  DatabaseTabs,
  DatabaseTablesView,
  getDatabaseOverview,
} from "@/features/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Database Tables" };

export default async function DatabasePage({ params }: PageProps) {
  const { id } = await params;
  const data = await getDatabaseOverview(id);
  if (!data) notFound();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <DatabaseHeader projectId={id} stats={data.stats} />
      <DatabaseTabs projectId={id} value="tables" />
      <DatabaseTablesView projectId={id} tables={data.tables} />
    </Box>
  );
}
