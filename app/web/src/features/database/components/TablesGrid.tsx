"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  IconButton,
  Menu,
  MenuItem,
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
  IconDotsVertical,
  IconEye,
  IconTrash,
} from "@tabler/icons-react";
import { SURFACE, tableDetailHref } from "../constants";
import type { DatabaseTable } from "../types";
import { RlsBadge } from "./RlsBadge";
import { dropDatabaseTable } from "../table.client-api";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

const COLUMNS = [
  { label: "Table name", width: undefined },
  { label: "Rows", width: 130 },
  { label: "Total size", width: 150 },
  { label: "Last maintained", width: 180 },
  { label: "RLS status", width: 130 },
  { label: "", width: 56 },
] as const;

const lastIndex = COLUMNS.length - 1;

const cellPadding = (i: number) => ({
  pl: i === 0 ? 4 : 2,
  pr: i === lastIndex ? 4 : 2,
});

interface Props {
  projectId: string;
  tables: DatabaseTable[];
  query: string;
}

export function TablesGrid({ projectId, tables, query }: Props) {
  const router = useRouter();
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTableName, setMenuTableName] = useState<string | null>(null);

  const formatDate = (value: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return {
      date: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(date),
      time: new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
      }).format(date),
    };
  };

  const handleDropConfirm = async () => {
    if (!tableToDelete) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await dropDatabaseTable(projectId, tableToDelete);
      setTableToDelete(null);
      setSuccessMessage(`Table "${tableToDelete}" dropped.`);
      router.refresh();
    } catch {
      setDeleteError("Could not drop table. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: SURFACE,
        border: "1px solid",
        borderColor: "border.default",
        borderRadius: "12px",
        overflowX: "auto",
        overscrollBehaviorX: "contain",
        scrollbarWidth: "thin",
        "&::-webkit-scrollbar": { height: 8 },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "border.strong",
          borderRadius: 8,
        },
        width: "100%",
      }}
    >
      <Table
        sx={{
          minWidth: { xs: 720, md: 800 },
          tableLayout: "fixed",
          width: "100%",
        }}
        aria-label="Database tables"
      >
        <TableHead>
          <TableRow sx={{ bgcolor: "background.elevated" }}>
            {COLUMNS.map((col, i) => (
              <TableCell
                key={i}
                sx={{
                  width: col.width,
                  py: 2.5,
                  ...cellPadding(i),
                  whiteSpace: "nowrap",
                  color: "text.disabled",
                  fontSize: 11,
                  lineHeight: "14px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  borderBottom: "1px solid",
                  borderColor: "border.default",
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {tables.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length}
                align="center"
                sx={{ py: 8, borderBottom: 0, color: "text.disabled" }}
              >
                No tables match “{query}”.
              </TableCell>
            </TableRow>
          )}

          {tables.map((table) => {
            const href = tableDetailHref(projectId, table.name);
            const maintained = formatDate(table.lastMaintained);

            return (
              <TableRow
                key={table.name}
                hover
                onClick={() => router.push(href)}
                sx={{
                  cursor: "pointer",
                  "&:last-child td": { borderBottom: 0 },
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.02)",
                  },
                }}
              >
                <TableCell
                  sx={{
                    py: 2,
                    ...cellPadding(0),
                    borderColor: "border.default",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      minWidth: 0,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        color: "secondary.main",
                        flexShrink: 0,
                      }}
                    >
                      <IconDatabase size={16} aria-hidden />
                    </Box>

                    <NextLink
                      href={href}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <Typography
                        component="span"
                        variant="code"
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          lineHeight: "18px",
                          color: "text.primary",
                          whiteSpace: "nowrap",
                          "&:hover": {
                            color: "primary.main",
                            textDecoration: "underline",
                          },
                        }}
                      >
                        {table.name}
                      </Typography>
                    </NextLink>
                  </Box>
                </TableCell>

                <TableCell
                  sx={{
                    py: 2,
                    ...cellPadding(1),
                    typography: "code",
                    fontSize: 13,
                    color: "text.secondary",
                    borderColor: "border.default",
                  }}
                >
                  {table.rows.toLocaleString("en-US")}
                </TableCell>

                <TableCell
                  sx={{
                    py: 2,
                    ...cellPadding(2),
                    typography: "code",
                    fontSize: 13,
                    color: "text.secondary",
                    borderColor: "border.default",
                  }}
                >
                  <Tooltip
                    title={`Total physical size: ${BigInt(table.sizeBytes).toLocaleString("en-US")} bytes (includes table data, indexes and TOAST)`}
                    describeChild
                  >
                    <Box
                      component="span"
                      sx={{
                        cursor: "help",
                        borderBottom: "1px dotted",
                        borderColor: "border.strong",
                      }}
                    >
                      {table.size}
                    </Box>
                  </Tooltip>
                </TableCell>

                <TableCell
                  sx={{
                    py: 2,
                    ...cellPadding(3),
                    fontSize: 13,
                    color: "text.secondary",
                    borderColor: "border.default",
                  }}
                >
                  {maintained ? (
                    <Tooltip
                      title={`${maintained.date} ${maintained.time} UTC`}
                      describeChild
                    >
                      <Box
                        component="span"
                        sx={{
                          display: "inline-flex",
                          flexDirection: "column",
                          gap: 0.25,
                          cursor: "help",
                        }}
                      >
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            fontSize: 12,
                            lineHeight: 1.3,
                            color: "text.primary",
                          }}
                        >
                          {maintained.date}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{
                            fontSize: 11,
                            lineHeight: 1.3,
                            color: "text.disabled",
                          }}
                        >
                          {maintained.time} UTC
                        </Typography>
                      </Box>
                    </Tooltip>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ fontSize: 12, color: "text.disabled" }}
                    >
                      No maintenance recorded
                    </Typography>
                  )}
                </TableCell>

                <TableCell
                  sx={{
                    py: 2,
                    ...cellPadding(4),
                    borderColor: "border.default",
                  }}
                >
                  <RlsBadge status={table.rls} />
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    py: 2,
                    ...cellPadding(lastIndex),
                    borderColor: "border.default",
                  }}
                >
                  <IconButton
                    size="small"
                    aria-label={`Actions for ${table.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuAnchorEl(e.currentTarget);
                      setMenuTableName(table.name);
                    }}
                    sx={{
                      p: 0.75,
                      color: "text.secondary",
                      "&:hover": {
                        color: "text.primary",
                        bgcolor: "background.elevated",
                      },
                    }}
                  >
                    <IconDotsVertical size={16} />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Row action dropdown menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => {
          setMenuAnchorEl(null);
          setMenuTableName(null);
        }}
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
            if (menuTableName) {
              router.push(tableDetailHref(projectId, menuTableName));
            }
            setMenuAnchorEl(null);
            setMenuTableName(null);
          }}
          sx={{ fontSize: 13, gap: 1.5 }}
        >
          <IconEye size={15} />
          View table
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuTableName) {
              setTableToDelete(menuTableName);
            }
            setMenuAnchorEl(null);
            setMenuTableName(null);
          }}
          sx={{ fontSize: 13, gap: 1.5, color: "error.main" }}
        >
          <IconTrash size={15} />
          Drop table
        </MenuItem>
      </Menu>

      {/* Confirmation dialog for dropping a table */}
      <ConfirmDeleteDialog
        open={Boolean(tableToDelete)}
        title={`Drop table "${tableToDelete ?? ""}"?`}
        description={`Are you sure you want to drop table "${tableToDelete ?? ""}"? All rows and data will be permanently deleted.`}
        confirmLabel="Drop table"
        submitting={isDeleting}
        onClose={() => setTableToDelete(null)}
        onConfirm={handleDropConfirm}
      />

      <Snackbar
        open={Boolean(deleteError)}
        autoHideDuration={5000}
        onClose={() => setDeleteError("")}
      >
        <Alert severity="error" onClose={() => setDeleteError("")}>
          {deleteError}
        </Alert>
      </Snackbar>
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3500}
        onClose={() => setSuccessMessage("")}
      >
        <Alert severity="success" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
