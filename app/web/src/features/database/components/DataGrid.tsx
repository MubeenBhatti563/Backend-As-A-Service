"use client";

import { useState } from "react";
import {
  Box,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
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

function RowActionsMenu({
  row,
  onEdit,
  onDelete,
}: {
  row: GridRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        size="small"
        aria-label={`Actions for row ${row.id}`}
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        sx={{
          color: "text.secondary",
          "&:hover": { color: "text.primary", bgcolor: "background.elevated" },
        }}
      >
        <IconDotsVertical size={16} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "8px",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "border.default",
              minWidth: 140,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onEdit();
          }}
          sx={{ fontSize: 13, gap: 1.5 }}
        >
          <IconPencil size={15} />
          Edit row
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onDelete();
          }}
          sx={{ fontSize: 13, gap: 1.5, color: "error.main" }}
        >
          <IconTrash size={15} />
          Delete row
        </MenuItem>
      </Menu>
    </>
  );
}

interface Props {
  columns: GridColumn[];
  rows: GridRow[];
  selected: ReadonlySet<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  onEditRow?: (row: GridRow) => void;
  onDeleteRow?: (row: GridRow) => void;
}

export function DataGrid({
  columns,
  rows,
  selected,
  onToggleRow,
  onToggleAll,
  onEditRow,
  onDeleteRow,
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
                  pr: i === lastCol ? 2 : 2,
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
            <TableCell
              align="right"
              sx={{
                width: 50,
                minWidth: 50,
                py: { xs: 2, sm: 3 },
                pr: { xs: 2, sm: 3 },
                pl: 1,
                position: "sticky",
                right: 0,
                zIndex: 2,
                bgcolor: "background.elevated",
              }}
            />
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length + 2}
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
                    pr: i === lastCol ? 2 : 2,
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

              <TableCell
                align="right"
                sx={{
                  py: 1,
                  pr: { xs: 1.5, sm: 2 },
                  pl: 0.5,
                  position: "sticky",
                  right: 0,
                  zIndex: 1,
                  bgcolor: selected.has(row.id) ? "action.selected" : SURFACE,
                }}
              >
                <RowActionsMenu
                  row={row}
                  onEdit={() => onEditRow?.(row)}
                  onDelete={() => onDeleteRow?.(row)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
