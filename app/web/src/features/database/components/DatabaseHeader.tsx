"use client";

import NextLink from "next/link";
import { Box, Link, Typography } from "@mui/material";
import { font } from "@/features/project/styles";
import { projectTablesBase } from "../constants";
import type { DatabaseStats } from "../types";

interface StatProps {
  label: string;
  value: string;
  color: string;
}

function Stat({ label, value, color }: StatProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        flexShrink: 0,
      }}
    >
      <Typography
        component="div"
        variant="caption"
        sx={{
          fontSize: 11,
          lineHeight: "14px",
          color: "text.disabled",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
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

interface Props {
  projectId: string;
  stats: DatabaseStats;
}

export function DatabaseHeader({ projectId, stats }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", md: "center" },
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
            gap: 1.5,
          }}
        >
          <Link
            component={NextLink}
            href={projectTablesBase(projectId)}
            underline="hover"
            variant="body2"
            sx={{ color: "text.disabled", fontSize: 13 }}
          >
            Database
          </Link>
          <Typography
            variant="body2"
            sx={{ color: "text.disabled", fontSize: 13 }}
            aria-hidden
          >
            /
          </Typography>
          <Typography
            variant="body2"
            aria-current="page"
            sx={{ color: "text.primary", fontSize: 13, fontWeight: 500 }}
          >
            Tables
          </Typography>
        </Box>

        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontFamily: font.display,
            fontSize: { xs: 24, sm: 28 },
            fontWeight: 800,
            lineHeight: 1.2,
            color: "text.primary",
          }}
        >
          Database Engine
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 2.5, sm: 3.5 },
          flexWrap: "wrap",
        }}
      >
        <Stat label="DB size" value={stats.size} color="secondary.main" />
        <Box
          sx={{
            width: "1px",
            height: 24,
            bgcolor: "border.default",
            flexShrink: 0,
          }}
        />
        <Stat
          label="Tables"
          value={`${stats.totalTables} total`}
          color="text.primary"
        />
        <Box
          sx={{
            width: "1px",
            height: 24,
            bgcolor: "border.default",
            flexShrink: 0,
          }}
        />
        <Stat
          label="Connections"
          value={`${stats.activeConnections} active`}
          color="success.main"
        />
      </Box>
    </Box>
  );
}
