"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { IconDatabase, IconDotsVertical } from "@tabler/icons-react";
import { SURFACE, tableDetailHref } from "../constants";
import type { DatabaseTable } from "../types";
import { RlsBadge } from "./RlsBadge";

const COLUMNS = [
  { label: "Table name", width: undefined },
  { label: "Rows", width: 130 },
  { label: "Size", width: 130 },
  { label: "Last modified", width: 170 },
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

  return (
    <Box
      sx={{
        bgcolor: SURFACE,
        border: "1px solid",
        borderColor: "border.default",
        borderRadius: "12px",
        overflowX: "auto",
        width: "100%",
      }}
    >
      <Table
        sx={{ minWidth: 800, tableLayout: "fixed", width: "100%" }}
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

                    <Link
                      component={NextLink}
                      href={href}
                      onClick={(e) => e.stopPropagation()}
                      variant="code"
                      underline="none"
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        lineHeight: "18px",
                        color: "text.primary",
                        "&:hover": {
                          color: "primary.main",
                        },
                      }}
                    >
                      {table.name}
                    </Link>
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
                  {table.size}
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
                  {table.lastModified}
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
                      // menu handler hook can be wired here
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
