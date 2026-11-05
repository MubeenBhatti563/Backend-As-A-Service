"use client";
import { Brand } from "@/components/common";
import {
  ONBOARDING_ROUTES,
  ONBOARDING_STEPS,
  OnboardingStepId,
} from "@/config/routes";
// OnboardingSidebar.tsx – left side of the onboarding screens.
// Needs: @mui/material, @tabler/icons-react, next.
import { Box, Link as MuiLink, Typography } from "@mui/material";
import { IconCheck } from "@tabler/icons-react";

const HIDE_BELOW_900 = "@media (max-width: 900px)";
const FONT_MONO = 'var(--font-geist-mono), "Geist Mono", monospace';

function StepIndicator({
  index,
  state,
}: {
  index: number;
  state: "current" | "done" | "upcoming";
}) {
  const palette = {
    current: {
      borderColor: "primary.main",
      bgcolor: "rgba(37, 99, 235, 0.08)",
      color: "info.main",
    },
    done: {
      borderColor: "success.main",
      bgcolor: "rgba(16, 185, 129, 0.08)",
      color: "success.main",
    },
    upcoming: {
      borderColor: "border.default",
      bgcolor: "transparent",
      color: "text.disabled",
    },
  }[state];
  return (
    <Box
      aria-hidden
      sx={{
        display: "grid",
        placeItems: "center",
        flex: "none",
        width: 32,
        height: 32,
        border: 1,
        borderRadius: "99px",
        fontFamily: FONT_MONO,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: "16px",
        ...palette,
      }}
    >
      {state === "done" ? <IconCheck size={16} stroke={2} /> : index + 1}
    </Box>
  );
}

interface OnboardingSidebarProps {
  /** Which step the user is on. */
  currentStep?: OnboardingStepId;
  supportEmail?: string;
  /** Replace a step's title for one screen, e.g. { project: "Configure Instance" }. */
  stepTitles?: Partial<Record<OnboardingStepId, string>>;
  /** Push the "Need help?" line to the bottom of the sidebar instead of right under the steps. */
  pinFooter?: boolean;
}

export function OnboardingSidebar({
  currentStep = "welcome",
  supportEmail = ONBOARDING_ROUTES.supportEmail,
  stepTitles,
  pinFooter,
}: OnboardingSidebarProps) {
  const currentIndex = ONBOARDING_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <Box
      component="aside"
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: "none",
        width: 400,
        gap: 12,
        p: 10,
        overflowY: "auto",
        bgcolor: "background.canvas",
        borderRight: 1,
        borderColor: "border.default",
        [HIDE_BELOW_900]: { display: "none" },
      }}
    >
      <Brand />

      <Box
        component="ol"
        aria-label="Onboarding steps"
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {ONBOARDING_STEPS.map((step, i) => {
          const state =
            i === currentIndex
              ? "current"
              : i < currentIndex
                ? "done"
                : "upcoming";
          return (
            <Box
              component="li"
              key={step.id}
              aria-current={state === "current" ? "step" : undefined}
              sx={{ display: "flex", alignItems: "flex-start", gap: 4 }}
            >
              <StepIndicator index={i} state={state} />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  minWidth: 0,
                }}
              >
                <Typography
                  sx={{
                    color:
                      state === "current" ? "common.white" : "text.secondary",
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: "18px",
                  }}
                >
                  {stepTitles?.[step.id] ?? step.title}
                </Typography>
                <Typography
                  sx={{
                    color: "text.disabled",
                    fontSize: 12,
                    lineHeight: "16px",
                  }}
                >
                  {step.description}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Typography
        sx={{
          color: "text.disabled",
          fontSize: 12,
          lineHeight: "16px",
          mt: pinFooter ? "auto" : 0,
        }}
      >
        Need help? Reach out to{" "}
        <MuiLink
          href={`mailto:${supportEmail}`}
          underline="none"
          sx={{
            color: "inherit",
            "&:hover": { textDecoration: "underline", color: "text.secondary" },
          }}
        >
          {supportEmail}
        </MuiLink>
      </Typography>
    </Box>
  );
}
