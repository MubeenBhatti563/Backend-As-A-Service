"use client";
import { badgeSx, font } from "@/features/projects/components/projectStyle";
import { ACCOUNT_ROUTES } from "@/config/routes";
import { Box, Button, Typography } from "@mui/material";
import { IconArrowRight, IconBolt, IconCheck } from "@tabler/icons-react";
import NextLink from "next/link";

const BENEFITS = [
  "Higher storage and API quotas",
  "More concurrent realtime connections",
] as const;

interface PlanCardProps {
  plan: string;
  tier: string;
  upgradeHref?: string;
}

export function PlanCard({
  plan,
  tier,
  upgradeHref = ACCOUNT_ROUTES.billing,
}: PlanCardProps) {
  return (
    <Box
      component="section"
      aria-labelledby="plan-heading"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        p: "19px",
        bgcolor: "background.default",
        border: 1,
        borderColor: "border.strong",
        borderRadius: 1.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography
            sx={{
              color: "text.disabled",
              fontFamily: font.mono,
              fontSize: 10,
              lineHeight: "13px",
              letterSpacing: "0.7px",
            }}
          >
            CURRENT PLAN
          </Typography>
          <Typography
            id="plan-heading"
            variant="h6"
            component="h2"
            sx={{ fontSize: 19, fontWeight: 600, lineHeight: "24px" }}
          >
            {plan}
          </Typography>
        </Box>
        <Box component="span" sx={badgeSx}>
          {tier}
        </Box>
      </Box>

      <Typography
        sx={{ color: "text.secondary", fontSize: 12, lineHeight: 1.6 }}
      >
        {tier === "Free"
          ? "Make room for what's next with Pro."
          : `You're on the ${plan} plan.`}
      </Typography>

      <Box
        component="ul"
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {BENEFITS.map((b) => (
          <Box
            component="li"
            key={b}
            sx={{ display: "flex", alignItems: "center", gap: "7px" }}
          >
            <IconCheck size={13} color="#06B6D4" aria-hidden />
            <Typography
              component="span"
              sx={{ color: "text.secondary", fontSize: 11, lineHeight: "14px" }}
            >
              {b}
            </Typography>
          </Box>
        ))}
      </Box>

      {tier === "Free" && (
        <Button
          component={NextLink}
          href={upgradeHref}
          variant="contained"
          fullWidth
          startIcon={<IconBolt size={14} aria-hidden />}
          endIcon={<IconArrowRight size={14} aria-hidden />}
          sx={{
            height: 36,
            minHeight: 36,
            gap: 0.5,
            borderRadius: 0.75,
            fontSize: 12,
            "& .MuiButton-startIcon, & .MuiButton-endIcon": { m: 0 },
          }}
        >
          Upgrade to Pro
        </Button>
      )}
    </Box>
  );
}
