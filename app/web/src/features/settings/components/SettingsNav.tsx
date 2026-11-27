"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Link, Stack } from "@mui/material";
import { PROJECT_SETTINGS_SECTIONS, settingsBase } from "../constants";

export function SettingsNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = settingsBase(projectId);

  return (
    <Stack
      component="nav"
      aria-label="Settings sections"
      sx={{
        width: { xs: "100%", md: 200 },
        flexShrink: 0,
        flexDirection: { xs: "row", md: "column" },
        gap: "2px",
        overflowX: { xs: "auto", md: "visible" },
        overflowY: "hidden",
        pb: { xs: 1, md: 0 },
        WebkitOverflowScrolling: "touch",
      }}
    >
      {PROJECT_SETTINGS_SECTIONS.map((section) => {
        const href = section.slug ? `${base}/${section.slug}` : base;
        const active = section.slug
          ? pathname.startsWith(href)
          : pathname === base;

        return (
          <Link
            key={section.slug || "general"}
            component={NextLink}
            href={href}
            underline="none"
            aria-current={active ? "page" : undefined}
            sx={{
              flexShrink: 0,
              px: "11px",
              py: "7px",
              border: "1px solid",
              borderColor:
                section.danger && active ? "error.main" : "transparent",
              borderRadius: "6px",
              fontSize: 13,
              lineHeight: "17px",
              whiteSpace: "nowrap",
              fontWeight: active ? 600 : 500,
              color: section.danger
                ? "error.main"
                : active
                  ? "text.primary"
                  : "text.secondary",
              bgcolor: section.danger
                ? active
                  ? "statusBackground.error"
                  : "transparent"
                : active
                  ? "background.elevated"
                  : "transparent",
              "&:hover": {
                bgcolor: section.danger
                  ? "statusBackground.error"
                  : "action.hover",
                color: section.danger ? "error.main" : "text.primary",
              },
            }}
          >
            {section.label}
          </Link>
        );
      })}
    </Stack>
  );
}
