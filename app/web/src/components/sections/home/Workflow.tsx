import { Box, Typography } from "@mui/material";
import { WORKFLOW_HEADER, WORKFLOW_STEPS } from "@/constants/homePage";
import { SECTION_IDS } from "@/config/routes";
import { fontFamily, mq } from "@/theme/tokens";
import { Panel, SectionShell } from "../../common";

export function Workflow() {
  return (
    <SectionShell
      id={SECTION_IDS.workflow}
      surface="base"
      header={WORKFLOW_HEADER}
    >
      <Box
        component="ol"
        sx={{
          display: "grid",
          width: "100%",
          m: 0,
          p: 0,
          gap: 4,
          listStyle: "none",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          [mq.tablet]: { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
          [mq.mobile]: { gridTemplateColumns: "1fr", gap: 2.75 },
        }}
      >
        {WORKFLOW_STEPS.map(({ icon: Icon, title, description }, i) => (
          <Panel
            component="li"
            key={title}
            surface="base"
            radius={1.5}
            sx={{
              minHeight: 160,
              p: 5.25,
              [mq.mobile]: { minHeight: 0, p: 4.25 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 4.75,
                color: "text.disabled",
                [mq.mobile]: { mb: 3 },
              }}
            >
              <Box
                component="span"
                sx={{
                  color: "secondary.main",
                  fontFamily: fontFamily.mono,
                  fontSize: 11,
                }}
              >
                STEP {i + 1}
              </Box>
              <Icon size={20} aria-hidden />
            </Box>
            <Typography
              variant="h6"
              component="h3"
              sx={{ mb: 1.75, fontSize: 16, fontWeight: 600 }}
            >
              {title}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ fontSize: 12, lineHeight: 1.55 }}
            >
              {description}
            </Typography>
          </Panel>
        ))}
      </Box>
    </SectionShell>
  );
}
