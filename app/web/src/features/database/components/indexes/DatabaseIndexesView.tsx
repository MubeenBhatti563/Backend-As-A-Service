"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Chip,
  InputAdornment,
  OutlinedInput,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { IconDatabase, IconKey, IconSearch } from "@tabler/icons-react";
import { SURFACE } from "../../constants";
import type { DatabaseIndexesResponse } from "../../types";

function formatBytes(value: string): string {
  const bytes = BigInt(value);
  if (bytes < BigInt(1024)) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB", "PB"];
  let size = Number(bytes);
  let unit = -1;
  do {
    size /= 1024;
    unit += 1;
  } while (size >= 1024 && unit < units.length - 1);
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(size)} ${units[unit]}`;
}

function Summary({ label, value, icon }: { label: string; value: string; icon: "database" | "key" }) {
  const SummaryIcon = icon === "database" ? IconDatabase : IconKey;
  return (
    <Paper
      variant="outlined"
      sx={{
        minWidth: 0,
        p: 2.5,
        display: "flex",
        alignItems: "center",
        gap: 2,
        bgcolor: SURFACE,
        borderColor: "border.default",
        borderRadius: "10px",
      }}
    >
      <Box sx={{ display: "grid", placeItems: "center", width: 34, height: 34, flexShrink: 0, borderRadius: 1, bgcolor: "background.elevated", color: "secondary.main" }}>
        <SummaryIcon size={17} aria-hidden />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: "text.disabled", fontSize: 10, lineHeight: "14px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {label}
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 16, lineHeight: "20px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

export function DatabaseIndexesView({ data }: { data: DatabaseIndexesResponse }) {
  const [query, setQuery] = useState("");
  const indexes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return data.indexes;
    return data.indexes.filter((index) =>
      [index.name, index.tableName, index.method, ...index.columns]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [data.indexes, query]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, minWidth: 0 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        <Summary label="Indexes" value={data.stats.totalIndexes.toLocaleString("en-US")} icon="database" />
        <Summary label="Unique indexes" value={data.stats.uniqueIndexes.toLocaleString("en-US")} icon="key" />
        <Summary label="Allocated index size" value={formatBytes(data.stats.totalSizeBytes)} icon="database" />
      </Box>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography component="h2" sx={{ fontSize: 16, fontWeight: 600 }}>Project indexes</Typography>
          <Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: 12 }}>
            Index metadata and physical size across tables in this project.
          </Typography>
        </Box>
        <OutlinedInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search indexes or tables…"
          size="small"
          inputProps={{ "aria-label": "Search indexes or tables" }}
          startAdornment={<InputAdornment position="start" sx={{ color: "text.secondary", ml: 0.5, mr: 1 }}><IconSearch size={16} aria-hidden /></InputAdornment>}
          sx={{
            width: { xs: "100%", sm: 300 },
            height: 38,
            bgcolor: SURFACE,
            borderRadius: "6px",
            fontSize: 13,
            "& fieldset": { borderColor: "border.default" },
            "&:hover fieldset": { borderColor: "border.strong" },
            "&.Mui-focused fieldset": { borderColor: "primary.main" },
          }}
        />
      </Box>

      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
          overscrollBehaviorX: "contain",
          scrollbarWidth: "thin",
          bgcolor: SURFACE,
          border: "1px solid",
          borderColor: "border.default",
          borderRadius: "12px",
          "&::-webkit-scrollbar": { height: 8 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "border.strong", borderRadius: 8 },
        }}
      >
        <Table sx={{ minWidth: 830, tableLayout: "fixed" }} aria-label="Project database indexes">
          <TableHead>
            <TableRow sx={{ bgcolor: "background.elevated" }}>
              {["Index", "Table", "Columns", "Method", "Properties", "Size"].map((label) => (
                <TableCell key={label} sx={{ py: 2, color: "text.disabled", fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap", borderColor: "border.default" }}>
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {indexes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8, borderBottom: 0 }}>
                  <Typography sx={{ color: "text.primary", fontSize: 13, fontWeight: 500 }}>
                    {data.indexes.length === 0 ? "No indexes in this project yet" : "No indexes match your search"}
                  </Typography>
                  <Typography sx={{ mt: 0.75, color: "text.secondary", fontSize: 12 }}>
                    {data.indexes.length === 0
                      ? "Indexes created by primary keys and unique constraints will appear here."
                      : "Try another index name, table name, or indexed column."}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {indexes.map((index) => (
              <TableRow key={`${index.tableName}.${index.name}`} hover sx={{ "&:last-child td": { borderBottom: 0 }, "&:hover": { bgcolor: "rgba(255, 255, 255, 0.02)" } }}>
                <TableCell sx={{ py: 2, borderColor: "border.default", overflow: "hidden" }}>
                  <Tooltip title={index.definition} placement="top-start" describeChild>
                    <Typography noWrap sx={{ color: "text.primary", fontFamily: "var(--font-geist-mono), monospace", fontSize: 12, cursor: "help" }}>
                      {index.name}
                    </Typography>
                  </Tooltip>
                  {!index.isValid && <Chip label="Invalid" size="small" color="error" sx={{ mt: 0.75, height: 18, fontSize: 10 }} />}
                </TableCell>
                <TableCell sx={{ py: 2, borderColor: "border.default", color: "text.secondary", fontFamily: "var(--font-geist-mono), monospace", fontSize: 12, overflowWrap: "anywhere" }}>
                  {index.tableName}
                </TableCell>
                <TableCell sx={{ py: 2, borderColor: "border.default", color: "text.secondary", fontSize: 12, overflowWrap: "anywhere" }}>
                  {index.columns.length ? index.columns.join(", ") : "Expression"}
                </TableCell>
                <TableCell sx={{ py: 2, borderColor: "border.default" }}>
                  <Chip label={index.method} size="small" variant="outlined" sx={{ height: 22, fontSize: 10, borderColor: "border.strong", color: "text.secondary", textTransform: "uppercase" }} />
                </TableCell>
                <TableCell sx={{ py: 2, borderColor: "border.default" }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {index.isPrimary && <Chip label="Primary" size="small" sx={{ height: 20, fontSize: 10, bgcolor: "rgba(6, 182, 212, 0.12)", color: "secondary.main" }} />}
                    {index.isUnique && !index.isPrimary && <Chip label="Unique" size="small" sx={{ height: 20, fontSize: 10, bgcolor: "rgba(6, 182, 212, 0.12)", color: "secondary.main" }} />}
                    {!index.isPrimary && !index.isUnique && <Typography sx={{ color: "text.disabled", fontSize: 11 }}>Standard</Typography>}
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2, borderColor: "border.default", color: "text.primary", fontFamily: "var(--font-geist-mono), monospace", fontSize: 11, whiteSpace: "nowrap" }}>
                  <Tooltip title={`${BigInt(index.sizeBytes).toLocaleString("en-US")} bytes`} describeChild>
                    <span>{formatBytes(index.sizeBytes)}</span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
