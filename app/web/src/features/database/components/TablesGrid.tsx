"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { IconDatabase, IconDotsVertical } from "@tabler/icons-react";
import { SURFACE, tableDetailHref } from "../constants";
import type { DatabaseTable } from "../types";
import { RlsBadge } from "./RlsBadge";

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
  const formatDate = (value: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return {
      date: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date),
      time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(date),
    };
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
        sx={{ minWidth: { xs: 720, md: 800 }, tableLayout: "fixed", width: "100%" }}
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
                  <Tooltip title={`Total physical size: ${BigInt(table.sizeBytes).toLocaleString("en-US")} bytes (includes table data, indexes and TOAST)`} describeChild>
                    <Box component="span" sx={{ cursor: "help", borderBottom: "1px dotted", borderColor: "border.strong" }}>
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
                    <Tooltip title={`${maintained.date} ${maintained.time} UTC`} describeChild>
                      <Box component="span" sx={{ display: "inline-flex", flexDirection: "column", gap: 0.25, cursor: "help" }}>
                        <Typography component="span" variant="body2" sx={{ fontSize: 12, lineHeight: 1.3, color: "text.primary" }}>
                          {maintained.date}
                        </Typography>
                        <Typography component="span" variant="caption" sx={{ fontSize: 11, lineHeight: 1.3, color: "text.disabled" }}>
                          {maintained.time} UTC
                        </Typography>
                      </Box>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" sx={{ fontSize: 12, color: "text.disabled" }}>No maintenance recorded</Typography>
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
    </Box>
  );
}
