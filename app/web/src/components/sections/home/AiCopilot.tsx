import { Badge, Panel, SectionShell } from "@/components/common";
import { AI_COPILOT, AI_HEADER, AI_SPEC_LISTS } from "@/constants/homePage";
import { fontFamily, mq } from "@/theme/tokens";
import { Box, Typography } from "@mui/material";
import {
  IconArrowRight,
  IconSparkles,
  IconTerminal2,
} from "@tabler/icons-react";

const mono = { fontFamily: fontFamily.mono } as const;
const fieldLabel = {
  color: "text.disabled",
  fontSize: 10,
  ...mono,
} as const;

export function AiCopilot() {
  return (
    <SectionShell surface="panel" bordered gap={11} header={AI_HEADER}>
      <Panel
        surface="base"
        radius={1.5}
        sx={{ width: "min(960px, 100%)", overflow: "hidden" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 46,
            px: 4.5,
            borderBottom: 1,
            borderColor: "border.default",
            bgcolor: "background.elevated",
          }}
        >
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              color: "text.primary",
              fontSize: 12,
              ...mono,
            }}
          >
            <Box sx={{ display: "flex", color: "secondary.main" }}>
              <IconSparkles size={17} aria-hidden />
            </Box>
            {AI_COPILOT.windowTitle}
          </Box>
          <Badge label={AI_COPILOT.badge} />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.75, p: 5 }}>
          <Typography component="p" sx={fieldLabel}>
            {AI_COPILOT.promptLabel}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2.5,
              minHeight: 42,
              px: 3,
              border: 1,
              borderColor: "primary.main",
              borderRadius: 1,
              color: "common.white",
              fontSize: 12,
              [mq.mobile]: { alignItems: "flex-start", py: 3, lineHeight: 1.5 },
            }}
          >
            <Box
              sx={{ display: "flex", flex: "0 0 auto", color: "primary.main" }}
            >
              <IconTerminal2 size={17} aria-hidden />
            </Box>
            <span>{AI_COPILOT.prompt}</span>
            <Box
              sx={{
                display: "flex",
                ml: "auto",
                color: "text.disabled",
                [mq.mobile]: { display: "none" },
              }}
            >
              <IconArrowRight size={16} aria-hidden />
            </Box>
          </Box>

          <Typography component="p" sx={fieldLabel}>
            {AI_COPILOT.resultLabel}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gap: 3.5,
              gridTemplateColumns: "1fr 1fr",
              [mq.mobile]: { gridTemplateColumns: "1fr" },
            }}
          >
            {AI_SPEC_LISTS.map(({ title, accent, icon: Icon, items }) => (
              <Panel
                key={title}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.75,
                  p: 3.25,
                  [mq.mobile]: { gap: 2 },
                }}
              >
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ mb: 0.5, fontSize: 12, fontWeight: 600 }}
                >
                  {title}
                </Typography>
                {items.map((line) => (
                  <Box
                    key={line}
                    component="span"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.75,
                      color: "text.secondary",
                      fontSize: 9,
                      ...mono,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flex: "0 0 auto",
                        color: `${accent}.main`,
                      }}
                    >
                      <Icon size={12} aria-hidden />
                    </Box>
                    {line}
                  </Box>
                ))}
              </Panel>
            ))}
          </Box>
        </Box>
      </Panel>
    </SectionShell>
  );
}
