"use client";
// CheckEmailPanel.tsx – right side of the "Check your email" screen (Next.js App Router).
// Needs: @mui/material, @tabler/icons-react. No schema needed (there is no form to validate).
// Put it next to <TerminalPane /> exactly like the other auth pages.
import { Alert, Box, Button, Link as MuiLink, Typography } from "@mui/material";
import { IconArrowRight, IconMail } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { SHOW_LOGO_BELOW_900 } from "..";

/* ----------------------------- content ----------------------------- */
const COPY = {
  title: "Check your email",
  subtitle:
    "We've dispatched a secure verification handshake link to your registered inbox to active the cluster console.",
  openMail: "Open Mail client",
  noEmail: "Didn't receive the credentials?",
  resend: "Resend verification email",
  resending: "Sending…",
  resendIn: (s: number) => `Resend available in ${s}s`,
  resent: "A new verification email is on its way.",
} as const;

const RESEND_COOLDOWN_SECONDS = 30;

/* ------------------------------ component --------------------------- */
interface CheckEmailPanelProps {
  /** Where "Open Mail client" goes. Default opens the user's default mail app. */
  mailHref?: string;
  /** Resolve on success, throw an Error (message is shown) on failure. Omit to hide the resend link. */
  onResend?: () => Promise<void>;
}

export function CheckEmailPanel({
  mailHref = "mailto:",
  onResend,
}: CheckEmailPanelProps) {
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // tick the resend cooldown down once a second
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resend = async () => {
    if (!onResend || sending || cooldown > 0) return;
    setSending(true);
    setStatus(null);
    try {
      await onResend();
      setStatus({ type: "success", message: COPY.resent });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  const resendLabel = sending
    ? COPY.resending
    : cooldown > 0
      ? COPY.resendIn(cooldown)
      : COPY.resend;
  const resendDisabled = sending || cooldown > 0;

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
          alignItems: "center",
          gap: 2.5,
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
          color: "info.main",
          bgcolor: "rgba(37, 99, 235, 0.1)",
          border: "1px solid",
          borderColor: "primary.main",
        }}
      >
        <IconMail size={30} stroke={1.75} />
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
        component="a"
        href={mailHref}
        variant="contained"
        fullWidth
        endIcon={<IconArrowRight size={16} aria-hidden />}
        sx={{ minHeight: 42, py: 0, gap: 0.5 }}
      >
        {COPY.openMail}
      </Button>

      {onResend && (
        <Box
          sx={{
            mt: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            width: "100%",
          }}
        >
          <Typography
            sx={{ color: "text.disabled", fontSize: 13, lineHeight: "17px" }}
          >
            {COPY.noEmail}
          </Typography>

          {status && (
            <Alert
              severity={status.type}
              role={status.type === "error" ? "alert" : "status"}
              sx={{ width: "100%", textAlign: "left" }}
            >
              {status.message}
            </Alert>
          )}

          <MuiLink
            component="button"
            type="button"
            onClick={resend}
            disabled={resendDisabled}
            underline="none"
            sx={{
              color: "info.main",
              fontSize: 14,
              fontWeight: 600,
              lineHeight: "18px",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
              "&:disabled": {
                color: "text.disabled",
                cursor: "default",
                textDecoration: "none",
              },
            }}
          >
            {resendLabel}
          </MuiLink>
        </Box>
      )}
    </Box>
  );
}
