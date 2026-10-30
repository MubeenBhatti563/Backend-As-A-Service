"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  IconCheck,
  IconAlertCircle,
  IconMail,
  IconArrowRight,
} from "@tabler/icons-react";
import NextLink from "next/link";
import { TerminalPane } from "@/features/auth/components/TerminalPane";
import { useVerifyEmail } from "@/features/auth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const verifyEmailMutation = useVerifyEmail();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (token && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      verifyEmailMutation.mutate({ token });
    }
  }, [token, verifyEmailMutation]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 440,
        m: "auto",
        p: { xs: 3, sm: 4 },
        borderRadius: 2,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack spacing={3} sx={{ alignItems: "center", textAlign: "center" }}>
        {!token ? (
          <>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "warning.main",
                display: "grid",
                placeItems: "center",
                color: "warning.contrastText",
              }}
            >
              <IconMail size={28} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Verify your email
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A verification link was dispatched to your email address. Please
              click the link in the email to activate your account and start
              provisioning databases.
            </Typography>
            <Button
              component={NextLink}
              href="/auth/login"
              variant="outlined"
              fullWidth
            >
              Return to Sign In
            </Button>
          </>
        ) : verifyEmailMutation.isPending ? (
          <>
            <CircularProgress size={44} />
            <Typography variant="h6">Verifying your email address...</Typography>
            <Typography variant="body2" color="text.secondary">
              Validating your security cryptographic token with the server.
            </Typography>
          </>
        ) : verifyEmailMutation.isSuccess ? (
          <>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "success.main",
                display: "grid",
                placeItems: "center",
                color: "success.contrastText",
              }}
            >
              <IconCheck size={28} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Email Verified Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your account has been fully authenticated. You can now log in to
              access the console and developer APIs.
            </Typography>
            <Button
              component={NextLink}
              href="/auth/login"
              variant="contained"
              fullWidth
              endIcon={<IconArrowRight size={18} />}
            >
              Proceed to Sign In
            </Button>
          </>
        ) : (
          <>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "error.main",
                display: "grid",
                placeItems: "center",
                color: "error.contrastText",
              }}
            >
              <IconAlertCircle size={28} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Verification Failed
            </Typography>
            <Alert severity="error" sx={{ width: "100%" }}>
              {verifyEmailMutation.error?.message ||
                "This verification link is invalid or has expired."}
            </Alert>
            <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
              <Button
                component={NextLink}
                href="/auth/login"
                variant="outlined"
                fullWidth
              >
                Sign In
              </Button>
              <Button
                component={NextLink}
                href="/auth/register"
                variant="contained"
                fullWidth
              >
                Sign Up
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </Box>
  );
}

export default function VerifyEmailPage() {
  return (
    <Box
      component="main"
      sx={{
        display: "flex",
        height: "100dvh",
        overflow: "hidden",
        width: "100%",
        bgcolor: "background.input",
      }}
    >
      <TerminalPane />
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          py: { xs: 3, md: 4 },
        }}
      >
        <Suspense
          fallback={
            <Box sx={{ m: "auto", display: "grid", placeItems: "center" }}>
              <CircularProgress />
            </Box>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </Box>
    </Box>
  );
}
