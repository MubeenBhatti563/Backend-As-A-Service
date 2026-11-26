import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box } from "@mui/material";
import {
  getTablePolicies,
  TableDetailHeader,
  TableDetailTabs,
  TablePoliciesView,
} from "@/features/database";

interface PageProps {
  params: Promise<{ id: string; tableName: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tableName } = await params;
  return { title: `Policies: ${decodeURIComponent(tableName)}` };
}

export default async function TablePoliciesPage({ params }: PageProps) {
  const { id, tableName: rawTableName } = await params;
  const tableName = decodeURIComponent(rawTableName);

  const data = await getTablePolicies(id, tableName);
  if (!data) notFound();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <TableDetailHeader projectId={id} table={data.table} />
      <TableDetailTabs projectId={id} tableName={data.table.name} value="policies" />
      <TablePoliciesView projectId={id} policiesData={data} />
    </Box>
  );
}
