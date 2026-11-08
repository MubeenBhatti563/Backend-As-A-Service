"use client";
import { Box, IconButton, Typography } from "@mui/material";
import { IconArrowUpRight, IconCalendar } from "@tabler/icons-react";
import NextLink from "next/link";
import { UsageMeter } from "./UsageMeter";
import { UsageMetric } from "@/types/projectPage";
import { ACCOUNT_ROUTES } from "@/config/routes";
import { panelSx } from "@/features/projects/components/projectStyle";

interface UsagePanelProps {
  metrics: UsageMetric[];
  projectCount: number;
  resetNote?: string;
  href?: string;
  showLink?: boolean;
}

export function UsagePanel({
  metrics,
  projectCount,
  resetNote,
  href = ACCOUNT_ROUTES.usage,
  showLink = true,
}: UsagePanelProps) {
  return (
    <Box
      component="section"
      aria-labelledby="usage-heading"
      sx={{
        ...panelSx,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        p: "19px",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            id="usage-heading"
            variant="h6"
            component="h2"
            sx={{ fontSize: 18, fontWeight: 600, lineHeight: "23px" }}
          >
            Account usage
          </Typography>
          {showLink && (
            <IconButton
              component={NextLink}
              href={href}
              aria-label="Open usage & billing"
              size="small"
              sx={{
                p: 0.5,
                color: "text.secondary",
                "&:hover": { color: "text.primary" },
              }}
            >
              <IconArrowUpRight size={15} aria-hidden />
            </IconButton>
          )}
        </Box>
        <Typography
          sx={{ color: "text.secondary", fontSize: 12, lineHeight: "16px" }}
        >
          Shared limits across your {projectCount} projects
        </Typography>
      </Box>

      {metrics.map((m, i) => (
        <Box
          key={m.key}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          {i > 0 && (
            <Box
              aria-hidden
              sx={{ height: "1px", bgcolor: "border.default" }}
            />
          )}
          <UsageMeter metric={m} />
        </Box>
      ))}

      {resetNote && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            pt: "11px",
            borderTop: 1,
            borderColor: "border.default",
          }}
        >
          <IconCalendar size={13} color="#94A3B8" aria-hidden />
          <Typography
            sx={{ color: "text.secondary", fontSize: 11, lineHeight: "14px" }}
          >
            {resetNote}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
