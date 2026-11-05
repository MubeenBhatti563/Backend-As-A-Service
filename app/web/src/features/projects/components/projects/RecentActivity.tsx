"use client";
import { font, panelSx } from "@/features/projects/components/projectStyle";
import { ActivityEvent, ActivityIconKey } from "@/types/projectPage";
import { Box, Typography } from "@mui/material";
import {
  IconAdjustmentsHorizontal,
  IconFolderPlus,
  IconPlayerPause,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

const ICONS: Record<ActivityIconKey, Icon> = {
  updated: IconAdjustmentsHorizontal,
  created: IconFolderPlus,
  paused: IconPlayerPause,
};

export function RecentActivity({ events }: { events: ActivityEvent[] }) {
  return (
    <Box
      component="section"
      aria-labelledby="activity-heading"
      sx={{
        ...panelSx,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        p: "19px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography
          id="activity-heading"
          variant="h6"
          component="h2"
          sx={{ fontSize: 17, fontWeight: 600, lineHeight: "21px" }}
        >
          Recent account activity
        </Typography>
        <Typography
          sx={{ color: "text.disabled", fontSize: 11, lineHeight: "14px" }}
        >
          Across all projects
        </Typography>
      </Box>

      <Box
        component="ul"
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {events.map((e) => {
          const EventIcon = ICONS[e.icon];
          return (
            <Box
              component="li"
              key={e.id}
              sx={{ display: "flex", alignItems: "center", gap: 3 }}
            >
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  flex: "none",
                  width: 30,
                  height: 30,
                  bgcolor: "background.elevated",
                  borderRadius: 0.75,
                  color: "secondary.main",
                }}
              >
                <EventIcon size={14} aria-hidden />
              </Box>
              <Box
                sx={{
                  flexGrow: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                }}
              >
                <Typography sx={{ fontSize: 12, lineHeight: "16px" }}>
                  {e.description}
                </Typography>
                <Typography
                  sx={{
                    color: "text.secondary",
                    fontFamily: font.mono,
                    fontSize: 10,
                    lineHeight: "13px",
                  }}
                >
                  {e.project}
                </Typography>
              </Box>
              <Typography
                sx={{
                  flex: "none",
                  color: "text.disabled",
                  fontSize: 11,
                  lineHeight: "14px",
                }}
              >
                {e.time}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
