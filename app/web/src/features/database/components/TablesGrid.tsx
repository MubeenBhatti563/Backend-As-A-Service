"use client";

import NextLink from "next/link";
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
  { label: "Rows", width: 140 },
  { label: "Size", width: 140 },
  { label: "Last modified", width: 180 },
  { label: "RLS status", width: 120 },
  { label: "", width: 64 }, // 40px action + 24px right padding
] as const;

const lastIndex = COLUMNS.length - 1;

/** Horizontal padding lives on the first/last cell only, like the Figma row (24px). */
const edgePadding = (i: number) => ({
  pl: i === 0 ? 6 : 0,
  pr: i === lastIndex ? 6 : 0,
});

interface Props {
  projectId: string;
  tables: DatabaseTable[];
  query: string;
}

export function TablesGrid({ projectId, tables, query }: Props) {
  return (
    <Box
      sx={{
        bgcolor: SURFACE,
        border: "1px solid",
        borderColor: "border.default",
        borderRadius: "12px",
        overflowX: "auto",
      }}
    >
      <Table
        sx={{ minWidth: 640, tableLayout: "fixed" }}
        aria-label="Database tables"
      >
        <TableHead>
          <TableRow sx={{ bgcolor: "background.elevated" }}>
            {COLUMNS.map((col, i) => (
              <TableCell
                key={i}
                sx={{
                  width: col.width,
                  py: 3,
                  ...edgePadding(i),
                  color: "text.disabled",
                  fontSize: 11,
                  lineHeight: "14px",
                  fontWeight: 600,
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

          {tables.map((table) => (
            <TableRow
              key={table.name}
              hover
              sx={{
                position: "relative",
                "&:last-child td": { borderBottom: 0 },
              }}
            >
              <TableCell sx={{ py: "14px", ...edgePadding(0) }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    component="span"
                    sx={{ display: "flex", color: "secondary.main" }}
                  >
                    <IconDatabase size={16} aria-hidden />
                  </Box>

                  {/* Stretched link: the ::after covers the whole row, so the entire row is clickable. */}
                  <Link
                    component={NextLink}
                    href={tableDetailHref(projectId, table.name)}
                    variant="code"
                    underline="none"
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      lineHeight: "18px",
                      color: "text.primary",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                      },
                      "&:focus-visible::after": {
                        outline: "2px solid",
                        outlineColor: "primary.main",
                        outlineOffset: -2,
                      },
                    }}
                  >
                    {table.name}
                  </Link>
                </Box>
              </TableCell>

              <TableCell sx={{ py: "14px", px: 0, typography: "code" }}>
                {table.rows.toLocaleString("en-US")}
              </TableCell>

              <TableCell sx={{ py: "14px", px: 0, typography: "code" }}>
                {table.size}
              </TableCell>

              <TableCell sx={{ py: "14px", px: 0 }}>
                {table.lastModified}
              </TableCell>

              <TableCell sx={{ py: "14px", px: 0 }}>
                <RlsBadge status={table.rls} />
              </TableCell>

              <TableCell
                align="center"
                sx={{ py: "14px", ...edgePadding(lastIndex) }}
              >
                {/* Sits above the stretched link so it won't trigger navigation. */}
                <IconButton
                  size="small"
                  aria-label={`Actions for ${table.name}`}
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    p: 1,
                    color: "text.secondary",
                  }}
                >
                  <IconDotsVertical size={16} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
