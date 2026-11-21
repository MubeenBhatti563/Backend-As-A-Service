"use client";
import { Box, Typography } from "@mui/material";
import { font, MOBILE, panelSx } from "../styles";
import type { StatMetric, StatTone } from "../types";

const TONES: Record<StatTone, { bg: "success" | "primary"; color: string }> = {
  success: { bg: "success", color: "success.main" },
  info: { bg: "primary", color: "secondary.main" },
};

export function StatCard({
  label,
  value,
  change,
  tone = "success",
  hideOnMobile = false,
}: Omit<StatMetric, "key">) {
  const t = TONES[tone ?? "success"];
  return (
    <Box
      sx={{
        ...panelSx,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: "19px",
        minWidth: 0,
        [MOBILE]: {
          gap: 2,
          p: "15px",
          ...(hideOnMobile && { display: "none" }),
        },
      }}
    >
      <Typography
        sx={{
          color: "text.secondary",
          fontSize: 12,
          fontWeight: 600,
          lineHeight: "16px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography
          component="span"
          sx={{
            fontFamily: font.display,
            fontSize: 28,
            fontWeight: 800,
            lineHeight: "35px",
            [MOBILE]: { fontSize: 22, lineHeight: "28px" },
          }}
        >
          {value}
        </Typography>
        <Box
          component="span"
          sx={{
            px: 1.5,
            py: 0.5,
            mb: "1px",
            bgcolor: (th) => th.palette.statusBackground[t.bg],
            borderRadius: 0.5,
            color: t.color,
            fontFamily: font.mono,
            fontSize: 11,
            fontWeight: 600,
            lineHeight: "14px",
            whiteSpace: "nowrap",
            [MOBILE]: { py: "2px", fontSize: 10, lineHeight: "13px" },
          }}
        >
          {change}
        </Box>
      </Box>
    </Box>
  );
}
