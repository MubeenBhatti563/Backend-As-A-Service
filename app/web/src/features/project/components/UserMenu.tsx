"use client";
import {
  Box,
  ButtonBase,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { IconChevronDown, IconLogout } from "@tabler/icons-react";
import { useId, useState } from "react";
import { useAuthStore } from "@/stores";
import { MOBILE } from "../styles";
import { useLogout } from "@/features/auth";

interface UserMenuProps {
  email: string;
  /** Override to use your own logout. Defaults to POST LOGOUT_ENDPOINT, then goes to the login page. */
  onLogout?: () => void | Promise<void>;
}

export function UserMenu({ email, onLogout }: UserMenuProps) {
  const id = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const open = Boolean(anchorEl);
  const logoutUser = useLogout();

  const logout =
    onLogout ??
    (async () => {
      await logoutUser.mutateAsync();
    });

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      useAuthStore.getState().clearUser();
    } finally {
      setLoggingOut(false);
      setAnchorEl(null);
    }
  };

  return (
    <>
      <ButtonBase
        id={`${id}-button`}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open ? true : undefined}
        aria-controls={open ? `${id}-menu` : undefined}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderRadius: 0.75,
          "& .chevron": { transition: "transform 150ms" },
          "&[aria-expanded=true] .chevron": { transform: "rotate(180deg)" },
        }}
      >
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            width: 28,
            height: 28,
            bgcolor: "background.default",
            border: 1,
            borderColor: "border.default",
            borderRadius: "99px",
            color: "text.secondary",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {email.charAt(0).toUpperCase()}
        </Box>
        <Typography
          component="span"
          sx={{
            fontSize: 13,
            fontWeight: 500,
            lineHeight: "17px",
            [MOBILE]: { display: "none" },
          }}
        >
          {email}
        </Typography>
        <IconChevronDown
          className="chevron"
          size={12}
          color="#94A3B8"
          aria-hidden
        />
      </ButtonBase>

      <Menu
        id={`${id}-menu`}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          list: {
            "aria-labelledby": `${id}-button`,
            dense: true,
            sx: { py: 1 },
          },
          paper: {
            sx: {
              mt: 2,
              minWidth: 220,
              bgcolor: "background.default",
              border: 1,
              borderColor: "border.default",
              borderRadius: 1,
            },
          },
        }}
      >
        <Box sx={{ px: 3, py: 2 }}>
          <Typography
            sx={{ color: "text.disabled", fontSize: 11, lineHeight: "14px" }}
          >
            Signed in as
          </Typography>
          <Typography
            noWrap
            sx={{
              mt: 0.5,
              maxWidth: 260,
              fontSize: 13,
              fontWeight: 500,
              lineHeight: "17px",
            }}
          >
            {email}
          </Typography>
        </Box>
        <Divider sx={{ borderColor: "border.default", my: 1 }} />
        <MenuItem
          onClick={handleLogout}
          disabled={loggingOut}
          sx={{
            gap: 0,
            mx: 1,
            borderRadius: 0.75,
            fontSize: 13,
            color: "text.secondary",
            "&:hover": {
              bgcolor: "background.elevated",
              color: "text.primary",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: 2.5, color: "inherit" }}>
            <IconLogout size={16} aria-hidden />
          </ListItemIcon>
          {loggingOut ? "Logging out…" : "Log out"}
        </MenuItem>
      </Menu>
    </>
  );
}
