"use client";
import { Box, Drawer } from "@mui/material";
import { useState, type ReactNode } from "react";
import { MOBILE } from "../styles";
import type { ProjectOption } from "../types";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { ProjectNav, type ProjectNavKey } from "./ProjectNav";
import { ProjectSidebar } from "./ProjectSidebar";
import { ProjectTopBar } from "./ProjectTopBar";

interface ProjectShellProps {
  projectId: string;
  projects: ProjectOption[];
  email: string;
  activeKey?: ProjectNavKey;
  onLogout?: () => void | Promise<void>;
  children: ReactNode;
}

/** App frame for every /dashboard/projects/[id]/* page: top bar + sidebar on desktop, header + tabs + drawer on mobile. */
export function ProjectShell({ projectId, projects, email, activeKey = "overview", onLogout, children }: ProjectShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100dvh", bgcolor: "background.input" }}>
      <ProjectTopBar projectId={projectId} projects={projects} email={email} onLogout={onLogout} />
      <MobileHeader onMenuClick={() => setDrawerOpen(true)} />

      <Box sx={{ display: "flex", flexGrow: 1, minHeight: 0 }}>
        <ProjectSidebar projectId={projectId} activeKey={activeKey} />
        <Box component="main" sx={{ flexGrow: 1, minWidth: 0, overflowY: "auto", p: 8, [MOBILE]: { p: 4 } }}>
          {children}
        </Box>
      </Box>

      <MobileBottomNav projectId={projectId} activeKey={activeKey} onMoreClick={() => setDrawerOpen(true)} />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: 280, maxWidth: "85vw", p: 4, bgcolor: "background.default" } } }}
        sx={{ display: "none", [MOBILE]: { display: "block" } }}
      >
        <ProjectNav projectId={projectId} activeKey={activeKey} onNavigate={() => setDrawerOpen(false)} />
      </Drawer>
    </Box>
  );
}
