import { Box } from "@mui/material";
import { IconArrowRight } from "@tabler/icons-react";
import {
  ARCH_CLIENTS,
  ARCH_CTA,
  ARCH_GATEWAY,
  ARCH_SERVICES,
  ARCHITECTURE_HEADER,
} from "@/constants/homePage";
import { ROUTES } from "@/config/routes";
import { fontFamily, mq } from "@/theme/tokens";
import type { ArchNode } from "@/types/homePage";
import { CtaButton, Panel, SectionShell } from "../../common";

function ArchRow({ nodes }: { nodes: readonly ArchNode[] }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 3.5,
        [mq.mobile]: { width: "100%", flexWrap: "wrap", gap: 2.25 },
      }}
    >
      {nodes.map(({ title, description }) => (
        <Panel
          key={title}
          surface="raised"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.75,
            width: 180,
            minHeight: 72,
            p: 3,
            textAlign: "center",
            [mq.mobile]: { width: "calc(50% - 6px)", minHeight: 68 },
          }}
        >
          <Box
            component="b"
            sx={{
              fontFamily: fontFamily.display,
              fontSize: 13,
              [mq.mobile]: { fontSize: 12 },
            }}
          >
            {title}
          </Box>
          <Box
            component="span"
            sx={{
              color: "text.secondary",
              fontSize: 9,
              fontFamily: fontFamily.mono,
            }}
          >
            {description}
          </Box>
        </Panel>
      ))}
    </Box>
  );
}

const Connector = () => (
  <Box aria-hidden sx={{ width: 2, height: 30, bgcolor: "primary.main" }} />
);

export function Architecture() {
  return (
    <SectionShell surface="base" header={ARCHITECTURE_HEADER}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "min(900px, 100%)",
        }}
      >
        <ArchRow nodes={ARCH_CLIENTS} />
        <Connector />
        <Box
          sx={{
            width: 300,
            p: 3,
            borderRadius: 1,
            bgcolor: "primary.main",
            color: "common.white",
            fontFamily: fontFamily.display,
            fontSize: 15,
            fontWeight: 700,
            textAlign: "center",
            [mq.mobile]: { width: "min(300px, 100%)", fontSize: 13 },
          }}
        >
          {ARCH_GATEWAY.title}{" "}
          <Box component="span" sx={{ fontWeight: 500 }}>
            {ARCH_GATEWAY.note}
          </Box>
        </Box>
        <Connector />
        <ArchRow nodes={ARCH_SERVICES} />
      </Box>
      <Box sx={{ mt: -4.5 }}>
        <CtaButton
          href={ROUTES.pricing}
          endIcon={<IconArrowRight size={16} aria-hidden />}
        >
          {ARCH_CTA}
        </CtaButton>
      </Box>
    </SectionShell>
  );
}
