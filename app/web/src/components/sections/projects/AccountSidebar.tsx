"use client";
import { badgeSx, font, HIDE_BELOW_900 } from "@/components/ui/projectStyle";
import { ACCOUNT_ROUTES } from "@/config/routes";
import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import {
  IconBook,
  IconChartBar,
  IconHelpCircle,
  IconLayoutGrid,
  IconSettings,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import NextLink from "next/link";

const COPY = {
  scopeNote:
    "Select a project to manage its database, auth, storage, and services.",
  docs: "Documentation",
  help: "Help & Support",
} as const;

export type AccountNavKey = "projects" | "usage" | "settings";

const NAV: { key: AccountNavKey; label: string; href: string; icon: Icon }[] = [
  {
    key: "projects",
    label: "All projects",
    href: ACCOUNT_ROUTES.projects,
    icon: IconLayoutGrid,
  },
  {
    key: "usage",
    label: "Usage & billing",
    href: ACCOUNT_ROUTES.usage,
    icon: IconChartBar,
  },
  {
    key: "settings",
    label: "Account settings",
    href: ACCOUNT_ROUTES.settings,
    icon: IconSettings,
  },
];

function NavLink({
  href,
  icon: IconCmp,
  label,
  active,
  count,
}: {
  href: string;
  icon: Icon;
  label: string;
  active?: boolean;
  count?: number;
}) {
  const sx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 3,
    height: 36,
    px: 3,
    borderRadius: 0.75,
    textDecoration: "none",
    color: active ? "text.primary" : "text.secondary",
    bgcolor: active ? "primary.main" : "transparent",
    "&:hover": {
      bgcolor: active ? "primary.main" : "background.elevated",
      color: "text.primary",
    },
  };
  return (
    <Box
      component={NextLink}
      href={href}
      aria-current={active ? "page" : undefined}
      sx={sx}
    >
      <IconCmp size={16} aria-hidden />
      <Typography
        component="span"
        sx={{
          flexGrow: 1,
          fontSize: 13,
          fontWeight: active ? 600 : 500,
          lineHeight: "17px",
          color: "inherit",
        }}
      >
        {label}
      </Typography>
      {count !== undefined && (
        <Typography
          component="span"
          sx={{
            fontFamily: font.mono,
            fontSize: 11,
            lineHeight: "14px",
            color: "inherit",
          }}
        >
          {count}
        </Typography>
      )}
    </Box>
  );
}

interface AccountSidebarProps {
  accountName: string;
  plan: string;
  tier: string;
  activeKey?: AccountNavKey;
  projectCount: number;
  statusLabel?: string;
}

export function AccountSidebar({
  accountName,
  plan,
  tier,
  activeKey = "projects",
  projectCount,
  statusLabel = "All systems operational",
}: AccountSidebarProps) {
  return (
    <Box
      component="aside"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flex: "none",
        width: 240,
        p: 4,
        overflowY: "auto",
        bgcolor: "background.default",
        borderRight: 1,
        borderColor: "border.default",
        [HIDE_BELOW_900]: { display: "none" },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {/* identity */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            px: 3,
            pt: 2,
          }}
        >
          <Typography
            sx={{ fontSize: 14, fontWeight: 600, lineHeight: "18px" }}
          >
            {accountName}&apos;s account
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Box component="span" sx={badgeSx}>
              {plan}
            </Box>
            <Box component="span" sx={badgeSx}>
              {tier}
            </Box>
          </Box>
        </Box>

        <Box
          component="nav"
          aria-label="Account"
          sx={{ display: "flex", flexDirection: "column", gap: 1 }}
        >
          {NAV.map((item) => (
            <NavLink
              key={item.key}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={item.key === activeKey}
              count={item.key === "projects" ? projectCount : undefined}
            />
          ))}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: 3 }}>
          <Box aria-hidden sx={{ height: "1px", bgcolor: "border.default" }} />
          <Typography
            sx={{ color: "text.disabled", fontSize: 12, lineHeight: 1.6 }}
          >
            {COPY.scopeNote}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <NavLink href={ACCOUNT_ROUTES.docs} icon={IconBook} label={COPY.docs} />
        <NavLink
          href={ACCOUNT_ROUTES.help}
          icon={IconHelpCircle}
          label={COPY.help}
        />
        <Box
          role="status"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            px: 3,
            pt: "18px",
            pb: 2,
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 6,
              height: 6,
              borderRadius: "99px",
              bgcolor: "success.main",
            }}
          />
          <Typography
            component="span"
            sx={{ color: "text.secondary", fontSize: 11, lineHeight: "14px" }}
          >
            {statusLabel}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
