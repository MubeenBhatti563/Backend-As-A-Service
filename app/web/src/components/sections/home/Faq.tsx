import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material";
import { IconChevronDown } from "@tabler/icons-react";
import { FAQ_HEADER, FAQS } from "@/constants/homePage";
import { SECTION_IDS } from "@/config/routes";
import { mq } from "@/theme/tokens";
import { SectionShell } from "../../common";

export function Faq() {
  return (
    <SectionShell
      id={SECTION_IDS.faq}
      surface="base"
      gap={11}
      header={FAQ_HEADER}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3.25,
          width: "min(960px, 100%)",
          [mq.mobile]: { gap: 2.5 },
        }}
      >
        {FAQS.map(({ question, answer }, i) => (
          <Accordion
            key={question}
            defaultExpanded={i === 0}
            disableGutters
            elevation={0}
            sx={{
              bgcolor: "background.default",
              border: 1,
              borderColor: "border.default",
              "&, &:first-of-type, &:last-of-type": { borderRadius: 1 },
              "&::before": { display: "none" },
            }}
          >
            <AccordionSummary
              id={`faq-${i}-header`}
              aria-controls={`faq-${i}-content`}
              expandIcon={
                <Box sx={{ display: "flex", color: "text.disabled" }}>
                  <IconChevronDown size={18} aria-hidden />
                </Box>
              }
              sx={{
                minHeight: 0,
                p: 4.75,
                gap: 4,
                "&.Mui-expanded": { minHeight: 0, pb: 0 },
                "& .MuiAccordionSummary-content, & .MuiAccordionSummary-content.Mui-expanded":
                  { m: 0 },
                [mq.mobile]: { p: 4 },
              }}
            >
              <Typography
                variant="subtitle1"
                component="h3"
                sx={{
                  color: "common.white",
                  fontSize: 15,
                  fontWeight: 600,
                  [mq.mobile]: { fontSize: 14 },
                }}
              >
                {question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              id={`faq-${i}-content`}
              sx={{ px: 4.75, pt: 3, pb: 4.75, [mq.mobile]: { px: 4, pb: 4 } }}
            >
              <Typography
                color="text.secondary"
                sx={{ maxWidth: 850, fontSize: 13, lineHeight: 1.6 }}
              >
                {answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </SectionShell>
  );
}
