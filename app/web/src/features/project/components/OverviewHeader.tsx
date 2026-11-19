"use client";
import { Box, Typography } from "@mui/material";
import { font, MOBILE } from "../styles";

interface OverviewHeaderProps {
  title?: string;
  description?: string;
  badge?: string;
}

/** Page title row. Not shown on mobile (the mobile frame starts at the project card). */
export function OverviewHeader({
  title = "Overview",
  description = "Deployments, services, and core health tracking metrics.",
  badge = "DevStack BaaS v2",
}: OverviewHeaderProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, [MOBILE]: { display: "none" } }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h4" component="h1" sx={{ fontFamily: font.display, fontSize: 28, fontWeight: 800, lineHeight: "35px" }}>{title}</Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 14, lineHeight: "18px" }}>{description}</Typography>
      </Box>
      <Box
        component="span"
        sx={{
          flex: "none",
          px: "9px",
          py: "3px",
          bgcolor: (t) => t.palette.statusBackground.primary,
          border: 1,
          borderColor: "primary.main",
          borderRadius: "99px",
          color: "secondary.main",
          fontFamily: font.mono,
          fontSize: 11,
          fontWeight: 600,
          lineHeight: "14px",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {badge}
      </Box>
    </Box>
  );
}
