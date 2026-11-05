"use client";
import { font } from "@/features/projects/components/projectStyle";
import { ACCOUNT_ROUTES } from "@/config/routes";
import { Box, Button, Typography } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import NextLink from "next/link";
const COPY = {
  eyebrow: "PERSONAL ACCOUNT",
  description: "Your projects, resources, and next big idea. All in one place.",
  action: "New Project",
} as const;

interface PageHeaderProps {
  name: string;
  newProjectHref?: string;
}

export function PageHeader({
  name,
  newProjectHref = ACCOUNT_ROUTES.newProject,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 4,
      }}
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}
      >
        <Typography
          sx={{
            color: "secondary.main",
            fontFamily: font.mono,
            fontSize: 11,
            lineHeight: "14px",
            letterSpacing: "1px",
          }}
        >
          {COPY.eyebrow}
        </Typography>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontSize: 28, fontWeight: 800, lineHeight: "35px" }}
        >
          Welcome back, {name}
        </Typography>
        <Typography
          sx={{ color: "text.secondary", fontSize: 14, lineHeight: "18px" }}
        >
          {COPY.description}
        </Typography>
      </Box>
      <Button
        component={NextLink}
        href={newProjectHref}
        variant="contained"
        startIcon={<IconPlus size={15} aria-hidden />}
        sx={{
          flex: "none",
          height: 38,
          minHeight: 38,
          px: 4,
          gap: 0.5,
          borderRadius: 0.75,
          fontSize: 13,
          "& .MuiButton-startIcon": { m: 0 },
        }}
      >
        {COPY.action}
      </Button>
    </Box>
  );
}
