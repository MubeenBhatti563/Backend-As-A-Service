"use client";
import { Box, Typography } from "@mui/material";
import {
  IconBook,
  IconBolt,
  IconBrain,
  IconChartBar,
  IconDatabase,
  IconHelpCircle,
  IconKey,
  IconLayoutDashboard,
  IconSettings,
  IconSourceCode,
  IconTerminal2,
  IconUser,
  type Icon,
} from "@tabler/icons-react";
import NextLink from "next/link";
import { PROJECT_ROUTES } from "../constants";

export type ProjectNavKey =
  | "overview" | "database" | "auth" | "storage" | "realtime" | "functions" | "ai"
  | "logs" | "usage" | "settings";

interface NavEntry {
  key: ProjectNavKey;
  label: string;
  icon: Icon;
}

const MAIN: NavEntry[] = [
  { key: "overview", label: "Overview", icon: IconLayoutDashboard },
  { key: "database", label: "Database", icon: IconDatabase },
  { key: "auth", label: "Authentication", icon: IconKey },
  { key: "storage", label: "Storage", icon: IconDatabase },
  { key: "realtime", label: "Realtime", icon: IconBolt },
  { key: "functions", label: "Edge Functions", icon: IconSourceCode },
  { key: "ai", label: "AI Assistant", icon: IconBrain },
];

const SECONDARY: NavEntry[] = [
  { key: "logs", label: "Logs", icon: IconTerminal2 },
  { key: "usage", label: "Usage", icon: IconChartBar },
  { key: "settings", label: "Settings", icon: IconSettings },
];

function NavItem({ href, icon: IconCmp, label, active, onClick }: { href: string; icon: Icon; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <Box
      component={NextLink}
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        px: 3,
        py: 2,
        borderRadius: 0.75,
        textDecoration: "none",
        color: active ? "common.white" : "text.secondary",
        bgcolor: active ? "primary.main" : "transparent",
        "&:hover": { bgcolor: active ? "primary.main" : "background.elevated", color: "text.primary" },
      }}
    >
      <IconCmp size={16} aria-hidden />
      <Typography component="span" sx={{ flexGrow: 1, color: "inherit", fontSize: 13, fontWeight: active ? 600 : 500, lineHeight: "17px" }}>
        {label}
      </Typography>
    </Box>
  );
}

interface ProjectNavProps {
  projectId: string;
  activeKey?: ProjectNavKey;
  /** Called after a link is clicked (the mobile drawer uses it to close itself). */
  onNavigate?: () => void;
}

/** The sidebar's content. Used by the desktop sidebar and the mobile drawer. */
export function ProjectNav({ projectId, activeKey = "overview", onNavigate }: ProjectNavProps) {
  const routes = PROJECT_ROUTES.forProject(projectId);
  const item = (e: NavEntry) => (
    <NavItem key={e.key} href={routes[e.key]} icon={e.icon} label={e.label} active={e.key === activeKey} onClick={onNavigate} />
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flexGrow: 1, minHeight: 0, gap: 6 }}>
      <Box component="nav" aria-label="Project" sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {MAIN.map(item)}
        <Box role="separator" sx={{ my: 2, height: "1px", bgcolor: "border.default" }} />
        {SECONDARY.map(item)}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <NavItem href={PROJECT_ROUTES.docs} icon={IconBook} label="Documentation" onClick={onNavigate} />
        <NavItem href={PROJECT_ROUTES.support} icon={IconHelpCircle} label="Help & Support" onClick={onNavigate} />
        <NavItem href={PROJECT_ROUTES.profile} icon={IconUser} label="My Profile" onClick={onNavigate} />
      </Box>
    </Box>
  );
}
