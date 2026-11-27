import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { IconArrowRight, IconSparkles } from "@tabler/icons-react";
import { fontFamily } from "@/theme/tokens";

interface Props {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export function ComingSoonBanner({
  title,
  description,
  actionHref,
  actionLabel,
}: Props) {
  return (
    <Box
      component="section"
      aria-labelledby="coming-soon-title"
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: "background.default",
        border: 1,
        borderColor: "border.default",
        borderRadius: 1.5,
        p: { xs: 5, sm: 7, md: 9 },
        background:
          "linear-gradient(125deg, rgba(91, 82, 235, 0.18), rgba(17, 26, 43, 0.96) 58%, rgba(32, 52, 73, 0.78))",
        "&::after": {
          content: '""',
          position: "absolute",
          width: { xs: 180, sm: 260 },
          height: { xs: 180, sm: 260 },
          right: { xs: -80, sm: -70 },
          top: { xs: -90, sm: -110 },
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(137, 130, 255, 0.22), transparent 70%)",
          pointerEvents: "none",
        },
      }}
    >
      <Stack
        spacing={3}
        useFlexGap
        sx={{ position: "relative", zIndex: 1, maxWidth: 720 }}
      >
        <Chip
          icon={<IconSparkles size={15} />}
          label="Coming soon"
          color="secondary"
          variant="outlined"
          sx={{
            alignSelf: "flex-start",
            fontFamily: fontFamily.mono,
            fontSize: 11,
            bgcolor: "rgba(255,255,255,0.04)",
          }}
        />
        <Typography
          id="coming-soon-title"
          component="h2"
          sx={{
            fontFamily: fontFamily.display,
            fontSize: { xs: 26, sm: 34, md: 40 },
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: 600,
            textWrap: "balance",
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            maxWidth: 620,
            color: "text.secondary",
            fontSize: { xs: 14, sm: 16 },
            lineHeight: 1.7,
          }}
        >
          {description}
        </Typography>
        {actionHref && actionLabel && (
          <Button
            href={actionHref}
            variant="contained"
            endIcon={<IconArrowRight size={16} />}
            sx={{ alignSelf: "flex-start", mt: 1, textTransform: "none" }}
          >
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
