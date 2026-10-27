import { Box, Typography } from "@mui/material";
import { IconArrowRight } from "@tabler/icons-react";
import { PLANS, PRICING_HEADER } from "@/constants/homePage";
import { SECTION_IDS } from "@/config/routes";
import { fontFamily, mq } from "@/theme/tokens";
import { Badge, CheckList, CtaButton, Panel, SectionShell } from "../../common";

export function Pricing() {
  return (
    <SectionShell
      id={SECTION_IDS.pricing}
      surface="panel"
      bordered
      gap={13.5}
      header={PRICING_HEADER}
    >
      <Box
        sx={{
          display: "grid",
          alignItems: "center",
          width: "100%",
          gap: 5,
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          [mq.mobile]: { gridTemplateColumns: "1fr", gap: 3.5 },
        }}
      >
        {PLANS.map((plan) => (
          <Panel
            component="article"
            key={plan.name}
            surface={plan.featured ? "raised" : "panel"}
            outline={plan.featured ? "primary" : "default"}
            radius={1.875}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 5.75,
              minHeight: plan.featured ? 464 : 435,
              p: 7,
              ...(plan.featured && { border: 2, borderColor: "primary.main" }),
              [mq.tablet]: { p: 5.5 },
              [mq.mobile]: { minHeight: 0, p: 5.75 },
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  minHeight: 26,
                }}
              >
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ fontSize: 20, fontWeight: 700 }}
                >
                  {plan.name}
                </Typography>
                {plan.featured && <Badge label="Recommended" />}
              </Box>
              <Typography
                color="text.secondary"
                sx={{ minHeight: 34, fontSize: 12, lineHeight: 1.5 }}
              >
                {plan.description}
              </Typography>
            </Box>

            <Typography
              component="p"
              sx={{
                display: "flex",
                alignItems: "baseline",
                gap: 1.75,
                color: "common.white",
                fontFamily: fontFamily.display,
                fontSize: 36,
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              {plan.price}
              {plan.showPeriod && (
                <Box
                  component="span"
                  sx={{
                    color: "text.disabled",
                    fontFamily: fontFamily.body,
                    fontSize: 13,
                    fontWeight: 400,
                  }}
                >
                  /month
                </Box>
              )}
            </Typography>

            <CheckList items={plan.features} accent={plan.featured} />

            <CtaButton
              href={plan.href}
              fullWidth
              kind={plan.featured ? "primary" : "secondary"}
              endIcon={
                plan.featured ? (
                  <IconArrowRight size={16} aria-hidden />
                ) : undefined
              }
            >
              {plan.cta}
            </CtaButton>
          </Panel>
        ))}
      </Box>
    </SectionShell>
  );
}
