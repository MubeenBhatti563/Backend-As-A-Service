import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import Link from "next/link";
import { IconBucket, IconTrash } from "@tabler/icons-react";
import { TagChip } from "../shared/TagChip";
import type { Bucket } from "./types";
import { formatBytes } from "./format-bytes";

const ACCESS_CHIP = {
  Public: { tint: "success" as const, color: "success.main" },
  Private: { tint: "neutral" as const, color: "text.secondary" },
};

function BucketDetail({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography
        component="dt"
        sx={{ fontSize: 10, color: "text.disabled", textTransform: "uppercase" }}
      >
        {label}
      </Typography>
      <Typography component="dd" sx={{ m: 0, mt: 0.5, fontSize: 13, fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}

export function BucketCard({
  bucket,
  href,
  onDelete,
}: {
  bucket: Bucket;
  href: string;
  onDelete: (bucket: Bucket) => void;
}) {
  const fileLabel = `${bucket.fileCount.toLocaleString("en-US")} ${
    bucket.fileCount === 1 ? "file" : "files"
  }`;

  return (
    <Box
      component="li"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        minWidth: 0,
        p: { xs: 3, sm: 4 },
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
          <Box
            aria-hidden="true"
            sx={{
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              width: 34,
              height: 34,
              bgcolor: "background.elevated",
              borderRadius: 1,
              color: "secondary.main",
            }}
          >
            <IconBucket size={19} />
          </Box>
          <Typography
            component={Link}
            href={href}
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: 15,
              fontWeight: 600,
              color: "text.primary",
              textDecoration: "none",
              "&:hover": { color: "secondary.main" },
            }}
          >
            {bucket.name}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <TagChip label={bucket.access} {...ACCESS_CHIP[bucket.access]} />
          <Tooltip
            title={
              bucket.fileCount > 0
                ? "Delete all files before removing this bucket"
                : "Delete empty bucket"
            }
          >
            <span>
              <IconButton
                aria-label={`Delete ${bucket.name} bucket`}
                size="small"
                disabled={bucket.fileCount > 0}
                onClick={() => onDelete(bucket)}
              >
                <IconTrash size={15} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      <Stack
        component="dl"
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 2, sm: 4 }}
        sx={{ m: 0, flexWrap: "wrap" }}
      >
        <BucketDetail label="Files" value={fileLabel} />
        <BucketDetail label="Size" value={formatBytes(bucket.sizeBytes)} />
        <BucketDetail
          label="Created"
          value={new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
            new Date(bucket.createdAt),
          )}
        />
      </Stack>
    </Box>
  );
}
