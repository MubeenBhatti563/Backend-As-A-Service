"use client";

import NextLink from "next/link";
import { Box, Typography } from "@mui/material";
import { projectTablesBase } from "../constants";
import type { DatabaseTable } from "../types";
import { HeaderStat, HeaderStatDivider } from "./HeaderStat";

function RlsPill({ status }: { status: DatabaseTable["rls"] }) {
  const active = status === "active";
  const color = active ? "success.main" : "secondary.main";

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        px: "10px",
        py: 1,
        border: "1px solid",
        borderColor: color,
        borderRadius: "99px",
        bgcolor: active ? "statusBackground.success" : "statusBackground.primary",
        color,
        typography: "code",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: "14px",
        textTransform: "uppercase",
      }}
    >
      RLS {active ? "Active" : "Disabled"}
    </Box>
  );
}

interface Props {
  projectId: string;
  table: DatabaseTable;
}

export function TableDetailHeader({ projectId, table }: Props) {
  const base = projectTablesBase(projectId);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Left: breadcrumb + title */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box
          component="nav"
          aria-label="Breadcrumb"
          sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 1.5 }}
        >
          <NextLink href={base} style={{ textDecoration: "none" }}>
            <Typography
              variant="body2"
              sx={{
                color: "text.disabled",
                "&:hover": { textDecoration: "underline", color: "text.primary" },
              }}
            >
              Database
            </Typography>
          </NextLink>
          <Typography variant="body2" sx={{ color: "text.disabled" }} aria-hidden>
            /
          </Typography>
          <NextLink href={base} style={{ textDecoration: "none" }}>
            <Typography
              variant="body2"
              sx={{
                color: "text.disabled",
                "&:hover": { textDecoration: "underline", color: "text.primary" },
              }}
            >
              Tables
            </Typography>
          </NextLink>
          <Typography variant="body2" sx={{ color: "text.disabled" }} aria-hidden>
            /
          </Typography>
          <Typography
            variant="body2"
            aria-current="page"
            sx={{ color: "text.primary", fontWeight: 500 }}
          >
            {table.name}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 3 }}>
          <Typography variant="h4" component="h1">
            {table.name}
          </Typography>
          <RlsPill status={table.rls} />
        </Box>
      </Box>

      {/* Right: stats */}
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4 }}>
        <HeaderStat
          label="Rows"
          value={table.rows.toLocaleString("en-US")}
          color="text.primary"
        />
        <HeaderStatDivider />
        <HeaderStat label="Data size" value={table.size} color="secondary.main" />
      </Box>
    </Box>
  );
}
