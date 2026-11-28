"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { IconPlus, IconX } from "@tabler/icons-react";
import { UnderlineTabs } from "../shared/UnderlineTabs";
import { BucketCard } from "./BucketCard";
import { StatCard } from "./StatCard";
import {
  createStorageBucket,
  deleteStorageBucket,
  fetchStorageBuckets,
} from "./api";
import { getErrorMessage } from "@/lib/get-error-message";
import { formatBytes } from "./format-bytes";
import type { Bucket } from "./types";

type StorageTab = "buckets" | "settings";

const TABS: { value: StorageTab; label: string }[] = [
  { value: "buckets", label: "Buckets" },
  { value: "settings", label: "Settings & CDN" },
];

export function StoragePage({ projectId }: { projectId: string }) {
  const [tab, setTab] = useState<StorageTab>("buckets");
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [bucketName, setBucketName] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [bucketToDelete, setBucketToDelete] = useState<Bucket | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    fetchStorageBuckets(projectId)
      .then((result) => {
        if (active) setBuckets(result);
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError, "Could not load project storage."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  const stats = useMemo(() => {
    const totalBytes = buckets.reduce(
      (total, bucket) => total + BigInt(bucket.sizeBytes),
      BigInt(0),
    );
    const totalFiles = buckets.reduce((total, bucket) => total + bucket.fileCount, 0);
    return [
      { id: "used", label: "Storage used", value: formatBytes(totalBytes.toString()) },
      { id: "buckets", label: "Buckets", value: buckets.length.toLocaleString("en-US") },
      { id: "files", label: "Files", value: totalFiles.toLocaleString("en-US") },
    ];
  }, [buckets]);

  const handleCreateBucket = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const created = await createStorageBucket(projectId, bucketName);
      setBuckets((current) => [...current, created]);
      setBucketName("");
      setCreateOpen(false);
    } catch (createFailure) {
      setCreateError(getErrorMessage(createFailure, "Could not create bucket."));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBucket = async () => {
    if (!bucketToDelete) return;
    setDeleting(true);
    setError("");
    try {
      await deleteStorageBucket(projectId, bucketToDelete.id);
      setBuckets((current) => current.filter((bucket) => bucket.id !== bucketToDelete.id));
      setBucketToDelete(null);
    } catch (deleteFailure) {
      setError(getErrorMessage(deleteFailure, "Could not delete bucket."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Stack spacing={{ xs: 4, md: 5 }} useFlexGap sx={{ minWidth: 0 }}>
      <Box>
        <Typography component="h1" sx={{ fontSize: { xs: 23, md: 28 }, fontWeight: 700 }}>
          Storage
        </Typography>
        <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 13 }}>
          Organize project files in private storage buckets.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

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
            {stats.map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))}
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between" }}
          >
            <Typography component="h2" sx={{ fontSize: 15, fontWeight: 600 }}>
              Buckets ({buckets.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<IconPlus size={15} />}
              onClick={() => {
                setCreateError("");
                setCreateOpen(true);
              }}
              sx={{ textTransform: "none", whiteSpace: "nowrap" }}
            >
              Create bucket
            </Button>
          </Stack>

          <Box
            component="ul"
            aria-label="Storage buckets"
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
            {loading &&
              Array.from({ length: 4 }, (_, index) => (
                <Skeleton
                  key={index}
                  variant="rounded"
                  height={118}
                  sx={{ bgcolor: "background.elevated", borderRadius: 1.5 }}
                />
              ))}
            {!loading && buckets.map((bucket) => (
              <BucketCard
                key={bucket.id}
                bucket={bucket}
                href={`/dashboard/projects/${encodeURIComponent(projectId)}/storage/${encodeURIComponent(bucket.id)}`}
                onDelete={setBucketToDelete}
              />
            ))}
            {!loading && buckets.length === 0 && (
              <Box
                sx={{
                  gridColumn: "1 / -1",
                  p: 6,
                  textAlign: "center",
                  bgcolor: "background.default",
                  border: 1,
                  borderColor: "border.default",
                  borderRadius: 1.5,
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>No storage buckets yet</Typography>
                <Typography sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}>
                  Create a bucket to start uploading project files.
                </Typography>
              </Box>
            )}
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

      <Dialog
        open={createOpen}
        onClose={() => !creating && setCreateOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <Box component="form" onSubmit={handleCreateBucket}>
          <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            Create storage bucket
            <IconButton
              aria-label="Close dialog"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
            >
              <IconX size={18} />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2, fontSize: 12, color: "text.secondary" }}>
              Bucket names use lowercase letters, numbers, and hyphens.
            </Typography>
            {createError && <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>}
            <TextField
              autoFocus
              required
              fullWidth
              size="small"
              label="Bucket name"
              value={bucketName}
              onChange={(event) => setBucketName(event.target.value)}
              slotProps={{
                htmlInput: {
                  maxLength: 63,
                  pattern: "[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={creating || !bucketName.trim()}>
              {creating ? "Creating…" : "Create bucket"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={bucketToDelete !== null}
        onClose={() => !deleting && setBucketToDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete bucket?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            {bucketToDelete?.name} will be permanently removed. Only empty
            buckets can be deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setBucketToDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleDeleteBucket()}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete bucket"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
