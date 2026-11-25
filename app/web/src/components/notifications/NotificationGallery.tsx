"use client";

import { Stack } from "@mui/material";
import { Notification } from "./Notification";

/** Static preview of all four variants, laid out like the Figma frame. Handy for visual checks. */
export function NotificationGallery() {
  const noop = () => {};

  return (
    <Stack spacing={4} useFlexGap sx={{ width: 560, maxWidth: "100%", mx: "auto", py: 8 }}>
      <Notification variant="success" message="Table created successfully." onClose={noop} />
      <Notification variant="error" message="Database connection failed. Retrying in 5s…" onClose={noop} />
      <Notification
        variant="warning"
        message="Your storage is 90% full. Upgrade your plan to avoid service interruption."
        action={{ label: "Upgrade", onClick: noop }}
      />
      <Notification
        variant="info"
        message="A new version of the TypeScript SDK is available (v1.3.0)."
        action={{ label: "Update", onClick: noop }}
      />
    </Stack>
  );
}
