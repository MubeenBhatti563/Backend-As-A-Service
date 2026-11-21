"use client";

import { useMemo, useState } from "react";
import { Box, Button, InputAdornment, OutlinedInput } from "@mui/material";
import {
  IconAdjustmentsHorizontal,
  IconArrowsSort,
  IconDownload,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { SURFACE } from "../constants";
import type { TableDetail } from "../types";
import { DataGrid } from "./DataGrid";
import { PaginationFooter } from "./PaginationFooter";

const toolbarButtonSx = {
  minHeight: 33,
  px: 3,
  py: 2,
  borderRadius: "6px",
  fontSize: 13,
  lineHeight: "17px",
  fontWeight: 400,
  color: "text.primary",
  bgcolor: SURFACE,
  "& .MuiButton-startIcon": { mr: "6px", ml: 0 },
} as const;

export function TableDataView({ detail }: { detail: TableDetail }) {
  const { columns, rows, pagination } = detail;
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      Object.values(r).some((v) => v.toLowerCase().includes(q)),
    );
  }, [rows, query]);

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) =>
      filtered.every((r) => prev.has(r.id))
        ? new Set()
        : new Set(filtered.map((r) => r.id)),
    );

  const from = (pagination.page - 1) * pagination.pageSize + 1;
  const to = Math.min(from + rows.length - 1, pagination.totalRows);
  const pageCount = Math.max(
    1,
    Math.ceil(pagination.totalRows / pagination.pageSize),
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* Left group: search + filter + sort */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <OutlinedInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter rows…"
            inputProps={{ "aria-label": "Filter rows" }}
            startAdornment={
              <InputAdornment
                position="start"
                sx={{ mr: 2, color: "text.secondary" }}
              >
                <IconSearch size={16} />
              </InputAdornment>
            }
            sx={{
              width: 240,
              px: 3,
              bgcolor: SURFACE,
              borderRadius: "6px",
              "& .MuiOutlinedInput-input": {
                p: "8px 0",
                fontSize: 13,
                lineHeight: "17px",
              },
            }}
          />
          <Button
            variant="outlined"
            startIcon={<IconAdjustmentsHorizontal size={16} />}
            sx={toolbarButtonSx}
          >
            Filter
          </Button>
          <Button
            variant="outlined"
            startIcon={<IconArrowsSort size={16} />}
            sx={toolbarButtonSx}
          >
            Sort
          </Button>
        </Box>

        {/* Right group: export + add row */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<IconDownload size={16} />}
            sx={toolbarButtonSx}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<IconPlus size={16} />}
            sx={{
              ...toolbarButtonSx,
              px: "14px",
              fontWeight: 600,
              color: "common.white",
              bgcolor: "primary.main",
            }}
          >
            Add Row
          </Button>
        </Box>
      </Box>

      {/* Grid + Pagination */}
      <Box>
        <DataGrid
          columns={columns}
          rows={filtered}
          selected={selected}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
        />
        <PaginationFooter
          from={from}
          to={to}
          total={pagination.totalRows}
          page={pagination.page}
          pageCount={pageCount}
        />
      </Box>
    </Box>
  );
}
