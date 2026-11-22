import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box } from "@mui/material";
import {
  getTableDetail,
  TableDetailHeader,
  TableDetailTabs,
  TableDataView,
} from "@/features/database";

interface PageProps {
  params: Promise<{ id: string; tableName: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tableName } = await params;
  return { title: `Table: ${decodeURIComponent(tableName)}` };
}

export default async function TableDetailPage({ params }: PageProps) {
  const { id, tableName: rawTableName } = await params;
  const tableName = decodeURIComponent(rawTableName);

  const detail = await getTableDetail(id, tableName);
  if (!detail) notFound();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <TableDetailHeader projectId={id} table={detail.table} />
      <TableDetailTabs projectId={id} tableName={detail.table.name} value="data" />
      <TableDataView projectId={id} detail={detail} />
    </Box>
  );
}
