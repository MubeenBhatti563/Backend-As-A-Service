"use client";

import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import type { SqlResultColumn, SqlResultRow } from "./types";

function renderCellValue(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function SqlResultsGrid({
  columns,
  rows,
}: {
  columns: SqlResultColumn[];
  rows: SqlResultRow[];
}) {
  return (
    <Box
      sx={{
        overflowX: "auto",
        overscrollBehaviorX: "contain",
        scrollbarWidth: "thin",
        maxHeight: 480,
        "&::-webkit-scrollbar": { height: 8, width: 8 },
      }}
    >
      <Table sx={{ tableLayout: "auto", minWidth: 640 }} aria-label="SQL query results">
        <TableHead>
          <TableRow sx={{ bgcolor: "background.elevated", position: "sticky", top: 0, zIndex: 1 }}>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                sx={{
                  py: 2,
                  px: 2.5,
                  color: "text.disabled",
                  fontSize: 11,
                  lineHeight: "14px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  borderBottom: "1px solid",
                  borderColor: "border.default",
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length ? (
            rows.map((row, idx) => {
              const rowKey =
                typeof row.id === "string" || typeof row.id === "number"
                  ? String(row.id)
                  : `row-${idx}`;
              return (
                <TableRow key={rowKey} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                  {columns.map((column) => {
                    const rawVal = row[column.key];
                    const isNull = rawVal === null || rawVal === undefined;
                    return (
                      <TableCell
                        key={column.key}
                        sx={{
                          py: 2,
                          px: 2.5,
                          maxWidth: 320,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          typography: "code",
                          fontSize: 12,
                          color: isNull ? "text.disabled" : "text.primary",
                          fontStyle: isNull ? "italic" : "normal",
                        }}
                      >
                        {renderCellValue(rawVal)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length || 1} align="center" sx={{ py: 8, color: "text.disabled" }}>
                No rows returned.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}

