"use client";
import { Box, IconButton, InputBase, Typography } from "@mui/material";
import { IconBell, IconSearch } from "@tabler/icons-react";
import { Brand } from "@/components/common";
import { PROJECT_ROUTES } from "../constants";
import { MOBILE } from "../styles";
import type { ProjectOption } from "../types";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { UserMenu } from "./UserMenu";

interface ProjectTopBarProps {
  projectId: string;
  projects: ProjectOption[];
  email: string;
  onLogout?: () => void | Promise<void>;
  onNotificationsClick?: () => void;
}

export function ProjectTopBar({
  projectId,
  projects,
  email,
  onLogout,
  onNotificationsClick,
}: ProjectTopBarProps) {
  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flex: "none",
        height: 64,
        px: 6,
        borderBottom: 1,
        borderColor: "border.default",
        [MOBILE]: { display: "none" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
        <Brand size="sm" href={PROJECT_ROUTES.accountHome} />
        <Typography
          component="span"
          aria-hidden
          sx={{ color: "text.disabled", fontSize: 13, lineHeight: "17px" }}
        >
          /
        </Typography>
        <ProjectSwitcher projects={projects} currentId={projectId} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Box
          component="form"
          role="search"
          onSubmit={(e) => e.preventDefault()}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: 280,
            height: 29,
            px: 3,
            bgcolor: "background.default",
            border: 1,
            borderColor: "border.default",
            borderRadius: 0.75,
            "&:focus-within": { borderColor: "primary.main" },
          }}
        >
          <IconSearch size={14} color="#94A3B8" aria-hidden />
          <InputBase
            placeholder="Search anything…"
            slotProps={{ input: { "aria-label": "Search" } }}
            sx={{
              flexGrow: 1,
              fontSize: 13,
              lineHeight: "17px",
              "& input": { p: 0, height: 17 },
              "& input::placeholder": { color: "text.secondary", opacity: 1 },
            }}
          />
        </Box>

        <IconButton
          aria-label="Notifications"
          onClick={onNotificationsClick}
          sx={{
            width: 32,
            height: 32,
            p: 0,
            bgcolor: "background.default",
            border: 1,
            borderColor: "border.default",
            borderRadius: 0.75,
            color: "text.secondary",
            "&:hover": {
              bgcolor: "background.elevated",
              color: "text.primary",
            },
          }}
        >
          <IconBell size={16} aria-hidden />
        </IconButton>

        <Box
          aria-hidden
          sx={{ width: "1px", height: 24, bgcolor: "border.default" }}
        />

        <UserMenu email={email} onLogout={onLogout} />
      </Box>
    </Box>
  );
}
