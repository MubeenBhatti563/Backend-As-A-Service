"use client";

import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { IconCheck, IconClock } from "@tabler/icons-react";
import { SURFACE } from "../../constants";
import type { QueryResult } from "./types";
import { SqlResultsGrid } from "./SqlResultsGrid";

interface Props {
  result: QueryResult | null;
  executing?: boolean;
  error?: string | null;
}

export function QueryResultsPanel({ result, executing = false, error = null }: Props) {
  const count = result?.rowCount ?? result?.rows.length ?? 0;

  return (
    <Box
      aria-live="polite"
      sx={{
        bgcolor: SURFACE,
        border: "1px solid",
        borderColor: error ? "error.main" : "border.default",
        borderRadius: "12px",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      {executing ? (
        <Box
          sx={{
            py: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            color: "text.secondary",
          }}
        >
          <CircularProgress size={28} color="inherit" />
          <Typography variant="body2">Executing SQL query…</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ p: 3 }}>
          <Alert
            severity="error"
            sx={{
              borderRadius: "8px",
              typography: "code",
              fontSize: 13,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {error}
          </Alert>
        </Box>
      ) : result ? (
        <>
          <SqlResultsGrid columns={result.columns} rows={result.rows} />
          <Box
            sx={{
              px: 3,
              py: 1.5,
              bgcolor: "background.elevated",
              borderTop: "1px solid",
              borderColor: "border.default",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconCheck size={16} color="#34D399" />
              <Typography
                variant="caption"
                sx={{ fontSize: 12, lineHeight: "16px", color: "success.main", fontWeight: 600 }}
              >
                {result.command
                  ? `${result.command} completed (${count} ${count === 1 ? "row" : "rows"} affected)`
                  : `${count} ${count === 1 ? "row" : "rows"} returned`}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.disabled" }}>
              <IconClock size={14} />
              <Typography variant="caption" sx={{ fontSize: 12, typography: "code" }}>
                {result.executionMs}ms
              </Typography>
            </Box>
          </Box>
        </>
      ) : (
        <Typography variant="body2" align="center" sx={{ py: 8, px: 2, color: "text.disabled" }}>
          Run a query to see results.
        </Typography>
      )}
    </Box>
  );
}

