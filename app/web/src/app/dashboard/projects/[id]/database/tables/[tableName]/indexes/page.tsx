import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box } from "@mui/material";
import {
  getTableIndexes,
  TableDetailHeader,
  TableDetailTabs,
  TableIndexesView,
} from "@/features/database";

interface PageProps {
  params: Promise<{ id: string; tableName: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tableName } = await params;
  return { title: `Indexes: ${decodeURIComponent(tableName)}` };
}

export default async function TableIndexesPage({ params }: PageProps) {
  const { id, tableName: rawTableName } = await params;
  const tableName = decodeURIComponent(rawTableName);

  const data = await getTableIndexes(id, tableName);
  if (!data) notFound();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <TableDetailHeader projectId={id} table={data.table} />
      <TableDetailTabs projectId={id} tableName={data.table.name} value="indexes" />
      <TableIndexesView projectId={id} indexesData={data} />
    </Box>
  );
}
