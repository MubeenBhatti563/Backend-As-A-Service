import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box } from "@mui/material";
import {
  getTableRelationships,
  TableDetailHeader,
  TableDetailTabs,
  TableRelationshipsView,
} from "@/features/database";

interface PageProps {
  params: Promise<{ id: string; tableId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tableId } = await params;
  return { title: `Relationships: ${decodeURIComponent(tableId)}` };
}

export default async function TableRelationshipsPage({ params }: PageProps) {
  const { id, tableId: rawTableName } = await params;
  const tableName = decodeURIComponent(rawTableName);

  const data = await getTableRelationships(id, tableName);
  if (!data) notFound();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <TableDetailHeader projectId={id} table={data.table} />
      <TableDetailTabs projectId={id} tableName={data.table.name} value="relationships" />
      <TableRelationshipsView projectId={id} relationshipsData={data} />
    </Box>
  );
}
