import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box } from "@mui/material";
import {
  DatabaseTabs,
  SqlEditorHeader,
  SqlEditorView,
  getDatabaseOverview,
} from "@/features/database";
import type { SqlEditorData } from "@/features/database/components/sql-editor/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "SQL Editor" };

export default async function SqlEditorPage({ params }: PageProps) {
  const { id } = await params;
  const database = await getDatabaseOverview(id);
  if (!database) notFound();

  const editorData: SqlEditorData = {
    schema: "public",
    initialQuery: "SELECT * FROM users LIMIT 50;",
    history: [],
    result: null,
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
      <SqlEditorHeader projectId={id} />
      <DatabaseTabs projectId={id} value="sql-editor" />
      <SqlEditorView projectId={id} data={editorData} tables={database.tables} />
    </Box>
  );
}
