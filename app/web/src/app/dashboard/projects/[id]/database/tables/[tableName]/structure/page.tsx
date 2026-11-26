import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box } from "@mui/material";
import {
  getTableStructure,
  TableDetailHeader,
  TableDetailTabs,
  TableStructureView,
} from "@/features/database";

interface PageProps {
  params: Promise<{ id: string; tableName: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tableName } = await params;
  return { title: `Structure: ${decodeURIComponent(tableName)}` };
}

export default async function TableStructurePage({ params }: PageProps) {
  const { id, tableName: rawTableName } = await params;
  const tableName = decodeURIComponent(rawTableName);

  const structure = await getTableStructure(id, tableName);
  if (!structure) notFound();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <TableDetailHeader projectId={id} table={structure.table} />
      <TableDetailTabs projectId={id} tableName={structure.table.name} value="structure" />
      <TableStructureView projectId={id} structure={structure} />
    </Box>
  );
}
