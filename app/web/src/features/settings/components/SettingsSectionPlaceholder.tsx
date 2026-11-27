import { Stack, Typography } from "@mui/material";
import { SettingsPageHeader } from "./SettingsPageHeader";

export function SettingsSectionPlaceholder({ title }: { title: string }) {
  return (
    <Stack spacing={8} useFlexGap>
      <SettingsPageHeader
        title={title}
        description={`Manage ${title.toLowerCase()} for this project.`}
      />
      <Typography color="text.secondary">
        This settings section is not available yet.
      </Typography>
    </Stack>
  );
}
