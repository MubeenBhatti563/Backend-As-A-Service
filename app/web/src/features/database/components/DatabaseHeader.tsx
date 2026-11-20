"use client";

import NextLink from "next/link";
import { Box, Divider, Link, Typography } from "@mui/material";
import { projectDatabaseBase } from "../constants";
import type { DatabaseStats } from "../types";

interface StatProps {
  label: string;
  value: string;
  color: string;
}

function Stat({ label, value, color }: StatProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <Typography
        component="div"
        variant="caption"
        sx={{
          fontSize: 11,
          lineHeight: "14px",
          color: "text.disabled",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      <Typography
        component="div"
        variant="code"
        sx={{
          fontSize: "0.875rem",
          fontWeight: 600,
          lineHeight: "18px",
          color,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

const StatDivider = () => (
  <Divider
    orientation="vertical"
    flexItem
    sx={{ height: 24, alignSelf: "center" }}
  />
);

interface Props {
  projectId: string;
  stats: DatabaseStats;
}

export function DatabaseHeader({ projectId, stats }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 3,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box
          component="nav"
          aria-label="Breadcrumb"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Link
            component={NextLink}
            href={projectDatabaseBase(projectId)}
            underline="hover"
            variant="body2"
            sx={{ color: "text.disabled" }}
          >
            Database
          </Link>
          <Typography
            variant="body2"
            sx={{ color: "text.disabled" }}
            aria-hidden
          >
            /
          </Typography>
          <Typography
            variant="body2"
            aria-current="page"
            sx={{ color: "text.primary" }}
          >
            Tables
          </Typography>
        </Box>

        <Typography variant="h4" component="h1">
          Database Engine
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 2, sm: 4 },
          flexWrap: "wrap",
        }}
      >
        <Stat label="DB size" value={stats.size} color="secondary.main" />
        <StatDivider />
        <Stat
          label="Tables"
          value={`${stats.totalTables} total`}
          color="text.primary"
        />
        <StatDivider />
        <Stat
          label="Connections"
          value={`${stats.activeConnections} active`}
          color="success.main"
        />
      </Box>
    </Box>
  );
}
