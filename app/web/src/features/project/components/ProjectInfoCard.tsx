"use client";
import { Box, Typography } from "@mui/material";
import { font, MOBILE, panelSx } from "../styles";
import type { ProjectInfo, ProjectStatus } from "../types";

const STATUS: Record<ProjectStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "success.main" },
  paused: { label: "Paused", color: "text.disabled" },
  pending: { label: "Pending", color: "warning.main" },
};

function Item({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
      <Typography
        sx={{
          color: "text.disabled",
          fontSize: 11,
          lineHeight: "14px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      {children}
    </Box>
  );
}

const valueSx = { fontSize: 15, fontWeight: 600, lineHeight: "20px" } as const;

/** Desktop: PROJECT NAME / ID / REGION / STATUS / CREATED DATE. */
export function ProjectInfoCard({ project }: { project: ProjectInfo }) {
  const status = STATUS[project.status];
  return (
    <Box
      component="section"
      aria-label="Project details"
      sx={{
        ...panelSx,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 4,
        p: "19px",
        [MOBILE]: { display: "none" },
      }}
    >
      <Item label="Project name">
        <Typography sx={valueSx}>{project.name}</Typography>
      </Item>
      <Item label="Project ID">
        <Typography sx={valueSx}>{project.identifier}</Typography>
      </Item>
      <Item label="Region">
        <Typography sx={valueSx}>{project.region}</Typography>
      </Item>
      <Item label="Status">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            color: status.color,
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 8,
              height: 8,
              borderRadius: "99px",
              bgcolor: "currentColor",
            }}
          />
          <Typography
            component="span"
            sx={{
              color: "inherit",
              fontSize: 14,
              fontWeight: 600,
              lineHeight: "18px",
            }}
          >
            {status.label}
          </Typography>
        </Box>
      </Item>
      <Item label="Created date">
        <Typography sx={valueSx}>{project.createdAt}</Typography>
      </Item>
    </Box>
  );
}

/** Mobile: one compact row with the status dot, name and region badge. */
export function ProjectInfoCompact({ project }: { project: ProjectInfo }) {
  const status = STATUS[project.status];
  return (
    <Box
      aria-label="Project details"
      sx={{
        ...panelSx,
        display: "none",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        p: "11px",
        borderRadius: 1,
        [MOBILE]: { display: "flex" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
        <Box
          role="img"
          aria-label={status.label}
          sx={{
            flex: "none",
            width: 8,
            height: 8,
            borderRadius: "99px",
            bgcolor: status.color,
          }}
        />
        <Typography
          noWrap
          sx={{ fontSize: 14, fontWeight: 600, lineHeight: "18px" }}
        >
          {project.name}
        </Typography>
      </Box>
      <Box
        component="span"
        sx={{
          flex: "none",
          px: 2,
          py: "3px",
          bgcolor: (t) => t.palette.statusBackground.primary,
          borderRadius: 0.5,
          color: "info.main",
          fontFamily: font.mono,
          fontSize: 10,
          lineHeight: "13px",
        }}
      >
        {project.regionCode}
      </Box>
    </Box>
  );
}
