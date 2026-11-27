import type { ReactNode } from "react";
import { Stack } from "@mui/material";
import { SettingsNav } from "@/features/settings";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function SettingsLayout({
  children,
  params,
}: LayoutProps) {
  const { id } = await params;

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={{ xs: 4, md: 8 }}
      useFlexGap
      sx={{ minWidth: 0 }}
    >
      <SettingsNav projectId={id} />
      <Stack sx={{ flex: 1, minWidth: 0 }}>{children}</Stack>
    </Stack>
  );
}
