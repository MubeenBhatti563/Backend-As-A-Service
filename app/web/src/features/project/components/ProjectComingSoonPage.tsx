import { Box, Stack, Typography } from "@mui/material";
import { ComingSoonBanner } from "@/components/common";
import { PROJECT_ROUTES } from "../constants";
import { font, panelSx } from "../styles";
import { OverviewHeader } from "./OverviewHeader";

interface Props {
  projectId: string;
  title: string;
  description: string;
  highlights: readonly string[];
}

export function ProjectComingSoonPage({
  projectId,
  title,
  description,
  highlights,
}: Props) {
  return (
    <Stack spacing={{ xs: 4, md: 6 }} useFlexGap sx={{ minWidth: 0 }}>
      <OverviewHeader title={title} description={description} />

      <ComingSoonBanner
        title={`${title} is on the way.`}
        description="We’re building this area to fit naturally into your project workflow. It isn’t available yet, but here’s what you’ll be able to do when it launches."
        actionHref={PROJECT_ROUTES.forProject(projectId).overview}
        actionLabel="Back to project overview"
      />

      <Box
        component="section"
        aria-label={`${title} planned capabilities`}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },
          gap: { xs: 3, sm: 4 },
        }}
      >
        {highlights.map((highlight, index) => (
          <Box
            key={highlight}
            sx={{
              ...panelSx,
              display: "flex",
              alignItems: "flex-start",
              gap: 2.5,
              p: { xs: 4, sm: 5 },
              minWidth: 0,
            }}
          >
            <Box
              aria-hidden
              sx={{
                display: "grid",
                placeItems: "center",
                flex: "0 0 auto",
                width: 28,
                height: 28,
                borderRadius: 1,
                color: "secondary.main",
                bgcolor: "statusBackground.primary",
                fontFamily: font.mono,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </Box>
            <Typography
              sx={{
                fontSize: 13,
                lineHeight: 1.6,
                overflowWrap: "anywhere",
              }}
            >
              {highlight}
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
