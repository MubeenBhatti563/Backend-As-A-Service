"use client";

import { Fragment } from "react";
import { Divider, Stack } from "@mui/material";
import { DangerCard } from "./DangerCard";
import { SettingsPageHeader } from "./SettingsPageHeader";

const ACTIONS = [
  {
    id: "pause",
    title: "Pause Project",
    description: "Temporarily pause your project. APIs will return 503.",
    actionLabel: "Pause Project",
    emphasis: "outlined",
  },
  {
    id: "reset",
    title: "Reset Database",
    description:
      "Delete all data and reset your database to empty. This cannot be undone.",
    actionLabel: "Reset Database",
    emphasis: "outlined",
  },
  {
    id: "delete",
    title: "Delete Project",
    description:
      "Permanently delete this project and all associated data. This action is irreversible.",
    actionLabel: "Delete Project",
    emphasis: "filled",
  },
] as const;

export function DangerZoneView() {
  return (
    <Stack spacing={{ xs: 5, md: 8 }} useFlexGap>
      <SettingsPageHeader
        title="Danger Zone"
        description="Critical actions that can permanently damage your project, database, or delete everything."
      />

      <Stack spacing={{ xs: 2, sm: 4 }} useFlexGap>
        {ACTIONS.map((action, index) => (
          <Fragment key={action.id}>
            <DangerCard
              title={action.title}
              description={action.description}
              actionLabel={action.actionLabel}
              emphasis={action.emphasis}
            />
            {index < ACTIONS.length - 1 && <Divider />}
          </Fragment>
        ))}
      </Stack>
    </Stack>
  );
}
