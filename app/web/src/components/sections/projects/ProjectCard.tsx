"use client";
import { font, panelSx } from "@/components/ui/projectStyle";
import { ACCOUNT_ROUTES } from "@/config/routes";
import { Project, ProjectIconKey } from "@/types/projectPage";
import { Box, IconButton, Typography } from "@mui/material";
import {
  IconArrowRight,
  IconBox,
  IconDatabase,
  IconDots,
  IconFlask,
  IconServer,
  IconWorld,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import NextLink from "next/link";

const PROJECT_ICONS: Record<ProjectIconKey, Icon> = {
  box: IconBox,
  flask: IconFlask,
};

function Footprint({
  icon: IconCmp,
  value,
  label,
}: {
  icon: Icon;
  value: string;
  label: string;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <IconCmp size={12} color="#94A3B8" aria-hidden />
      <Typography
        component="span"
        sx={{ fontFamily: font.mono, fontSize: 11, lineHeight: "14px" }}
      >
        {value}
      </Typography>
      <Typography
        component="span"
        sx={{ color: "text.disabled", fontSize: 10, lineHeight: "13px" }}
      >
        {label}
      </Typography>
    </Box>
  );
}

interface ProjectCardProps {
  project: Project;
  href?: string;
  onMenuClick?: (project: Project) => void;
}

export function ProjectCard({
  project,
  href = ACCOUNT_ROUTES.project(project.id),
  onMenuClick,
}: ProjectCardProps) {
  const ProjectIcon = PROJECT_ICONS[project.icon ?? "box"];
  const active = project.status === "active";

  return (
    <Box
      component="article"
      sx={{
        ...panelSx,
        display: "flex",
        flexDirection: "column",
        gap: 3.5,
        p: "17px",
        minWidth: 0,
      }}
    >
      {/* identity */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            flex: "none",
            width: 34,
            height: 34,
            bgcolor: "background.elevated",
            border: 1,
            borderColor: "border.default",
            borderRadius: 1,
            color: "secondary.main",
          }}
        >
          <ProjectIcon size={16} aria-hidden />
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "3px",
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            noWrap
            sx={{ fontSize: 17, fontWeight: 600, lineHeight: "21px" }}
          >
            {project.name}
          </Typography>
          <Typography
            noWrap
            sx={{
              color: "text.disabled",
              fontFamily: font.mono,
              fontSize: 10,
              lineHeight: "13px",
            }}
          >
            {project.identifier}
          </Typography>
        </Box>
        <IconButton
          aria-label={`${project.name} actions`}
          size="small"
          onClick={() => onMenuClick?.(project)}
          sx={{
            flex: "none",
            p: 0.5,
            color: "text.secondary",
            "&:hover": {
              color: "text.primary",
              bgcolor: "background.elevated",
            },
          }}
        >
          <IconDots size={16} aria-hidden />
        </IconButton>
      </Box>

      <Typography
        sx={{ color: "text.secondary", fontSize: 12, lineHeight: "16px" }}
      >
        {project.description}
      </Typography>

      {/* deployment */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            minWidth: 0,
          }}
        >
          <IconWorld size={12} color="#94A3B8" aria-hidden />
          <Typography
            noWrap
            sx={{ color: "text.secondary", fontSize: 11, lineHeight: "14px" }}
          >
            {project.region}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            flex: "none",
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 5,
              height: 5,
              borderRadius: "99px",
              bgcolor: active ? "success.main" : "text.disabled",
            }}
          />
          <Typography
            component="span"
            sx={{
              color: active ? "success.main" : "text.secondary",
              fontSize: 11,
              lineHeight: "14px",
            }}
          >
            {active ? "Active" : "Paused"}
          </Typography>
        </Box>
      </Box>

      {/* footprint */}
      <Box sx={{ display: "flex", gap: 5, pt: "2px" }}>
        <Footprint icon={IconDatabase} value={project.dbSize} label="DB" />
        <Footprint icon={IconServer} value={project.fileSize} label="files" />
      </Box>

      {/* footer */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          pt: "11px",
          borderTop: 1,
          borderColor: "border.default",
        }}
      >
        <Typography
          sx={{ color: "text.disabled", fontSize: 11, lineHeight: "14px" }}
        >
          {project.lastActivity}
        </Typography>
        <Box
          component={NextLink}
          href={href}
          aria-label={`Open ${project.name}`}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1.5,
            color: "text.primary",
            fontSize: 12,
            fontWeight: 600,
            lineHeight: "16px",
            textDecoration: "none",
            "& svg": { color: "secondary.main" },
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Open project
          <IconArrowRight size={13} aria-hidden />
        </Box>
      </Box>
    </Box>
  );
}
