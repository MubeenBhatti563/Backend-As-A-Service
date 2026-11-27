"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { UnderlineTabs } from "../shared/UnderlineTabs";
import { BucketCard } from "./BucketCard";
import { SAMPLE_BUCKETS, SAMPLE_STORAGE_STATS } from "./sampleData";
import { StatCard } from "./StatCard";

type StorageTab = "buckets" | "settings";

const TABS: { value: StorageTab; label: string }[] = [
  { value: "buckets", label: "Buckets" },
  { value: "settings", label: "Settings & CDN" },
];

export function StoragePage({ projectId }: { projectId: string }) {
  const [tab, setTab] = useState<StorageTab>("buckets");

  return (
    <Stack spacing={{ xs: 4, md: 5 }} useFlexGap sx={{ minWidth: 0 }}>
      <Box>
        <Typography component="h1" sx={{ fontSize: { xs: 23, md: 28 }, fontWeight: 700 }}>
          Storage
        </Typography>
        <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 13 }}>
          Preview bucket organization and storage settings for project assets.
        </Typography>
      </Box>

      <Alert severity="info">
        Preview only. Bucket names, file counts, sizes, and dates below are
        examples, not project data. Storage APIs, uploads, and CDN settings are
        not available yet.
      </Alert>

      <UnderlineTabs
        ariaLabel="Storage sections"
        items={TABS}
        value={tab}
        onChange={setTab}
      />

      {tab === "buckets" && (
        <Stack spacing={4} useFlexGap sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: 3,
            }}
          >
            {SAMPLE_STORAGE_STATS.map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))}
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between" }}
          >
            <Typography component="h2" sx={{ fontSize: 15, fontWeight: 600 }}>
              Sample buckets ({SAMPLE_BUCKETS.length})
            </Typography>
            <Button
              disabled
              variant="contained"
              startIcon={<IconPlus size={15} />}
              sx={{ textTransform: "none", whiteSpace: "nowrap" }}
            >
              Create bucket
            </Button>
          </Stack>

          <Box
            component="ul"
            aria-label="Sample storage buckets"
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              gap: 3,
              m: 0,
              p: 0,
              listStyle: "none",
            }}
          >
            {SAMPLE_BUCKETS.map((bucket) => (
              <BucketCard
                key={bucket.id}
                bucket={bucket}
                href={`/dashboard/projects/${encodeURIComponent(projectId)}/storage/${encodeURIComponent(bucket.id)}`}
              />
            ))}
          </Box>
        </Stack>
      )}

      {tab === "settings" && (
        <Box
          sx={{
            p: { xs: 4, sm: 5 },
            bgcolor: "background.default",
            border: 1,
            borderColor: "border.default",
            borderRadius: 1.5,
          }}
        >
          <Typography component="h2" sx={{ fontWeight: 600 }}>
            Storage settings are not available yet
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 13, color: "text.secondary" }}>
            CDN configuration, bucket policies, and project storage settings
            will be available when storage services are implemented.
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
