"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, InputAdornment, OutlinedInput, Snackbar, Alert } from "@mui/material";
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
import { fetchTablePage } from "../table.client-api";
import { AddRowDialog } from "./AddRowDialog";

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

export function TableDataView({ detail, projectId }: { detail: TableDetail; projectId: string }) {
  const [currentDetail, setCurrentDetail] = useState(detail);
  const [addOpen, setAddOpen] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  const loadData = useCallback(
    async (page: number, searchQuery?: string) => {
      setLoading(true);
      setLoadError("");
      try {
        const nextDetail = await fetchTablePage(
          projectId,
          detail.table.name,
          page,
          detail.pagination.pageSize,
          searchQuery,
        );
        setCurrentDetail(nextDetail);
      } catch {
        setLoadError("Could not load table data. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [projectId, detail.table.name, detail.pagination.pageSize],
  );

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      void loadData(1, query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, loadData]);

  const changePage = (page: number) => {
    void loadData(page, query);
  };

  const tableDetail = currentDetail;
  const { columns, rows, pagination } = tableDetail;

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) =>
      rows.every((r) => prev.has(r.id))
        ? new Set()
        : new Set(rows.map((r) => r.id)),
    );

  const from = pagination.totalRows === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
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
              width: { xs: "100%", sm: 240 },
              maxWidth: { xs: "100%", sm: 260 },
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
            onClick={() => setAddOpen(true)}
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
      <Box sx={{ opacity: loading ? 0.6 : 1, minWidth: 0 }}>
        <DataGrid
          columns={columns}
          rows={rows}
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
          onPageChange={changePage}
        />
      </Box>
      <Snackbar open={Boolean(loadError)} autoHideDuration={5000} onClose={() => setLoadError("")}>
        <Alert severity="error" onClose={() => setLoadError("")}>{loadError}</Alert>
      </Snackbar>
      <Snackbar open={Boolean(successMessage)} autoHideDuration={3500} onClose={() => setSuccessMessage("")}>
        <Alert severity="success" onClose={() => setSuccessMessage("")}>{successMessage}</Alert>
      </Snackbar>
      <AddRowDialog
        open={addOpen}
        projectId={projectId}
        tableName={detail.table.name}
        columns={columns}
        onClose={() => setAddOpen(false)}
        onInserted={() => {
          setSuccessMessage("Row added.");
          void fetchTablePage(projectId, detail.table.name, 1, pagination.pageSize, query)
            .then((refreshed) => {
              setCurrentDetail(refreshed);
              setSelected(new Set());
            })
            .catch(() => setLoadError("The row was added, but the table could not be refreshed. Reload to see the latest data."));
        }}
      />
    </Box>
  );
}
