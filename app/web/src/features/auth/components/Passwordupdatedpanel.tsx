"use client";
// PasswordUpdatedPanel.tsx – right side of the "Password Updated" screen (Next.js App Router).
// Needs: @mui/material, @tabler/icons-react, next. No form, so no schema.
// Put it next to <TerminalPane /> exactly like the other auth pages.
import { Box, Button, Typography } from "@mui/material";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import NextLink from "next/link";

/* ----------------------------- content ----------------------------- */
const COPY = {
  title: "Password Updated",
  subtitle:
    "Your database administrator credentials have been successfully updated. You can now access your console.",
  action: "Proceed to Login",
} as const;

const SHOW_LOGO_BELOW_900 = "@media (max-width: 900px)";

/* ------------------------------ component --------------------------- */
interface PasswordUpdatedPanelProps {
  loginHref?: string;
}

export function PasswordUpdatedPanel({
  loginHref = "/login",
}: PasswordUpdatedPanelProps) {
  return (
    // Wrap in a centered flex container, e.g. <Box sx={{ flexGrow: 1, display: "grid", placeItems: "center", p: 20 }}>
    <Box
      sx={{
        width: "100%",
        maxWidth: 420,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {/* the left pane is hidden on small screens, so the logo moves here */}
      <Box
        sx={{
          display: "none",
          mb: 8,
          [SHOW_LOGO_BELOW_900]: { display: "inline-flex" },
        }}
      >
        <Typography
          component="span"
          variant="h6"
          sx={{ fontSize: 25, fontWeight: 800, lineHeight: "32px" }}
        >
          DevStack
        </Typography>
      </Box>

      {/* success badge: outlined ring with a filled inner circle */}
      <Box
        aria-hidden
        sx={{
          display: "grid",
          placeItems: "center",
          width: 80,
          height: 80,
          mb: 8,
          borderRadius: "50%",
          border: "1px solid",
          borderColor: "success.main",
          bgcolor: "rgba(16, 185, 129, 0.06)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            width: 40,
            height: 40,
            borderRadius: "50%",
            bgcolor: "rgba(16, 185, 129, 0.15)",
            color: "success.main",
          }}
        >
          <IconCheck size={28} stroke={2} />
        </Box>
      </Box>

      <Typography
        variant="h3"
        component="h1"
        sx={{ lineHeight: "40px", mb: 3 }}
      >
        {COPY.title}
      </Typography>
      <Typography
        sx={{ color: "text.secondary", fontSize: 14, lineHeight: 1.5, mb: 8 }}
      >
        {COPY.subtitle}
      </Typography>

      <Button
        component={NextLink}
        href={loginHref}
        variant="contained"
        fullWidth
        endIcon={<IconArrowRight size={16} aria-hidden />}
        sx={{ minHeight: 42, py: 0, gap: 0.5 }}
      >
        {COPY.action}
      </Button>
    </Box>
  );
}
