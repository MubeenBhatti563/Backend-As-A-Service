"use client";
// WelcomeStep.tsx – right side of the first onboarding screen ("Welcome to DevStack").
// Needs: @mui/material, @tabler/icons-react, next.
import { Box, Button, Typography } from "@mui/material";
import { IconArrowRight } from "@tabler/icons-react";
import type { ComponentType } from "react";
import { StepHeader } from "./StepHeader";

const FONT_DISPLAY = "var(--font-outfit), Outfit, sans-serif";

const COPY = {
  title: "Welcome to DevStack",
  description:
    "Let's configure your cloud instance. Instantly spin up global relational databases, secure API layers, real-time sync systems, and secure key infrastructures.",
  action: "Create Your Project",
} as const;

/* Solid icons from the design (Tabler only has outline versions of these). */
function DatabaseSolidIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="3 3 18 18"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 4C7 4 3.5 5.2 3.5 6.8v10.4C3.5 18.8 7 20 12 20s8.5-1.2 8.5-2.8V6.8C20.5 5.2 17 4 12 4Z" />
    </svg>
  );
}

function SparkleSolidIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="1.5 1.5 21 21"
      fill="currentColor"
      aria-hidden
    >
      <path d="M13 2.5c1 5.2 2.8 8.5 9 9.5-6.2 1-8 4.3-9 9.5-1-5.2-2.8-8.5-9-9.5 6.2-1 8-4.3 9-9.5Z" />
      <circle cx="3.6" cy="20" r="1.6" />
    </svg>
  );
}

const FEATURES: {
  icon: ComponentType<{ size?: number }>;
  title: string;
  description: string;
}[] = [
  {
    icon: DatabaseSolidIcon,
    title: "Instant Database Orchestration",
    description: "Production-grade Postgres with point-in-time state recovery.",
  },
  {
    icon: SparkleSolidIcon,
    title: "Realtime Subscriptions",
    description: "Sync data directly with active clients via secure sockets.",
  },
];

interface WelcomeStepProps {
  onNext: () => void;
  step?: number;
}

export function WelcomeStep({ onNext, step = 1 }: WelcomeStepProps) {
  return (
    // Wrap in a centered container, see OnboardingLayout.tsx
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: "100%",
        maxWidth: 560,
      }}
    >
      <StepHeader
        step={step}
        label="Onboarding"
        title={COPY.title}
        description={COPY.description}
      />

      <Box
        component="ul"
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {FEATURES.map(({ icon: FeatureIcon, title, description }) => (
          <Box
            component="li"
            key={title}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              p: 5,
              bgcolor: "background.default",
              border: 1,
              borderColor: "border.default",
              borderRadius: 1.25,
            }}
          >
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                flex: "none",
                width: 36,
                height: 36,
                bgcolor: "rgba(37, 99, 235, 0.08)",
                borderRadius: 0.75,
                color: "info.main",
              }}
            >
              <FeatureIcon size={18} />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                minWidth: 0,
              }}
            >
              <Typography
                component="h2"
                sx={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 15,
                  fontWeight: 600,
                  lineHeight: "19px",
                  color: "common.white",
                }}
              >
                {title}
              </Typography>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: 13,
                  lineHeight: "17px",
                }}
              >
                {description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Button
        onClick={onNext}
        variant="contained"
        fullWidth
        endIcon={<IconArrowRight size={16} aria-hidden />}
        sx={{ minHeight: 42, py: 0, gap: 0.5 }}
      >
        {COPY.action}
      </Button>
    </Box>
  );
}
