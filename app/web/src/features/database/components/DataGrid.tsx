"use client";

import {
  Box,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { SURFACE } from "../constants";
import type { CellKind, GridColumn, GridRow } from "../types";
import { StatusChip, toneFor } from "./StatusChip";

const KIND_WIDTH: Partial<Record<CellKind, number>> = {
  uuid: 220,
  role: 120,
  status: 120,
  timestamp: 180,
};

const checkboxSx = {
  p: 0,
  color: "text.secondary",
  "& .MuiSvgIcon-root": { fontSize: 18 },
} as const;

function renderCell(kind: CellKind, value: string) {
  switch (kind) {
    case "uuid":
      return (
        <Box component="span" sx={{ typography: "code", color: "secondary.main" }}>
          {value}
        </Box>
      );
    case "primary":
      return (
        <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
          {value}
        </Box>
      );
    case "role":
    case "status":
      return <StatusChip label={value} tone={toneFor(value)} />;
    case "timestamp":
      return (
        <Box
          component="span"
          sx={{
            typography: "code",
            fontSize: 12,
            lineHeight: "16px",
            color: "text.disabled",
          }}
        >
          {value}
        </Box>
      );
    default:
      return value;
  }
}

interface Props {
  columns: GridColumn[];
  rows: GridRow[];
  selected: ReadonlySet<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
}

export function DataGrid({
  columns,
  rows,
  selected,
  onToggleRow,
  onToggleAll,
}: Props) {
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someSelected = !allSelected && rows.some((r) => selected.has(r.id));
  const lastCol = columns.length - 1;

  return (
    <Box
      sx={{
        bgcolor: SURFACE,
        border: "1px solid",
        borderColor: "border.default",
        borderRadius: "12px",
        overflowX: "auto",
        overflowY: "hidden",
        overscrollBehaviorX: "contain",
        scrollbarWidth: "thin",
        "&::-webkit-scrollbar": { height: 8 },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "border.strong",
          borderRadius: 8,
        },
      }}
    >
      <Table
        sx={{ width: "max-content", minWidth: "100%", tableLayout: "auto" }}
        aria-label="Table rows"
      >
        <TableHead>
          <TableRow sx={{ bgcolor: "background.elevated" }}>
            <TableCell
              sx={{
                width: 52,
                minWidth: 52,
                py: { xs: 2, sm: 3 },
                pl: { xs: 2, sm: 3 },
                pr: 1,
                position: "sticky",
                left: 0,
                zIndex: 2,
                bgcolor: "background.elevated",
              }}
            >
              <Checkbox
                size="small"
                sx={checkboxSx}
                checked={allSelected}
                indeterminate={someSelected}
                onChange={onToggleAll}
                slotProps={{ input: { "aria-label": "Select all rows" } }}
              />
            </TableCell>
            {columns.map((col, i) => (
              <TableCell
                key={col.key}
                sx={{
                  width: KIND_WIDTH[col.kind],
                  py: { xs: 2, sm: 3 },
                  px: 0,
                  pr: i === lastCol ? { xs: 2, sm: 4 } : 2,
                  color: "text.disabled",
                  fontSize: 11,
                  lineHeight: "14px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1}
                align="center"
                sx={{ py: 8, borderBottom: 0, color: "text.disabled" }}
              >
                No rows match your filter.
              </TableCell>
            </TableRow>
          )}

          {rows.map((row) => (
            <TableRow
              key={row.id}
              hover
              selected={selected.has(row.id)}
              sx={{ "&:last-child td": { borderBottom: 0 } }}
            >
              <TableCell
                sx={{
                  py: { xs: 2, sm: 3 },
                  pl: { xs: 2, sm: 3 },
                  pr: 1,
                  position: "sticky",
                  left: 0,
                  zIndex: 1,
                  bgcolor: selected.has(row.id) ? "action.selected" : SURFACE,
                }}
              >
                <Checkbox
                  size="small"
                  sx={checkboxSx}
                  checked={selected.has(row.id)}
                  onChange={() => onToggleRow(row.id)}
                  slotProps={{ input: { "aria-label": `Select row ${row.id}` } }}
                />
              </TableCell>

              {columns.map((col, i) => (
                <TableCell
                  key={col.key}
                  sx={{
                    py: { xs: 2, sm: 3 },
                    px: 0,
                    pr: i === lastCol ? { xs: 2, sm: 4 } : 2,
                    lineHeight: "17px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: col.kind === "uuid" ? 220 : 260,
                  }}
                >
                  <Box component="span" title={row[col.key] ?? ""}>
                    {renderCell(col.kind, row[col.key] ?? "")}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
