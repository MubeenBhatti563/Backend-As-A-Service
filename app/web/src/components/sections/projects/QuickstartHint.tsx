"use client";
import { ACCOUNT_ROUTES } from "@/config/routes";
import { Box, Link as MuiLink, Typography } from "@mui/material";
import { IconArrowUpRight, IconTerminal2 } from "@tabler/icons-react";
import NextLink from "next/link";

export function QuickstartHint({
  href = ACCOUNT_ROUTES.quickstart,
}: {
  href?: string;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 3, px: 1 }}>
      <Box sx={{ display: "flex", color: "secondary.main" }}>
        <IconTerminal2 size={16} aria-hidden />
      </Box>
      <Typography
        sx={{
          flexGrow: 1,
          color: "text.secondary",
          fontSize: 12,
          lineHeight: "16px",
        }}
      >
        Pick a project, then connect your app with the DevStack SDK.
      </Typography>
      <MuiLink
        component={NextLink}
        href={href}
        underline="none"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          flex: "none",
          color: "text.primary",
          fontSize: 12,
          fontWeight: 500,
          lineHeight: "16px",
          "& svg": { color: "secondary.main" },
          "&:hover": { textDecoration: "underline" },
        }}
      >
        Quickstart
        <IconArrowUpRight size={13} aria-hidden />
      </MuiLink>
    </Box>
  );
}
