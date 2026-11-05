"use client";
// OnboardingLayout.tsx – sidebar on the left, step content centered on the right (only the right side scrolls).
import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { OnboardingSidebar } from "./OnboardingSidebar";
import { OnboardingStepId } from "@/config/routes";

const SHOW_LOGO_BELOW_900 = "@media (max-width: 900px)";

export interface OnboardingLayoutProps {
  currentStep: OnboardingStepId;
  children: ReactNode;
  contentWidth?: number;
  stepTitles?: Partial<Record<OnboardingStepId, string>>;
  pinSidebarFooter?: boolean;
}

export function OnboardingLayout({
  currentStep,
  children,
  contentWidth = 560,
  stepTitles,
  pinSidebarFooter,
}: OnboardingLayoutProps) {
  return (
    <Box
      component="main"
      sx={{
        display: "flex",
        height: "100dvh",
        overflow: "hidden",
        bgcolor: "background.input",
      }}
    >
      <OnboardingSidebar
        currentStep={currentStep}
        stepTitles={stepTitles}
        pinFooter={pinSidebarFooter}
      />
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          overflowY: "auto",
          p: { xs: 5, md: 20 },
        }}
      >
        {/* m:"auto" centers short content and lets tall content scroll from the top */}
        <Box sx={{ m: "auto", width: "100%", maxWidth: contentWidth }}>
          {/* the sidebar is hidden on small screens, so the logo moves here */}
          <Typography
            component="span"
            sx={{
              display: "none",
              mb: 8,
              fontFamily: "var(--font-outfit), Outfit, sans-serif",
              fontSize: 22.5,
              fontWeight: 800,
              lineHeight: "28px",
              [SHOW_LOGO_BELOW_900]: { display: "block" },
            }}
          >
            DevStack
          </Typography>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
