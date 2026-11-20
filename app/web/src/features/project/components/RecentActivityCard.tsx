import { Box, Typography } from "@mui/material";
import {
  IconDatabase,
  IconSourceCode,
  IconUser,
  type Icon,
} from "@tabler/icons-react";
import { cardTitleSx, font, MOBILE, panelSx } from "../styles";
import type { ActivityEvent, ActivityIconKey } from "../types";

const ICONS: Record<ActivityIconKey, Icon> = {
  user: IconUser,
  database: IconDatabase,
  function: IconSourceCode,
};

/** The mobile design shows only the two newest events and drops the word "ago". */
const MOBILE_LIMIT = 2;

function ActivityRow({
  event,
  index,
}: {
  event: ActivityEvent;
  index: number;
}) {
  const IconCmp = ICONS[event.icon];
  return (
    <Box
      component="li"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        p: 3,
        bgcolor: "background.elevated",
        borderRadius: 1,
        [MOBILE]: {
          gap: 2,
          p: "9px",
          bgcolor: "background.default",
          border: 1,
          borderColor: "border.default",
          ...(index >= MOBILE_LIMIT && { display: "none" }),
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          display: "grid",
          placeItems: "center",
          flex: "none",
          width: 30,
          height: 30,
          bgcolor: "background.input",
          borderRadius: 0.75,
          color: "secondary.main",
          [MOBILE]: { width: 24, height: 24, borderRadius: 0.5 },
        }}
      >
        <IconCmp size={14} />
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        <Typography
          noWrap
          sx={{
            fontSize: 13,
            fontWeight: 600,
            lineHeight: "17px",
            [MOBILE]: { fontSize: 12, lineHeight: "16px" },
          }}
        >
          {event.title}
        </Typography>
        <Typography
          noWrap
          sx={{
            color: "text.secondary",
            fontFamily: font.mono,
            fontSize: 11,
            lineHeight: "14px",
            [MOBILE]: { fontSize: 10, lineHeight: "13px" },
          }}
        >
          {event.detail}
        </Typography>
      </Box>
      <Typography
        component="time"
        sx={{
          flex: "none",
          color: "text.disabled",
          fontSize: 12,
          lineHeight: "16px",
          [MOBILE]: { fontSize: 10, lineHeight: "13px" },
        }}
      >
        <Box component="span" sx={{ [MOBILE]: { display: "none" } }}>
          {event.time}
        </Box>
        <Box
          component="span"
          sx={{ display: "none", [MOBILE]: { display: "inline" } }}
        >
          {event.time.replace(/ ago$/, "")}
        </Box>
      </Typography>
    </Box>
  );
}

export function RecentActivityCard({ events }: { events: ActivityEvent[] }) {
  return (
    <Box
      component="section"
      aria-labelledby="recent-activity-title"
      sx={{
        ...panelSx,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        p: "23px",
        minWidth: 0,
        // mobile: no card, the rows are the cards
        [MOBILE]: { gap: "10px", p: 0, bgcolor: "transparent", border: 0 },
      }}
    >
      <Typography
        id="recent-activity-title"
        component="h2"
        sx={{ ...cardTitleSx, [MOBILE]: { fontSize: 14, lineHeight: "18px" } }}
      >
        Recent Activity
      </Typography>
      {events.length ? (
        <Box
          component="ul"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            m: 0,
            p: 0,
            listStyle: "none",
            [MOBILE]: { gap: "10px" },
          }}
        >
          {events.map((e, i) => (
            <ActivityRow key={e.id} event={e} index={i} />
          ))}
        </Box>
      ) : (
        <Typography
          role="status"
          sx={{
            py: 6,
            color: "text.secondary",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          No activity yet.
        </Typography>
      )}
    </Box>
  );
}
