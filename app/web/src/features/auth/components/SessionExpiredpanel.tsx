"use client";
// SessionExpiredPanel.tsx – right side of the "Session Expired" screen (Next.js App Router).
// Needs: @mui/material, @tabler/icons-react, next. No form, so no schema.
// Put it next to <TerminalPane /> exactly like the other auth pages.
import { Box, Button, Link as MuiLink, Typography } from "@mui/material";
import { IconAlarm, IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import NextLink from "next/link";

/* ----------------------------- content ----------------------------- */
const COPY = {
  title: "Session Expired",
  subtitle:
    "Your authentication handshake timed out for security reasons. Sign in again to restore secure pipeline tunnels.",
  signIn: "Sign In Again",
  home: "Return to Home",
} as const;

const SHOW_LOGO_BELOW_900 = "@media (max-width: 900px)";

/* ------------------------------ component --------------------------- */
interface SessionExpiredPanelProps {
  loginHref?: string;
  homeHref?: string;
}

export function SessionExpiredPanel({
  loginHref = "/login",
  homeHref = "/",
}: SessionExpiredPanelProps) {
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
          borderColor: "warning.main",
          bgcolor: "rgba(245, 158, 11, 0.1)",
          color: "warning.main",
        }}
      >
        <IconAlarm size={30} stroke={1.75} />
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
        {COPY.signIn}
      </Button>

      <MuiLink
        component={NextLink}
        href={homeHref}
        underline="none"
        sx={{
          mt: 5,
          display: "inline-flex",
          alignItems: "center",
          gap: 1.5,
          color: "info.main",
          fontSize: 14,
          fontWeight: 600,
          lineHeight: "18px",
          "&:hover": { textDecoration: "underline" },
        }}
      >
        <IconArrowLeft size={16} aria-hidden />
        {COPY.home}
      </MuiLink>
    </Box>
  );
}
