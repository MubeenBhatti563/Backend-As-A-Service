"use client";

import { useMemo, useState } from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import { UnderlineTabs } from "../shared/UnderlineTabs";
import { EndpointDetailPanel } from "./EndpointDetailPanel";
import { EndpointListCard } from "./EndpointListCard";
import { SAMPLE_ENDPOINT_GROUPS } from "./mockData";
import type { Endpoint } from "./types";

type PageTab = "endpoints" | "documentation";
const PAGE_TABS: { value: PageTab; label: string }[] = [
  { value: "endpoints", label: "Endpoints" },
  { value: "documentation", label: "Documentation" },
];

export function ApiEndpointsPage() {
  const [tab, setTab] = useState<PageTab>("endpoints");
  const [selectedId, setSelectedId] = useState("users-get");
  const selected = useMemo(
    () =>
      SAMPLE_ENDPOINT_GROUPS.flatMap((group) => group.endpoints).find(
        (endpoint) => endpoint.id === selectedId,
      ) ?? SAMPLE_ENDPOINT_GROUPS[0]?.endpoints[0],
    [selectedId],
  );

  return (
    <Stack spacing={{ xs: 4, md: 5 }} useFlexGap sx={{ minWidth: 0 }}>
      <Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { xs: "flex-start", sm: "center" } }}
        >
          <Typography component="h1" sx={{ fontSize: { xs: 23, md: 28 }, fontWeight: 700 }}>
            API Endpoints
          </Typography>
          <Box
            component="span"
            sx={{
              px: 2,
              py: 0.5,
              borderRadius: 99,
              bgcolor: "statusBackground.primary",
              color: "secondary.main",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Preview
          </Box>
        </Stack>
        <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 13 }}>
          Explore example REST endpoints and their request and response shapes.
        </Typography>
      </Box>
      <Alert severity="info">
        These are illustrative examples, not live project endpoints. Generated
        REST APIs and endpoint execution are not available yet.
      </Alert>
      <UnderlineTabs
        ariaLabel="API endpoints sections"
        items={PAGE_TABS}
        value={tab}
        onChange={setTab}
      />
      {tab === "endpoints" && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              lg: "minmax(0, 1fr) minmax(340px, 440px)",
            },
            alignItems: "start",
            gap: { xs: 3, sm: 4 },
            minWidth: 0,
          }}
        >
          <EndpointListCard
            groups={SAMPLE_ENDPOINT_GROUPS}
            selectedId={selected?.id ?? ""}
            onSelect={(endpoint: Endpoint) => setSelectedId(endpoint.id)}
          />
          {selected && <EndpointDetailPanel endpoint={selected} />}
        </Box>
      )}
      {tab === "documentation" && (
        <Box
          sx={{
            p: { xs: 4, sm: 5 },
            bgcolor: "background.default",
            border: 1,
            borderColor: "border.default",
            borderRadius: 1.5,
          }}
        >
          <Typography component="h2" sx={{ mb: 1, fontWeight: 600 }}>
            API documentation is not available yet
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            Endpoint documentation will be generated when project REST API
            generation is implemented.
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
