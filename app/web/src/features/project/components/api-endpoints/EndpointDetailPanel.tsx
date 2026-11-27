"use client";

import { useState } from "react";
import { Alert, Box, Button, Snackbar, Stack, Typography } from "@mui/material";
import { IconCopy, IconPlayerPlay } from "@tabler/icons-react";
import { UnderlineTabs } from "../shared/UnderlineTabs";
import { AccessBadge } from "./AccessBadge";
import { MethodBadge } from "./MethodBadge";
import type { CodeLanguage, Endpoint } from "./types";

const LANGUAGE_TABS: { value: CodeLanguage; label: string }[] = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "curl", label: "cURL" },
];

export function EndpointDetailPanel({ endpoint }: { endpoint: Endpoint }) {
  const [language, setLanguage] = useState<CodeLanguage>("typescript");
  const [notice, setNotice] = useState("");

  const copyCurl = async () => {
    try {
      await navigator.clipboard.writeText(endpoint.snippets.curl);
      setNotice("Sample cURL copied.");
    } catch {
      setNotice("Could not access the clipboard. Copy the cURL snippet manually.");
    }
  };

  return (
    <>
      <Box
        component="aside"
        aria-label="Endpoint example details"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          width: { xs: "100%", lg: 440 },
          flexShrink: 0,
          minWidth: 0,
          p: { xs: 4, sm: 5 },
          bgcolor: "background.default",
          border: 1,
          borderColor: "border.default",
          borderRadius: 1.5,
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", justifyContent: "space-between", minWidth: 0 }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", minWidth: 0 }}>
            <MethodBadge method={endpoint.method} />
            <Typography
              variant="code"
              component="h2"
              sx={{ minWidth: 0, fontSize: 13, fontWeight: 600, overflowWrap: "anywhere" }}
            >
              {endpoint.path}
            </Typography>
          </Stack>
          <AccessBadge access={endpoint.access} bare />
        </Stack>

        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
          {endpoint.description}
        </Typography>

        <UnderlineTabs
          size="sm"
          ariaLabel="Code language"
          items={LANGUAGE_TABS}
          value={language}
          onChange={setLanguage}
        />

        <Box
          sx={{
            p: 3,
            minWidth: 0,
            bgcolor: "background.input",
            border: 1,
            borderColor: "border.default",
            borderRadius: 1,
            overflowX: "auto",
          }}
        >
          <Typography
            component="pre"
            variant="code"
            sx={{
              m: 0,
              fontSize: 11,
              lineHeight: 1.7,
              whiteSpace: "pre",
              color: "secondary.main",
            }}
          >
            {endpoint.snippets[language]}
          </Typography>
        </Box>

        <Stack spacing={2} useFlexGap>
          <Typography component="h3" sx={{ fontSize: 11, fontWeight: 600, color: "text.secondary" }}>
            SAMPLE RESPONSE
          </Typography>
          <Box
            sx={{
              p: 3,
              minWidth: 0,
              bgcolor: "background.input",
              border: 1,
              borderColor: "border.default",
              borderRadius: 1,
              overflowX: "auto",
            }}
          >
            <Typography
              component="pre"
              variant="code"
              sx={{ m: 0, fontSize: 11, lineHeight: 1.7, whiteSpace: "pre", color: "success.main" }}
            >
              {endpoint.responseExample}
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button
            disabled
            startIcon={<IconPlayerPlay size={15} />}
            variant="contained"
            sx={{ flex: 1, textTransform: "none" }}
          >
            Try endpoint
          </Button>
          <Button
            onClick={copyCurl}
            startIcon={<IconCopy size={15} />}
            variant="outlined"
            sx={{ flex: 1, textTransform: "none" }}
          >
            Copy sample cURL
          </Button>
        </Stack>
      </Box>
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3500}
        onClose={() => setNotice("")}
      >
        <Alert severity={notice.startsWith("Could not") ? "warning" : "success"} onClose={() => setNotice("")}>
          {notice}
        </Alert>
      </Snackbar>
    </>
  );
}
