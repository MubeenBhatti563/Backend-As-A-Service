import { Box, Typography } from "@mui/material";
import { FEATURES, FEATURES_HEADER } from "@/constants/homePage";
import { SECTION_IDS } from "@/config/routes";
import { hoverLift, mq } from "@/theme/tokens";
import { Panel, SectionShell } from "../../common";

export function Features() {
  return (
    <SectionShell
      id={SECTION_IDS.features}
      surface="base"
      header={FEATURES_HEADER}
    >
      <Box
        sx={{
          display: "grid",
          width: "100%",
          gap: 5,
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          [mq.tablet]: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
          [mq.mobile]: { gridTemplateColumns: "1fr", gap: 3 },
        }}
      >
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Panel
            component="article"
            key={title}
            radius={1.5}
            sx={{
              minHeight: 193,
              p: 5.5,
              ...hoverLift,
              [mq.mobile]: { minHeight: 0, p: 4.5 },
            }}
          >
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: 40,
                height: 40,
                mb: 3.75,
                borderRadius: 1,
                bgcolor: "background.elevated",
                color: "secondary.main",
                [mq.mobile]: { mb: 3 },
              }}
            >
              <Icon size={21} stroke={1.8} aria-hidden />
            </Box>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                mb: 1.75,
                color: "common.white",
                fontSize: 17,
                fontWeight: 600,
              }}
            >
              {title}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ fontSize: 13, lineHeight: 1.55 }}
            >
              {description}
            </Typography>
          </Panel>
        ))}
      </Box>
    </SectionShell>
  );
}
