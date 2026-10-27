import { Box, Typography } from "@mui/material";
import { IconShieldCheck } from "@tabler/icons-react";
import { SECURITY_HEADER, SECURITY_ITEMS } from "@/constants/homePage";
import { SECTION_IDS } from "@/config/routes";
import { mq } from "@/theme/tokens";
import { Panel, SectionShell } from "../../common";

export function Security() {
  return (
    <SectionShell
      id={SECTION_IDS.security}
      surface="base"
      header={SECURITY_HEADER}
    >
      <Box
        sx={{
          display: "grid",
          width: "100%",
          gap: 3.5,
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          [mq.tablet]: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
          [mq.mobile]: { gridTemplateColumns: "1fr", gap: 2.5 },
        }}
      >
        {SECURITY_ITEMS.map(({ title, description }) => (
          <Panel
            component="article"
            key={title}
            sx={{ display: "flex", gap: 3.5, minHeight: 94, p: 4.25 }}
          >
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                flex: "0 0 32px",
                width: 32,
                height: 32,
                borderRadius: 0.75,
                bgcolor: "background.elevated",
                color: "success.main",
              }}
            >
              <IconShieldCheck size={18} aria-hidden />
            </Box>
            <Box>
              <Typography
                variant="h6"
                component="h3"
                sx={{ mt: 0.25, mb: 1.25, fontSize: 14, fontWeight: 600 }}
              >
                {title}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ fontSize: 11, lineHeight: 1.5 }}
              >
                {description}
              </Typography>
            </Box>
          </Panel>
        ))}
      </Box>
    </SectionShell>
  );
}
