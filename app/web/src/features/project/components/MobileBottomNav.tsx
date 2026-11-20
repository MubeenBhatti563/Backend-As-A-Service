"use client";
import { Box, ButtonBase, Typography } from "@mui/material";
import {
  IconDatabase,
  IconKey,
  IconLayoutDashboard,
  IconMenu2,
  IconArchive,
  type Icon,
} from "@tabler/icons-react";
import NextLink from "next/link";
import { PROJECT_ROUTES } from "../constants";
import { MOBILE } from "../styles";
import type { ProjectNavKey } from "./ProjectNav";

const TABS: { key: ProjectNavKey; label: string; icon: Icon }[] = [
  { key: "overview", label: "Overview", icon: IconLayoutDashboard },
  { key: "database", label: "Database", icon: IconDatabase },
  { key: "auth", label: "API", icon: IconKey },
  { key: "storage", label: "Storage", icon: IconArchive },
];

const tabSx = (active: boolean) =>
  ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    height: "100%",
    color: active ? "info.main" : "text.secondary",
    textDecoration: "none",
    "& .label": {
      color: active ? "text.primary" : "text.secondary",
      fontSize: 10,
      fontWeight: active ? 600 : 500,
      lineHeight: "13px",
    },
  }) as const;

interface MobileBottomNavProps {
  projectId: string;
  activeKey?: ProjectNavKey;
  onMoreClick: () => void;
}

export function MobileBottomNav({
  projectId,
  activeKey = "overview",
  onMoreClick,
}: MobileBottomNavProps) {
  const routes = PROJECT_ROUTES.forProject(projectId);
  return (
    <Box
      component="nav"
      aria-label="Project tabs"
      sx={{
        display: "none",
        flex: "none",
        height: 64,
        bgcolor: "background.default",
        borderTop: 1,
        borderColor: "border.default",
        [MOBILE]: { display: "flex" },
      }}
    >
      {TABS.map(({ key, label, icon: IconCmp }) => (
        <Box
          key={key}
          component={NextLink}
          href={routes[key]}
          aria-current={key === activeKey ? "page" : undefined}
          sx={tabSx(key === activeKey)}
        >
          <IconCmp size={18} aria-hidden />
          <Typography component="span" className="label">
            {label}
          </Typography>
        </Box>
      ))}
      <ButtonBase onClick={onMoreClick} aria-label="More" sx={tabSx(false)}>
        <IconMenu2 size={18} aria-hidden />
        <Typography component="span" className="label">
          More
        </Typography>
      </ButtonBase>
    </Box>
  );
}
