"use client";
import { Box, Typography } from "@mui/material";
import {
  IconBrain,
  IconDatabase,
  IconSourceCode,
  IconTerminal2,
  IconUser,
  type Icon,
} from "@tabler/icons-react";
import NextLink from "next/link";
import { PROJECT_ROUTES } from "../constants";
import { cardTitleSx, MOBILE, panelSx } from "../styles";

const ACTIONS: {
  key: string;
  label: string;
  icon: Icon;
  href: (r: ReturnType<typeof PROJECT_ROUTES.forProject>) => string;
}[] = [
  {
    key: "table",
    label: "Create Table",
    icon: IconDatabase,
    href: (r) => r.createTable,
  },
  { key: "user", label: "Add User", icon: IconUser, href: (r) => r.addUser },
  {
    key: "file",
    label: "Upload File",
    icon: IconDatabase,
    href: (r) => r.uploadFile,
  },
  {
    key: "fn",
    label: "Create Function",
    icon: IconSourceCode,
    href: (r) => r.createFunction,
  },
  {
    key: "sql",
    label: "SQL Editor",
    icon: IconTerminal2,
    href: (r) => r.sqlEditor,
  },
  {
    key: "ai",
    label: "Generate with AI",
    icon: IconBrain,
    href: (r) => r.generateWithAi,
  },
];

export function QuickStartCard({ projectId }: { projectId: string }) {
  const routes = PROJECT_ROUTES.forProject(projectId);
  return (
    <Box
      component="section"
      aria-labelledby="quick-start-title"
      sx={{
        ...panelSx,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        p: "23px",
        [MOBILE]: { display: "none" },
      }}
    >
      <Typography id="quick-start-title" component="h2" sx={cardTitleSx}>
        Quick Start Shortcuts
      </Typography>
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        }}
      >
        {ACTIONS.map(({ key, label, icon: IconCmp, href }) => (
          <Box
            key={key}
            component={NextLink}
            href={href(routes)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: 4,
              py: "11px", // 12px in Figma minus the 1px border
              bgcolor: "background.elevated",
              border: 1,
              borderColor: "border.default",
              borderRadius: 1,
              color: "text.primary",
              textDecoration: "none",
              "&:hover": {
                borderColor: "border.strong",
                bgcolor: "background.canvas",
              },
            }}
          >
            <Box
              component="span"
              sx={{ display: "inline-flex", color: "secondary.main" }}
            >
              <IconCmp size={14} aria-hidden />
            </Box>
            <Typography
              component="span"
              noWrap
              sx={{ fontSize: 13, fontWeight: 600, lineHeight: "17px" }}
            >
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
