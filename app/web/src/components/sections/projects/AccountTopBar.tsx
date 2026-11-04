"use client";
import { Brand } from "@/components/common";
import { HIDE_BELOW_720 } from "@/components/ui/projectStyle";
import { ACCOUNT_ROUTES } from "@/config/routes";
import { useLogout } from "@/features/auth";
import {
  Box,
  ButtonBase,
  Divider,
  IconButton,
  Link as MuiLink,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  IconBell,
  IconBook,
  IconChevronDown,
  IconLogout,
  IconUser,
} from "@tabler/icons-react";
import NextLink from "next/link";
import { useId, useState } from "react";

const COPY = {
  context: "Personal account",
  docs: "Documentation",
  notifications: "Notifications",
  userMenu: "Account menu",
  signedInAs: "Signed in as",
  logout: "Log out",
  loggingOut: "Logging out…",
  fullName: "Full name",
} as const;

interface AccountTopBarProps {
  fullName: string;
  email: string;
  contextLabel?: string;
  onNotificationsClick?: () => void;
  onLogout?: () => void | Promise<void>;
}

export function AccountTopBar({
  fullName,
  email,
  contextLabel = COPY.context,
  onNotificationsClick,
}: AccountTopBarProps) {
  const menuId = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const open = Boolean(anchorEl);

  const logout = useLogout();
  const closeMenu = () => setAnchorEl(null);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout.mutateAsync();
    } finally {
      setLoggingOut(false);
      closeMenu();
    }
  };

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
        bgcolor: "background.input",
      }}
    >
      {/* brand + account context */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
        <Brand size="sm" />
        <Typography
          component="span"
          aria-hidden
          sx={{
            color: "text.disabled",
            fontSize: 13,
            lineHeight: "17px",
            [HIDE_BELOW_720]: { display: "none" },
          }}
        >
          /
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: "10px",
            py: "5px",
            bgcolor: "background.default",
            border: 1,
            borderColor: "border.default",
            borderRadius: 0.75,
            [HIDE_BELOW_720]: { display: "none" },
          }}
        >
          <IconUser size={13} color="#94A3B8" aria-hidden />
          <Typography
            component="span"
            sx={{ fontSize: 13, fontWeight: 600, lineHeight: "17px" }}
          >
            {contextLabel}
          </Typography>
        </Box>
      </Box>

      {/* actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
        <MuiLink
          component={NextLink}
          href={ACCOUNT_ROUTES.docs}
          underline="none"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1.5,
            color: "text.secondary",
            fontSize: 13,
            lineHeight: "17px",
            "&:hover": { color: "text.primary" },
            [HIDE_BELOW_720]: { display: "none" },
          }}
        >
          <IconBook size={14} aria-hidden />
          {COPY.docs}
        </MuiLink>

        <IconButton
          aria-label={COPY.notifications}
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

        {/* profile: click to open the menu with the email and Log out */}
        <ButtonBase
          id={`${menuId}-button`}
          aria-label={COPY.userMenu}
          aria-haspopup="menu"
          aria-expanded={open ? true : undefined}
          aria-controls={open ? `${menuId}-menu` : undefined}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderRadius: 0.75,
            "&:hover .MuiTypography-root, &[aria-expanded=true] .MuiTypography-root":
              { color: "text.primary" },
            "& .chevron": {
              transition: "transform 150ms",
            },
            "&[aria-expanded=true] .chevron": { transform: "rotate(180deg)" },
          }}
        >
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              width: 28,
              height: 28,
              bgcolor: "background.elevated",
              border: 1,
              borderColor: "border.strong",
              borderRadius: "99px",
              color: "text.secondary",
              fontSize: 11,
              fontWeight: 600,
              lineHeight: "14px",
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
              [HIDE_BELOW_720]: { display: "none" },
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
          id={`${menuId}-menu`}
          anchorEl={anchorEl}
          open={open}
          onClose={closeMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            list: {
              "aria-labelledby": `${menuId}-button`,
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
          {/* who is signed in */}
          <Box sx={{ px: 3, py: 2 }}>
            <Typography
              sx={{ color: "text.disabled", fontSize: 11, lineHeight: "14px" }}
            >
              {COPY.signedInAs}
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

          {/* who is signed in name*/}
          <Box sx={{ px: 3, py: 2 }}>
            <Typography
              sx={{ color: "text.disabled", fontSize: 11, lineHeight: "14px" }}
            >
              {COPY.fullName}
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
              {fullName}
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
            {loggingOut ? COPY.loggingOut : COPY.logout}
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
