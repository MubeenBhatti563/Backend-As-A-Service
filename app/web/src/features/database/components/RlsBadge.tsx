"use client";

import { Box } from "@mui/material";
import type { RlsStatus } from "../types";

const VARIANTS: Record<
  RlsStatus,
  { label: string; bg: string; color: string }
> = {
  active: {
    label: "Active",
    bg: "statusBackground.success",
    color: "success.main",
  },
  // Matches Figma: primary tint background with the cyan (secondary) label.
  disabled: {
    label: "Disabled",
    bg: "statusBackground.primary",
    color: "secondary.main",
  },
};

export function RlsBadge({ status }: { status: RlsStatus }) {
  const { label, bg, color } = VARIANTS[status];

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        px: 2,
        py: "2px",
        borderRadius: "4px",
        bgcolor: bg,
        color,
        typography: "code",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: "14px",
      }}
    >
      {label}
    </Box>
  );
}
