"use client";

import NextLink from "next/link";
import { Link, Stack, Typography } from "@mui/material";
import { projectDatabaseBase } from "../../constants";

export function SqlEditorHeader({ projectId }: { projectId: string }) {
  return (
    <Stack spacing={1} useFlexGap>
      <Stack component="nav" aria-label="Breadcrumb" direction="row" spacing={2} useFlexGap sx={{ alignItems: "center" }}>
        <Link component={NextLink} href={projectDatabaseBase(projectId)} underline="hover" variant="body2" sx={{ color: "text.disabled" }}>Database</Link>
        <Typography variant="body2" sx={{ color: "text.disabled" }} aria-hidden>/</Typography>
        <Typography variant="body2" aria-current="page" sx={{ color: "text.primary" }}>SQL Editor</Typography>
      </Stack>
      <Typography variant="h4" component="h1">SQL Console</Typography>
    </Stack>
  );
}
