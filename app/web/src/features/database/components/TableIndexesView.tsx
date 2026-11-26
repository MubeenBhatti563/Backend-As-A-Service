"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  IconDatabase,
  IconKey,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { SURFACE } from "../constants";
import type { DatabaseIndex, TableIndexesResponse } from "../types";
import { CreateIndexDialog } from "./CreateIndexDialog";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { dropDatabaseIndex } from "../table.client-api";

function formatBytes(value: string): string {
  const bytes = BigInt(value || "0");
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

function StatCard({
  label,
  value,
  icon: Icon,
  color = "secondary.main",
}: {
  label: string;
  value: string | number;
  icon: typeof IconDatabase;
  color?: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        minWidth: 160,
        p: 2.5,
        display: "flex",
        alignItems: "center",
        gap: 2,
        bgcolor: SURFACE,
        borderColor: "border.default",
        borderRadius: "10px",
      }}
    >
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 1,
          bgcolor: "background.elevated",
          color,
        }}
      >
        <Icon size={18} aria-hidden />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            color: "text.disabled",
            fontSize: 11,
            lineHeight: "14px",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            mt: 0.5,
            fontSize: 18,
            lineHeight: "22px",
            fontWeight: 700,
            color: "text.primary",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

interface Props {
  projectId: string;
  indexesData: TableIndexesResponse;
}

export function TableIndexesView({ projectId, indexesData }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [indexToDelete, setIndexToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  const filteredIndexes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return indexesData.indexes;
    return indexesData.indexes.filter(
      (idx) =>
        idx.name.toLowerCase().includes(q) ||
        idx.columns.some((c) => c.toLowerCase().includes(q)) ||
        idx.method.toLowerCase().includes(q),
    );
  }, [indexesData.indexes, query]);

  // Extract unique columns seen across indexes or from table
  const availableColumns = useMemo(() => {
    const set = new Set<string>();
    indexesData.indexes.forEach((idx) => idx.columns.forEach((c) => set.add(c)));
    return Array.from(set);
  }, [indexesData.indexes]);

  const handleDropConfirm = async () => {
    if (!indexToDelete) return;
    setIsDeleting(true);
    try {
      await dropDatabaseIndex(projectId, indexesData.table.name, indexToDelete);
      setFeedback({ message: `Index "${indexToDelete}" dropped successfully.`, severity: "success" });
      setIndexToDelete(null);
      router.refresh();
    } catch {
      setFeedback({ message: "Could not drop index. Please try again.", severity: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Metric Cards */}
      <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
        <StatCard
          label="Total Indexes"
          value={indexesData.stats.totalIndexes}
          icon={IconDatabase}
          color="text.primary"
        />
        <StatCard
          label="Unique Indexes"
          value={indexesData.stats.uniqueIndexes}
          icon={IconKey}
          color="warning.main"
        />
        <StatCard
          label="Total Index Size"
          value={formatBytes(indexesData.stats.totalSizeBytes)}
          icon={IconDatabase}
          color="secondary.main"
        />
      </Box>

      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <OutlinedInput
          size="small"
          placeholder="Filter indexes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          startAdornment={
            <InputAdornment position="start" sx={{ color: "text.secondary", ml: 0.5, mr: 1 }}>
              <IconSearch size={16} />
            </InputAdornment>
          }
          sx={{
            width: { xs: "100%", sm: 260 },
            height: 38,
            bgcolor: SURFACE,
            borderRadius: "6px",
            fontSize: 13,
            "& fieldset": { borderColor: "border.default" },
            "&:hover fieldset": { borderColor: "border.strong" },
          }}
        />

        <Button
          variant="contained"
          startIcon={<IconPlus size={16} />}
          onClick={() => setCreateOpen(true)}
          sx={{
            height: 38,
            px: 2.5,
            borderRadius: "6px",
            fontSize: 13,
            fontWeight: 600,
            textTransform: "none",
          }}
        >
          Create Index
        </Button>
      </Box>

      {/* Indexes Table */}
      <Box
        sx={{
          bgcolor: SURFACE,
          border: "1px solid",
          borderColor: "border.default",
          borderRadius: "12px",
          overflowX: "auto",
        }}
      >
        <Table sx={{ minWidth: 700 }} aria-label="Table indexes">
          <TableHead>
            <TableRow sx={{ bgcolor: "background.elevated" }}>
              <TableCell sx={{ color: "text.disabled", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", py: 2, pl: 3 }}>
                Index Name
              </TableCell>
              <TableCell sx={{ color: "text.disabled", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", py: 2 }}>
                Method
              </TableCell>
              <TableCell sx={{ color: "text.disabled", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", py: 2 }}>
                Indexed Columns
              </TableCell>
              <TableCell sx={{ color: "text.disabled", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", py: 2 }}>
                Type
              </TableCell>
              <TableCell sx={{ color: "text.disabled", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", py: 2 }}>
                Size
              </TableCell>
              <TableCell align="right" sx={{ color: "text.disabled", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", py: 2, pr: 3 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredIndexes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.disabled" }}>
                  No indexes match “{query}”.
                </TableCell>
              </TableRow>
            )}

            {filteredIndexes.map((idx) => (
              <TableRow key={idx.name} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                {/* Index Name */}
                <TableCell sx={{ py: 2, pl: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box component="span" sx={{ color: idx.isPrimary ? "warning.main" : "secondary.main", display: "flex" }}>
                      {idx.isPrimary ? <IconKey size={16} /> : <IconDatabase size={16} />}
                    </Box>
                    <Tooltip title={idx.definition} describeChild>
                      <Typography sx={{ typography: "code", fontSize: 13, fontWeight: 600, color: "text.primary", cursor: "help" }}>
                        {idx.name}
                      </Typography>
                    </Tooltip>
                  </Box>
                </TableCell>

                {/* Method */}
                <TableCell sx={{ py: 2 }}>
                  <Chip
                    size="small"
                    label={idx.method.toUpperCase()}
                    sx={{ typography: "code", fontSize: 11, fontWeight: 600, bgcolor: "background.elevated" }}
                  />
                </TableCell>

                {/* Columns */}
                <TableCell sx={{ py: 2 }}>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {idx.columns.map((c) => (
                      <Chip
                        key={c}
                        size="small"
                        label={c}
                        sx={{ typography: "code", fontSize: 11, bgcolor: "background.elevated", color: "text.secondary" }}
                      />
                    ))}
                  </Box>
                </TableCell>

                {/* Type */}
                <TableCell sx={{ py: 2 }}>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {idx.isPrimary && (
                      <Chip
                        size="small"
                        label="PRIMARY"
                        sx={{ fontSize: 10, fontWeight: 700, bgcolor: "rgba(245, 158, 11, 0.12)", color: "#F59E0B" }}
                      />
                    )}
                    {idx.isUnique && !idx.isPrimary && (
                      <Chip
                        size="small"
                        label="UNIQUE"
                        sx={{ fontSize: 10, fontWeight: 700, bgcolor: "rgba(139, 92, 246, 0.12)", color: "#A78BFA" }}
                      />
                    )}
                    {!idx.isPrimary && !idx.isUnique && (
                      <Typography variant="caption" sx={{ color: "text.disabled" }}>
                        Regular
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                {/* Size */}
                <TableCell sx={{ py: 2 }}>
                  <Typography sx={{ typography: "code", fontSize: 12, color: "text.secondary" }}>
                    {formatBytes(idx.sizeBytes)}
                  </Typography>
                </TableCell>

                {/* Actions */}
                <TableCell align="right" sx={{ py: 2, pr: 3 }}>
                  <Tooltip title={idx.isPrimary ? "Cannot drop primary key index" : `Drop index "${idx.name}"`}>
                    <span>
                      <IconButton
                        size="small"
                        disabled={idx.isPrimary}
                        onClick={() => setIndexToDelete(idx.name)}
                        sx={{
                          color: "text.secondary",
                          "&:hover": { color: "error.main", bgcolor: "rgba(239, 68, 68, 0.08)" },
                          "&.Mui-disabled": { opacity: 0.3 },
                        }}
                      >
                        <IconTrash size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* Create Index Dialog */}
      <CreateIndexDialog
        open={createOpen}
        projectId={projectId}
        tableName={indexesData.table.name}
        availableColumns={availableColumns}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setFeedback({ message: "Index created successfully.", severity: "success" });
          router.refresh();
        }}
      />

      {/* Confirm Drop Index Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(indexToDelete)}
        title={`Drop index "${indexToDelete ?? ""}"?`}
        description={`Are you sure you want to drop index "${indexToDelete ?? ""}" from table "${indexesData.table.name}"?`}
        confirmLabel="Drop index"
        submitting={isDeleting}
        onClose={() => setIndexToDelete(null)}
        onConfirm={handleDropConfirm}
      />

      {/* Feedback Toast */}
      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={4000}
        onClose={() => setFeedback(null)}
      >
        <Alert severity={feedback?.severity ?? "info"} onClose={() => setFeedback(null)}>
          {feedback?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
