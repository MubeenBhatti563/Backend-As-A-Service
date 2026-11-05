"use client";
import { ONBOARDING_STEPS } from "@/config/routes";
// StepHeader.tsx – the badge + big title + description at the top of every onboarding step.
import { Box, Typography } from "@mui/material";

const FONT_DISPLAY = "var(--font-outfit), Outfit, sans-serif";
const FONT_MONO = 'var(--font-geist-mono), "Geist Mono", monospace';

interface StepHeaderProps {
  /** 1-based step number. */
  step: number;
  /** Text after the dot, e.g. "Onboarding" or "Infrastructure Setup". */
  label: string;
  title: string;
  description: string;
  /** "compact" = 32px title + 14px text (initializing screen). */
  size?: "default" | "compact";
}

export function StepHeader({
  step,
  label,
  title,
  description,
  size = "default",
}: StepHeaderProps) {
  const compact = size === "compact";
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 4,
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          px: "10px",
          py: 1,
          border: 1,
          borderColor: "primary.main",
          bgcolor: "rgba(37, 99, 235, 0.08)",
          borderRadius: "99px",
        }}
      >
        <Typography
          component="span"
          sx={{
            color: "info.main",
            fontFamily: FONT_MONO,
            fontSize: 11,
            fontWeight: 600,
            lineHeight: "14px",
            textTransform: "uppercase",
          }}
        >
          Step {step} of {ONBOARDING_STEPS.length} · {label}
        </Typography>
      </Box>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          color: "common.white",
          fontFamily: FONT_DISPLAY,
          fontSize: compact ? { xs: 28, sm: 32 } : { xs: 32, sm: 40 },
          fontWeight: 800,
          lineHeight: compact
            ? { xs: "36px", sm: "40px" }
            : { xs: "40px", sm: "50px" },
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          color: "text.secondary",
          fontSize: compact ? 14 : 16,
          lineHeight: 1.6,
        }}
      >
        {description}
      </Typography>
    </Box>
  );
}
