import { Box } from "@mui/material";
import { EXAMPLE_TITLES, EXAMPLES_HEADER } from "@/constants/homePage";
import { SECTION_IDS } from "@/config/routes";
import { AUTH_EXAMPLE_CODE, REALTIME_EXAMPLE_CODE } from "@/config/snippets";
import { fontFamily, mq } from "@/theme/tokens";
import type { CodeLine } from "@/types/homePage";
import { CodeBlock, Panel, SectionShell } from "../../common";

const EXAMPLES: readonly { title: string; lines: readonly CodeLine[] }[] = [
  { title: EXAMPLE_TITLES.auth, lines: AUTH_EXAMPLE_CODE },
  { title: EXAMPLE_TITLES.realtime, lines: REALTIME_EXAMPLE_CODE },
];

export function SdkExamples() {
  return (
    <SectionShell
      id={SECTION_IDS.examples}
      surface="panel"
      bordered
      gap={13.5}
      header={EXAMPLES_HEADER}
    >
      <Box
        sx={{
          display: "grid",
          width: "100%",
          gap: 5.5,
          gridTemplateColumns: "1fr 1fr",
          [mq.mobile]: { gridTemplateColumns: "1fr" },
        }}
      >
        {EXAMPLES.map(({ title, lines }) => (
          <Panel
            key={title}
            component="article"
            radius={1.5}
            sx={{ overflow: "hidden" }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 38,
                px: 4,
                borderBottom: 1,
                borderColor: "border.default",
                bgcolor: "background.elevated",
                color: "common.white",
                fontFamily: fontFamily.mono,
                fontSize: 11,
              }}
            >
              <span>{title}</span>
              <Box
                aria-hidden
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: "secondary.main",
                }}
              />
            </Box>
            <CodeBlock
              lines={lines}
              sx={{ minHeight: 220, p: 4.5, lineHeight: 1.85 }}
            />
          </Panel>
        ))}
      </Box>
    </SectionShell>
  );
}
