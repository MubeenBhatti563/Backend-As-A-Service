"use client";

import { useState } from "react";
import { Alert, Box, Stack, Snackbar } from "@mui/material";
import type { QueryHistoryItem, QueryResult, SqlEditorData } from "./types";
import { QueryHistoryPanel } from "./QueryHistoryPanel";
import { QueryResultsPanel } from "./QueryResultsPanel";
import { SqlCodeEditor } from "./SqlCodeEditor";
import { SqlToolbar } from "./SqlToolbar";

export function SqlEditorView({ data }: { data: SqlEditorData }) {
  const [query, setQuery] = useState(data.initialQuery);
  const [history, setHistory] = useState(data.history);
  const [activeId, setActiveId] = useState<string | null>(data.history[0]?.id ?? null);
  const [result, setResult] = useState<QueryResult | null>(data.result);
  const [notice, setNotice] = useState("");

  const selectHistory = (item: QueryHistoryItem) => {
    setActiveId(item.id);
    setQuery(item.sql);
  };
  const run = () => setNotice("SQL execution is not connected yet. Your query was not sent to the database.");
  const clear = () => {
    setQuery("");
    setActiveId(null);
    setResult(null);
  };
  const save = () => {
    const sql = query.trim();
    if (!sql) return;
    const id = crypto.randomUUID();
    const item: QueryHistoryItem = {
      id,
      preview: sql.replace(/\s+/g, " ").slice(0, 52),
      sql,
      ranAt: "Saved just now",
    };
    setHistory((items) => [item, ...items]);
    setActiveId(id);
    setNotice("Query saved in this session’s history.");
  };

  return (
    <>
      <SqlToolbar onRun={run} onClear={clear} onSave={save} />
      <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 2.5, md: 4 }} useFlexGap sx={{ alignItems: "stretch" }}>
        <Box sx={{ order: { xs: 2, md: 1 } }}>
          <QueryHistoryPanel items={history} activeId={activeId} onSelect={selectHistory} />
        </Box>
        <Stack spacing={4} useFlexGap sx={{ flex: 1, minWidth: 0, order: { xs: 1, md: 2 } }}>
          <SqlCodeEditor value={query} onChange={setQuery} schema="public" />
          <QueryResultsPanel result={result} />
        </Stack>
      </Stack>
      <Snackbar open={Boolean(notice)} autoHideDuration={4500} onClose={() => setNotice("")}>
        <Alert severity="info" onClose={() => setNotice("")}>{notice}</Alert>
      </Snackbar>
    </>
  );
}
