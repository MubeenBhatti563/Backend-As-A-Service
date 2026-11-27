"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Stack, Snackbar } from "@mui/material";
import type { QueryHistoryItem, QueryResult, SqlEditorData } from "./types";
import { QueryHistoryPanel } from "./QueryHistoryPanel";
import { QueryResultsPanel } from "./QueryResultsPanel";
import { SqlCodeEditor } from "./SqlCodeEditor";
import { SqlToolbar } from "./SqlToolbar";
import { executeDatabaseQuery } from "../../table.client-api";
import { getErrorMessage } from "@/lib/get-error-message";

interface Props {
  projectId: string;
  data: SqlEditorData;
  tables?: Array<{ name: string; columns?: Array<{ name: string; type?: string }> }>;
}

export function SqlEditorView({ projectId, data, tables = [] }: Props) {
  const [query, setQuery] = useState(data.initialQuery);
  const [history, setHistory] = useState<QueryHistoryItem[]>(data.history);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [result, setResult] = useState<QueryResult | null>(data.result);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  // Load persisted history from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`baas_sql_history_${projectId}`);
      if (stored) {
        const parsed = JSON.parse(stored) as QueryHistoryItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTimeout(() => {
            setHistory(parsed);
            setActiveId(parsed[0]?.id ?? null);
          }, 0);
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, [projectId]);

  const persistHistory = (newItems: QueryHistoryItem[]) => {
    setHistory(newItems);
    try {
      localStorage.setItem(`baas_sql_history_${projectId}`, JSON.stringify(newItems.slice(0, 50)));
    } catch {
      // Ignore localStorage write errors
    }
  };

  const selectHistory = (item: QueryHistoryItem) => {
    setActiveId(item.id);
    setQuery(item.sql);
  };

  const run = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setNotice("Enter a SQL query to run.");
      return;
    }

    setIsExecuting(true);
    setQueryError(null);

    try {
      const data = await executeDatabaseQuery(projectId, trimmed);

      const columns = data.columns.map((col) => ({
        key: col,
        label: col,
      }));

      setResult({
        columns,
        rows: data.rows,
        executionMs: data.executionMs,
        rowCount: data.rowCount,
        command: data.command,
      });

      // Add to query history
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const id = crypto.randomUUID();
      const historyItem: QueryHistoryItem = {
        id,
        preview: trimmed.replace(/\s+/g, " ").slice(0, 52),
        sql: trimmed,
        ranAt: timeStr,
      };

      persistHistory([historyItem, ...history.filter((h) => h.sql !== trimmed)]);
      setActiveId(id);
    } catch (err: unknown) {
      setQueryError(getErrorMessage(err, "Failed to execute query."));
      setResult(null);
    } finally {
      setIsExecuting(false);
    }
  };

  const clear = () => {
    setQuery("");
    setActiveId(null);
    setResult(null);
    setQueryError(null);
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
    persistHistory([item, ...history.filter((h) => h.sql !== sql)]);
    setActiveId(id);
    setNotice("Query saved to history.");
  };

  return (
    <>
      <SqlToolbar
        onRun={run}
        onClear={clear}
        onSave={save}
        running={isExecuting}
        runDisabled={isExecuting || !query.trim()}
      />
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 2.5, md: 4 }}
        useFlexGap
        sx={{ alignItems: "stretch" }}
      >
        <Box sx={{ order: { xs: 2, md: 1 } }}>
          <QueryHistoryPanel
            items={history}
            activeId={activeId}
            onSelect={selectHistory}
          />
        </Box>
        <Stack
          spacing={4}
          useFlexGap
          sx={{ flex: 1, minWidth: 0, order: { xs: 1, md: 2 } }}
        >
          <SqlCodeEditor
            value={query}
            onChange={setQuery}
            schema="public"
            onRun={run}
            tables={tables}
          />
          <QueryResultsPanel
            result={result}
            executing={isExecuting}
            error={queryError}
          />
        </Stack>
      </Stack>
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={4000}
        onClose={() => setNotice("")}
      >
        <Alert severity="info" onClose={() => setNotice("")}>
          {notice}
        </Alert>
      </Snackbar>
    </>
  );
}
