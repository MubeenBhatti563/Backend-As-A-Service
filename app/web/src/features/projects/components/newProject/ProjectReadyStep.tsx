"use client";
import { ONBOARDING_ROUTES } from "@/config/routes";
// ProjectReadyStep.tsx – right side of onboarding step 3 ("Your Project is Ready!").
// Needs: @mui/material, @tabler/icons-react, next. Render it inside:
//   <OnboardingLayout currentStep="sdk" contentWidth={600} pinSidebarFooter stepTitles={{ project: "Configure Instance" }}>
import { Box, Button, IconButton, Typography } from "@mui/material";
import {
  IconAlertTriangle,
  IconCheck,
  IconCopy,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import NextLink from "next/link";
import { useEffect, useRef, useState } from "react";

const FONT_DISPLAY = "var(--font-outfit), Outfit, sans-serif";
const FONT_MONO = 'var(--font-geist-mono), "Geist Mono", monospace';

const COPY = {
  title: "Your Project is Ready!",
  endpoint: "PROJECT ENDPOINT URL",
  publicKey: "PUBLIC API KEY (ANON)",
  secretKey: "SECRET SERVICE ROLE KEY",
  warning:
    "Never expose your Secret API Key in client-side code. This key bypasses row-level security and grants root access to your DB.",
  docs: "View SDK Documentation",
  dashboard: "Go to Dashboard",
} as const;

const MASK = "•".repeat(40);
const COPIED_FOR_MS = 2000;

export interface ProjectCredentials {
  endpointUrl: string;
  publicKey: string;
  secretKey: string;
}

const iconButtonSx = {
  width: 26,
  height: 26,
  p: 0,
  bgcolor: "background.default",
  borderRadius: 0.5,
  color: "text.secondary",
  "&:hover": { bgcolor: "background.elevated", color: "text.primary" },
} as const;

function CredentialField({
  label,
  value,
  secret,
}: {
  label: string;
  value: string;
  secret?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value); // always copies the real value, even while masked
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), COPIED_FOR_MS);
    } catch {
      /* clipboard blocked (insecure context / permissions): nothing to show */
    }
  };

  const hidden = secret && !revealed;
  const niceLabel = label.charAt(0) + label.slice(1).toLowerCase();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography
        component="span"
        sx={{
          color: "text.secondary",
          fontSize: 12,
          fontWeight: 600,
          lineHeight: "16px",
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          height: 44,
          pl: "14px",
          pr: 3,
          bgcolor: "background.input",
          border: 1,
          borderColor: "border.default",
          borderRadius: 1,
        }}
      >
        <Typography
          component="span"
          title={hidden ? undefined : value}
          sx={{
            minWidth: 0,
            flexGrow: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: hidden ? "text.disabled" : "common.white",
            fontFamily: FONT_MONO,
            fontSize: 13,
            lineHeight: "17px",
          }}
        >
          {hidden ? MASK : value}
        </Typography>
        <Box sx={{ display: "flex", flex: "none", gap: 2 }}>
          {secret && (
            <IconButton
              aria-label={revealed ? "Hide secret key" : "Show secret key"}
              aria-pressed={revealed}
              onClick={() => setRevealed((v) => !v)}
              sx={iconButtonSx}
            >
              {revealed ? (
                <IconEyeOff size={14} aria-hidden />
              ) : (
                <IconEye size={14} aria-hidden />
              )}
            </IconButton>
          )}
          <IconButton
            aria-label={`Copy ${niceLabel}`}
            onClick={copy}
            sx={{ ...iconButtonSx, ...(copied && { color: "success.main" }) }}
          >
            {copied ? (
              <IconCheck size={14} aria-hidden />
            ) : (
              <IconCopy size={14} aria-hidden />
            )}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

interface ProjectReadyStepProps {
  projectName: string;
  credentials: ProjectCredentials;
  docsHref?: string;
  dashboardHref?: string;
}

export function ProjectReadyStep({
  projectName,
  credentials,
  docsHref = ONBOARDING_ROUTES.docs,
  dashboardHref = ONBOARDING_ROUTES.dashboard,
}: ProjectReadyStepProps) {
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          textAlign: "center",
        }}
      >
        <Box
          aria-hidden
          sx={{
            display: "grid",
            placeItems: "center",
            width: 64,
            height: 64,
            bgcolor: "rgba(16, 185, 129, 0.08)",
            border: 2,
            borderColor: "success.main",
            borderRadius: "99px",
            color: "success.main",
          }}
        >
          <IconCheck size={32} stroke={2} />
        </Box>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            color: "common.white",
            fontFamily: FONT_DISPLAY,
            fontSize: { xs: 28, sm: 32 },
            fontWeight: 800,
            lineHeight: { xs: "36px", sm: "40px" },
          }}
        >
          {COPY.title}
        </Typography>
        <Typography
          sx={{ color: "text.secondary", fontSize: 14, lineHeight: 1.6 }}
        >
          DevStack instance{" "}
          <Box
            component="strong"
            sx={{ color: "common.white", fontWeight: 600 }}
          >
            {projectName}
          </Box>{" "}
          is live globally. Use these credentials to hook up your local client
          SDK.
        </Typography>
      </Box>

      <Box
        component="section"
        aria-label="Project credentials"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          p: "23px",
          bgcolor: "background.default",
          border: 1,
          borderColor: "border.default",
          borderRadius: 1.5,
        }}
      >
        <CredentialField
          label={COPY.endpoint}
          value={credentials.endpointUrl}
        />
        <CredentialField label={COPY.publicKey} value={credentials.publicKey} />
        <CredentialField
          label={COPY.secretKey}
          value={credentials.secretKey}
          secret
        />
      </Box>

      <Box
        role="note"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          p: "15px",
          bgcolor: "rgba(245, 158, 11, 0.063)",
          border: 1,
          borderColor: "warning.main",
          borderRadius: 1,
          color: "warning.main",
        }}
      >
        <IconAlertTriangle size={18} aria-hidden style={{ flex: "none" }} />
        <Typography sx={{ color: "inherit", fontSize: 13, lineHeight: 1.4 }}>
          {COPY.warning}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 3,
        }}
      >
        <Button
          component={NextLink}
          href={docsHref}
          variant="outlined"
          sx={{
            flex: 1,
            minHeight: 42,
            py: 0,
            borderRadius: 1,
            borderColor: "border.default",
            color: "text.secondary",
            fontSize: 14,
            fontWeight: 600,
            "&:hover": {
              borderColor: "border.strong",
              color: "text.primary",
              bgcolor: "transparent",
            },
          }}
        >
          {COPY.docs}
        </Button>
        <Button
          component={NextLink}
          href={dashboardHref}
          variant="contained"
          sx={{ flex: 1, minHeight: 42, py: 0 }}
        >
          {COPY.dashboard}
        </Button>
      </Box>
    </Box>
  );
}
