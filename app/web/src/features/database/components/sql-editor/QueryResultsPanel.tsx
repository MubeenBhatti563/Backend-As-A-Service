"use client";

import { Box, Typography } from "@mui/material";
import { SURFACE } from "../../constants";
import type { QueryResult } from "./types";
import { SqlResultsGrid } from "./SqlResultsGrid";

export function QueryResultsPanel({ result }: { result: QueryResult | null }) {
  const count = result?.rows.length ?? 0;
  return (
    <Box aria-live="polite" sx={{ bgcolor: SURFACE, border: "1px solid", borderColor: "border.default", borderRadius: "12px", overflow: "hidden", minWidth: 0 }}>
      {result ? <>
        <SqlResultsGrid columns={result.columns} rows={result.rows} />
        <Box sx={{ px: 5, py: "10px", bgcolor: "background.elevated" }}><Typography variant="caption" component="div" sx={{ fontSize: 12, lineHeight: "16px", color: "success.main" }}>✓ {count} {count === 1 ? "row" : "rows"} returned · {result.executionMs}ms execution time</Typography></Box>
      </> : <Typography variant="body2" align="center" sx={{ py: 8, px: 2, color: "text.disabled" }}>Run a query to see results.</Typography>}
    </Box>
  );
}
