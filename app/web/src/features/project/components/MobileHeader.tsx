"use client";
import { Box, IconButton } from "@mui/material";
import { IconBell, IconMenu2 } from "@tabler/icons-react";
import { Brand } from "@/components/common";
import { PROJECT_ROUTES } from "../constants";
import { MOBILE } from "../styles";

interface MobileHeaderProps {
  onMenuClick: () => void;
  onNotificationsClick?: () => void;
}

export function MobileHeader({
  onMenuClick,
  onNotificationsClick,
}: MobileHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        display: "none",
        alignItems: "center",
        justifyContent: "space-between",
        flex: "none",
        height: 56,
        px: 4,
        borderBottom: 1,
        borderColor: "border.default",
        [MOBILE]: { display: "flex" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        <IconButton
          aria-label="Open menu"
          onClick={onMenuClick}
          sx={{ p: 0, color: "common.white" }}
        >
          <IconMenu2 size={20} aria-hidden />
        </IconButton>
        <Brand size="md" href={PROJECT_ROUTES.accountHome} />
      </Box>
      <IconButton
        aria-label="Notifications"
        onClick={onNotificationsClick}
        sx={{ p: 0, color: "common.white" }}
      >
        <IconBell size={18} aria-hidden />
      </IconButton>
    </Box>
  );
}
