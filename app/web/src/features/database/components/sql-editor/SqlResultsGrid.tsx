"use client";

import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import type { GridColumn, GridRow } from "../../types";

export function SqlResultsGrid({ columns, rows }: { columns: GridColumn[]; rows: GridRow[] }) {
  return (
    <Box sx={{ overflowX: "auto", overscrollBehaviorX: "contain", scrollbarWidth: "thin", "&::-webkit-scrollbar": { height: 8 } }}>
      <Table sx={{ tableLayout: "fixed", minWidth: 640 }} aria-label="SQL query results">
        <TableHead><TableRow sx={{ bgcolor: "background.elevated" }}>{columns.map((column) => <TableCell key={column.key} sx={{ py: 3, px: 2.5, color: "text.disabled", fontSize: 11, lineHeight: "14px", fontWeight: 600, whiteSpace: "nowrap" }}>{column.label}</TableCell>)}</TableRow></TableHead>
        <TableBody>
          {rows.length ? rows.map((row) => <TableRow key={row.id} hover>{columns.map((column) => <TableCell key={column.key} sx={{ py: 3, px: 2.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row[column.key] ?? ""}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={columns.length || 1} align="center" sx={{ py: 8, color: "text.disabled" }}>No rows returned.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </Box>
  );
}
