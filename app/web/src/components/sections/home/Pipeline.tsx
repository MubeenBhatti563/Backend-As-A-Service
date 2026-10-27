import { Box, Typography } from "@mui/material";
import { IconArrowRight, IconShieldCheck } from "@tabler/icons-react";
import { Fragment } from "react";
import { PIPELINE_HEADER, PIPELINE_STEPS } from "@/constants/homePage";
import { SECTION_IDS } from "@/config/routes";
import { fontFamily, mq } from "@/theme/tokens";
import type { PipelineStep } from "@/types/homePage";
import { CodeBlock, Panel, SectionShell } from "../../common";

const insetSx = {
  minHeight: 74,
  p: 2.5,
  borderRadius: 0.75,
  bgcolor: "background.elevated",
  color: "text.secondary",
  fontSize: 9,
  lineHeight: 1.65,
  [mq.mobile]: { minHeight: "unset" },
} as const;

const mono = { fontFamily: fontFamily.mono } as const;

function StepBody({ step }: { step: PipelineStep }) {
  switch (step.kind) {
    case "prompt":
      return (
        <Box component="blockquote" sx={{ m: 0, ...mono, ...insetSx }}>
          {step.text}
        </Box>
      );
    case "code":
      return <CodeBlock lines={step.lines} sx={{ ...insetSx }} />;
    case "endpoints":
      return (
        <>
          {step.endpoints.map(({ method, path }, i) => (
            <Box
              key={path}
              sx={{
                overflow: "hidden",
                px: 2,
                py: 1.75,
                borderRadius: 0.5,
                bgcolor: "background.elevated",
                color: "common.white",
                fontSize: 9,
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                ...mono,
              }}
            >
              <Box
                component="b"
                sx={{
                  mr: 1.5,
                  fontWeight: 700,
                  color: i === 0 ? "success.main" : "secondary.main",
                }}
              >
                {method}
              </Box>
              {path}
            </Box>
          ))}
        </>
      );
    case "deploy":
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2.75,
            color: "success.main",
          }}
        >
          <IconShieldCheck size={36} aria-hidden />
          <Box component="span" sx={{ fontSize: 9, ...mono }}>
            {step.label}
          </Box>
        </Box>
      );
  }
}

export function Pipeline() {
  return (
    <SectionShell
      id={SECTION_IDS.architecture}
      surface="panel"
      bordered
      header={PIPELINE_HEADER}
    >
      <Box
        component="ol"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          width: "100%",
          m: 0,
          p: 0,
          listStyle: "none",
          [mq.tablet]: { flexWrap: "wrap" },
          [mq.mobile]: {
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 2.5,
          },
        }}
      >
        {PIPELINE_STEPS.map((step, i) => {
          const deploy = step.kind === "deploy";
          return (
            <Fragment key={step.step}>
              <Panel
                component="li"
                surface="base"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minWidth: 0,
                  minHeight: 170,
                  gap: 2.75,
                  p: 3.5,
                  ...(deploy && {
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }),
                  [mq.tablet]: { flex: "1 1 28%" },
                  [mq.mobile]: { minHeight: 0, p: 3.75 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    color: "secondary.main",
                    fontSize: 10,
                    ...mono,
                  }}
                >
                  <span>{step.step}</span>
                  <Box
                    aria-hidden
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: "success.main",
                    }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    color: "common.white",
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    width: "100%",
                    ...(deploy && { textAlign: "center" }),
                  }}
                >
                  {step.title}
                </Typography>
                <StepBody step={step} />
              </Panel>
              {i < PIPELINE_STEPS.length - 1 && (
                <Box
                  aria-hidden
                  sx={{
                    display: "flex",
                    flex: "none",
                    width: 18,
                    color: "primary.main",
                    [mq.mobile]: {
                      justifySelf: "center",
                      transform: "rotate(90deg)",
                    },
                  }}
                >
                  <IconArrowRight size={18} />
                </Box>
              )}
            </Fragment>
          );
        })}
      </Box>
    </SectionShell>
  );
}
