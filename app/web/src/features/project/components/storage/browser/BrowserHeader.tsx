import Link from "next/link";
import { Box, Breadcrumbs, Button, Stack, Typography } from "@mui/material";
import { IconFolderPlus, IconUpload } from "@tabler/icons-react";
import { TagChip } from "../../shared/TagChip";
import type { Bucket } from "../types";

export function BrowserHeader({
  projectId,
  bucket,
}: {
  projectId: string;
  bucket: Bucket;
}) {
  return (
    <Stack
      spacing={2}
      useFlexGap
      sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
      direction={{ xs: "column", md: "row" }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Breadcrumbs
          separator="/"
          aria-label="Breadcrumb"
          sx={{ fontSize: 12, color: "text.disabled" }}
        >
          <Typography
            component={Link}
            href={`/dashboard/projects/${encodeURIComponent(projectId)}/storage`}
            sx={{
              fontSize: 12,
              color: "text.secondary",
              textDecoration: "none",
              "&:hover": { color: "text.primary" },
            }}
          >
            Storage
          </Typography>
          <Typography aria-current="page" sx={{ fontSize: 12, color: "text.primary" }}>
            {bucket.name}
          </Typography>
        </Breadcrumbs>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { xs: "flex-start", sm: "center" }, mt: 2 }}
        >
          <Typography component="h1" sx={{ fontSize: { xs: 23, md: 28 }, fontWeight: 700 }}>
            {bucket.name}
          </Typography>
          <TagChip
            label={bucket.access}
            tint={bucket.access === "Public" ? "success" : "neutral"}
            color={bucket.access === "Public" ? "success.main" : "text.secondary"}
          />
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {bucket.fileCount.toLocaleString("en-US")} files · {bucket.size}
          </Typography>
        </Stack>
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: { xs: "100%", md: "auto" } }}>
        <Button
          disabled
          variant="outlined"
          startIcon={<IconFolderPlus size={16} />}
          sx={{ textTransform: "none" }}
        >
          Create folder
        </Button>
        <Button
          disabled
          variant="contained"
          startIcon={<IconUpload size={16} />}
          sx={{ textTransform: "none" }}
        >
          Upload file
        </Button>
      </Stack>
    </Stack>
  );
}
