"use client";

import { Box, Typography } from "@mui/material";
import { IconArrowRight, IconBook, IconBrandGithub } from "@tabler/icons-react";
import { HERO } from "@/constants/homePage";
import { EXTERNAL_LINKS, ROUTES } from "@/config/routes";
import { mq, pageGutter } from "@/theme/tokens";
import { Badge, CtaButton } from "../../common";
import { DashboardPreview } from "./DashboardPreview";
import { useAuthStore } from "@/stores";

export function Hero() {
  const { user } = useAuthStore();

  return (
    <Box
      component="section"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        pt: 16,
        pb: 20,
        ...pageGutter,
        [mq.mobile]: { gap: 8.5, pt: 17, pb: 14 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          maxWidth: 1000,
          textAlign: "center",
          [mq.mobile]: { gap: 4.75 },
        }}
      >
        <Badge label={HERO.badge} />

        <Typography
          variant="h1"
          sx={{
            maxWidth: 1050,
            color: "common.white",
            fontSize: "clamp(42px, 5vw, 64px)",
            fontWeight: "bold",
            letterSpacing: "-1.8px",
            lineHeight: 1.08,
            [mq.mobile]: {
              fontSize: "clamp(38px, 9vw, 54px)",
              letterSpacing: "-1.2px",
            },
          }}
        >
          {HERO.titleLine1}
          <Box component="br" sx={{ [mq.mobile]: { display: "none" } }} />{" "}
          {HERO.titleLine2}
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            maxWidth: 800,
            fontSize: 19,
            lineHeight: 1.55,
            [mq.mobile]: { fontSize: 15 },
          }}
        >
          {HERO.text}
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            [mq.mobile]: { gap: 1.5 },
          }}
        >
          <CtaButton
            href={!user ? ROUTES.deployFree : ROUTES.dashboard}
            endIcon={<IconArrowRight size={17} aria-hidden />}
          >
            {!user ? "Get Started Free" : "Go to dashboard"}
          </CtaButton>
          <CtaButton
            href={ROUTES.docs}
            kind="secondary"
            endIcon={<IconBook size={16} aria-hidden />}
          >
            Documentation
          </CtaButton>
          <CtaButton
            href={EXTERNAL_LINKS.github}
            kind="ghost"
            startIcon={<IconBrandGithub size={17} aria-hidden />}
          >
            Star on GitHub
          </CtaButton>
        </Box>
      </Box>

      <DashboardPreview />
    </Box>
  );
}
