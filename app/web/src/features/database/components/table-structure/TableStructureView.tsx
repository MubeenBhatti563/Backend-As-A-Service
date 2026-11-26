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
  IconColumns,
  IconKey,
  IconLink,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { SURFACE } from "../../constants";
import type { TableStructureColumn, TableStructureResponse } from "../../types";
import { AddColumnDialog } from "./AddColumnDialog";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";
import { dropDatabaseColumn } from "../../table.client-api";

function StatCard({
  label,
  value,
  icon: Icon,
  color = "secondary.main",
}: {
  label: string;
  value: string | number;
  icon: typeof IconColumns;
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
  structure: TableStructureResponse;
}

export function TableStructureView({ projectId, structure }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  const filteredColumns = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return structure.columns;
    return structure.columns.filter((c) =>
      c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q),
    );
  }, [structure.columns, query]);

  const handleDropConfirm = async () => {
    if (!columnToDelete) return;
    setIsDeleting(true);
    try {
      await dropDatabaseColumn(projectId, structure.table.name, columnToDelete);
      setFeedback({ message: `Column "${columnToDelete}" dropped successfully.`, severity: "success" });
      setColumnToDelete(null);
      router.refresh();
    } catch {
      setFeedback({ message: "Could not drop column. Check constraints or retry.", severity: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Overview Metric Cards */}
      <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
        <StatCard label="Columns" value={structure.columns.length} icon={IconColumns} color="text.primary" />
        <StatCard
          label="Primary Key"
          value={structure.primaryKeys.join(", ") || "None"}
          icon={IconKey}
          color="warning.main"
        />
        <StatCard
          label="Unique Fields"
          value={structure.uniqueConstraintsCount}
          icon={IconKey}
          color="secondary.main"
        />
        <StatCard
          label="Foreign Keys"
          value={structure.foreignKeysCount}
          icon={IconLink}
          color="info.main"
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
          placeholder="Filter columns…"
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
          onClick={() => setAddOpen(true)}
          sx={{
            height: 38,
            px: 2.5,
            borderRadius: "6px",
            fontSize: 13,
            fontWeight: 600,
            textTransform: "none",
          }}
        >
          Add Column
        </Button>
      </Box>

      {/* Columns Table */}
      <Box
        sx={{
          bgcolor: SURFACE,
          border: "1px solid",
          borderColor: "border.default",
          borderRadius: "12px",
          overflowX: "auto",
        }}
      >
        <Table sx={{ minWidth: 700 }} aria-label="Table columns structure">
          <TableHead>
            <TableRow sx={{ bgcolor: "background.elevated" }}>
              <TableCell sx={{ color: "text.disabled", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", py: 2, pl: 3 }}>
                Column Name
              </TableCell>
              <TableCell sx={{ color: "text.disabled", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", py: 2 }}>
                Data Type
              </TableCell>
              <TableCell sx={{ color: "text.disabled", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", py: 2 }}>
                Nullable
              </TableCell>
              <TableCell sx={{ color: "text.disabled", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", py: 2 }}>
                Default Value
              </TableCell>
              <TableCell sx={{ color: "text.disabled", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", py: 2 }}>
                Constraints & References
              </TableCell>
              <TableCell align="right" sx={{ color: "text.disabled", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", py: 2, pr: 3 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredColumns.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.disabled" }}>
                  No columns match “{query}”.
                </TableCell>
              </TableRow>
            )}

            {filteredColumns.map((col) => (
              <TableRow key={col.name} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                {/* Column Name */}
                <TableCell sx={{ py: 2, pl: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {col.isPrimary ? (
                      <Tooltip title="Primary Key">
                        <Box component="span" sx={{ color: "warning.main", display: "flex" }}>
                          <IconKey size={16} />
                        </Box>
                      </Tooltip>
                    ) : col.isForeignKey ? (
                      <Tooltip title="Foreign Key">
                        <Box component="span" sx={{ color: "info.main", display: "flex" }}>
                          <IconLink size={16} />
                        </Box>
                      </Tooltip>
                    ) : (
                      <Box component="span" sx={{ color: "text.disabled", display: "flex" }}>
                        <IconColumns size={16} />
                      </Box>
                    )}
                    <Typography component="span" sx={{ typography: "code", fontWeight: 600, fontSize: 13, color: "text.primary" }}>
                      {col.name}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Data Type */}
                <TableCell sx={{ py: 2 }}>
                  <Chip
                    size="small"
                    label={col.formattedType}
                    sx={{
                      typography: "code",
                      fontSize: 11,
                      fontWeight: 600,
                      bgcolor: "background.elevated",
                      color: "secondary.main",
                      border: "1px solid",
                      borderColor: "border.subtle",
                    }}
                  />
                </TableCell>

                {/* Nullable */}
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ fontSize: 13, color: col.isNullable ? "text.secondary" : "text.primary", fontWeight: col.isNullable ? 400 : 500 }}>
                    {col.isNullable ? "YES" : "NO"}
                  </Typography>
                </TableCell>

                {/* Default Value */}
                <TableCell sx={{ py: 2 }}>
                  {col.defaultValue ? (
                    <Typography component="span" sx={{ typography: "code", fontSize: 12, color: "text.secondary" }}>
                      {col.defaultValue}
                    </Typography>
                  ) : (
                    <Typography component="span" sx={{ color: "text.disabled", fontSize: 12 }}>
                      -
                    </Typography>
                  )}
                </TableCell>

                {/* Constraints & References */}
                <TableCell sx={{ py: 2 }}>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                    {col.isPrimary && (
                      <Chip
                        size="small"
                        label="PRIMARY KEY"
                        sx={{ fontSize: 10, fontWeight: 700, bgcolor: "rgba(245, 158, 11, 0.12)", color: "#F59E0B" }}
                      />
                    )}
                    {col.isUnique && (
                      <Chip
                        size="small"
                        label="UNIQUE"
                        sx={{ fontSize: 10, fontWeight: 700, bgcolor: "rgba(139, 92, 246, 0.12)", color: "#A78BFA" }}
                      />
                    )}
                    {col.foreignKey && (
                      <Tooltip title={`Referenced by constraint ${col.foreignKey.constraintName ?? ""}`}>
                        <Chip
                          size="small"
                          icon={<IconLink size={12} />}
                          label={`REFERENCES ${col.foreignKey.tableName}.${col.foreignKey.columnName}`}
                          sx={{ fontSize: 11, fontWeight: 500, bgcolor: "rgba(59, 130, 246, 0.12)", color: "#60A5FA" }}
                        />
                      </Tooltip>
                    )}
                    {!col.isPrimary && !col.isUnique && !col.foreignKey && !col.isNullable && (
                      <Typography variant="caption" sx={{ color: "text.disabled" }}>
                        NOT NULL
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                {/* Actions */}
                <TableCell align="right" sx={{ py: 2, pr: 3 }}>
                  <Tooltip title={col.isPrimary ? "Cannot drop primary key" : `Drop column "${col.name}"`}>
                    <span>
                      <IconButton
                        size="small"
                        disabled={col.isPrimary}
                        onClick={() => setColumnToDelete(col.name)}
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

      {/* Add Column Dialog */}
      <AddColumnDialog
        open={addOpen}
        projectId={projectId}
        tableName={structure.table.name}
        onClose={() => setAddOpen(false)}
        onAdded={() => {
          setFeedback({ message: "Column added successfully.", severity: "success" });
          router.refresh();
        }}
      />

      {/* Confirm Drop Column Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(columnToDelete)}
        title={`Drop column "${columnToDelete ?? ""}"?`}
        description={`Are you sure you want to drop column "${columnToDelete ?? ""}" from table "${structure.table.name}"? Any data stored in this column will be permanently removed.`}
        confirmLabel="Drop column"
        submitting={isDeleting}
        onClose={() => setColumnToDelete(null)}
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
