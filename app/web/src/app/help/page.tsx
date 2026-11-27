import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/material";
import { ComingSoonBanner } from "@/components/common";

export const metadata: Metadata = { title: "Help & Support" };

export default function HelpPage() {
  return (
    <Box
      component="main"
      sx={{
        display: "grid",
        minHeight: "100dvh",
        placeItems: "center",
        p: { xs: 4, sm: 8 },
        bgcolor: "background.input",
      }}
    >
      <Stack spacing={4} useFlexGap sx={{ width: "100%", maxWidth: 960 }}>
        <Box>
          <Typography
            component="h1"
            sx={{ fontSize: { xs: 26, sm: 32 }, fontWeight: 700 }}
          >
            Help & Support
          </Typography>
          <Typography sx={{ mt: 1, color: "text.secondary" }}>
            Find guidance and get help with your projects.
          </Typography>
        </Box>
        <ComingSoonBanner
          title="Help & Support isn’t available yet."
          description="We’re preparing documentation and support resources to help you get the most out of DevStack. In the meantime, you can continue managing your projects from the dashboard."
          actionHref="/dashboard/projects"
          actionLabel="Go to your projects"
        />
      </Stack>
    </Box>
  );
}
