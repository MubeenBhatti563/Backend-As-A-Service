"use client";

import { Box } from "@mui/material";

export type ChipTone = "success" | "info" | "neutral" | "muted";

const TONES: Record<ChipTone, { bg: string; color: string }> = {
  success: { bg: "statusBackground.success", color: "success.main" },
  info: { bg: "statusBackground.primary", color: "secondary.main" },
  neutral: { bg: "background.elevated", color: "text.secondary" },
  muted: { bg: "statusBackground.primary", color: "text.disabled" },
};

/** Mock value -> tone mapping. Replace with real enums once the data is wired. */
const VALUE_TONES: Record<string, ChipTone> = {
  Active: "success",
  Published: "success",
  Admin: "info",
  Inactive: "muted",
  Draft: "muted",
  User: "neutral",
};

export const toneFor = (value: string): ChipTone => VALUE_TONES[value] ?? "neutral";

export function StatusChip({ label, tone }: { label: string; tone: ChipTone }) {
  const { bg, color } = TONES[tone];

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
