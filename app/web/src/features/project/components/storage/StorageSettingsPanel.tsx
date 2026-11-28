"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  fetchStorageSettings,
  updateStorageBucketAccess,
  updateStorageSettings,
} from "./api";
import type { Bucket } from "./types";

export function StorageSettingsPanel({
  projectId,
  buckets,
  bucketsLoading,
  onBucketAccessChanged,
}: {
  projectId: string;
  buckets: Bucket[];
  bucketsLoading: boolean;
  onBucketAccessChanged: (
    bucketId: string,
    access: Bucket["access"],
  ) => void;
}) {
  const [cdnBaseUrl, setCdnBaseUrl] = useState("");
  const [cacheTtlSeconds, setCacheTtlSeconds] = useState("3600");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingBucketId, setUpdatingBucketId] = useState<string | null>(null);
  const [bucketToPublish, setBucketToPublish] = useState<Bucket | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    fetchStorageSettings(projectId)
      .then((result) => {
        if (!active) return;
        setCdnBaseUrl(result.cdnBaseUrl ?? "");
        setCacheTtlSeconds(String(result.cacheTtlSeconds));
      })
      .catch((failure: unknown) => {
        if (active) {
          setError(getErrorMessage(failure, "Could not load Storage settings."));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ttl = Number(cacheTtlSeconds);
    if (!Number.isInteger(ttl) || ttl < 0 || ttl > 86_400) {
      setError("Cache TTL must be a whole number between 0 and 86400 seconds.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    try {
      const updated = await updateStorageSettings(projectId, {
        cdnBaseUrl: cdnBaseUrl.trim() || null,
        cacheTtlSeconds: ttl,
      });
      setCdnBaseUrl(updated.cdnBaseUrl ?? "");
      setCacheTtlSeconds(String(updated.cacheTtlSeconds));
      setNotice("Storage settings saved.");
    } catch (failure) {
      setError(getErrorMessage(failure, "Could not save Storage settings."));
    } finally {
      setSaving(false);
    }
  };

  const setBucketAccess = async (
    bucket: Bucket,
    access: Bucket["access"],
  ) => {
    setUpdatingBucketId(bucket.id);
    setError("");
    setNotice("");
    try {
      const updated = await updateStorageBucketAccess(
        projectId,
        bucket.id,
        access,
      );
      onBucketAccessChanged(bucket.id, updated.access);
      setNotice(
        `${bucket.name} is now ${updated.access.toLowerCase()} for reads.`,
      );
      setBucketToPublish(null);
    } catch (failure) {
      setError(getErrorMessage(failure, "Could not update bucket access."));
    } finally {
      setUpdatingBucketId(null);
    }
  };

  return (
    <Stack spacing={3} useFlexGap sx={{ minWidth: 0 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {notice && <Alert severity="success">{notice}</Alert>}

      <Box
        component="form"
        onSubmit={saveSettings}
        sx={{
          p: { xs: 3, sm: 4 },
          bgcolor: "background.default",
          border: 1,
          borderColor: "border.default",
          borderRadius: 1.5,
        }}
      >
        <Typography component="h2" sx={{ fontSize: 16, fontWeight: 600 }}>
          CDN settings
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}>
          Connect a CDN you manage. This app does not provision CDN
          distributions, DNS, or certificates.
        </Typography>

        <Stack spacing={2.5} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            size="small"
            type="url"
            label="CDN base URL"
            placeholder="https://cdn.example.com"
            value={cdnBaseUrl}
            onChange={(event) => setCdnBaseUrl(event.target.value)}
            helperText="Use an HTTPS origin only, without a path. Leave blank to use the API URL directly."
            disabled={loading || saving}
          />
          <TextField
            fullWidth
            size="small"
            type="number"
            label="CDN cache TTL (seconds)"
            value={cacheTtlSeconds}
            onChange={(event) => setCacheTtlSeconds(event.target.value)}
            slotProps={{ htmlInput: { min: 0, max: 86400, step: 1 } }}
            helperText="Shared-cache lifetime for public files. Maximum: 86400 seconds."
            disabled={loading || saving}
          />
          <Alert severity="info">
            Configure your CDN origin to forward{" "}
            <Box component="code" sx={{ fontSize: "inherit" }}>
              /api/v1/storage/public/*
            </Box>{" "}
            to this API. Public file URLs use that path.
          </Alert>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || saving}
            sx={{ alignSelf: "flex-start", textTransform: "none" }}
          >
            {saving ? "Saving…" : "Save CDN settings"}
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          bgcolor: "background.default",
          border: 1,
          borderColor: "border.default",
          borderRadius: 1.5,
        }}
      >
        <Typography component="h2" sx={{ fontSize: 16, fontWeight: 600 }}>
          Bucket access
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}>
          Buckets are private by default. Public buckets allow anyone with a
          file URL to read their files; uploads and deletes still require
          authentication.
        </Typography>
        {bucketsLoading ? (
          <Typography role="status" sx={{ mt: 2, fontSize: 12, color: "text.secondary" }}>
            Loading buckets…
          </Typography>
        ) : buckets.length > 0 ? (
          <Stack spacing={1} sx={{ mt: 2 }}>
            {buckets.map((bucket) => (
              <Stack
                key={bucket.id}
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                  p: 2,
                  border: 1,
                  borderColor: "border.default",
                  borderRadius: 1,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                    {bucket.name}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                    {bucket.access === "Public"
                      ? "Anyone can read files in this bucket."
                      : "Only authenticated project owners can read files."}
                  </Typography>
                </Box>
                <FormControlLabel
                  label="Public read"
                  labelPlacement="start"
                  control={
                    <Switch
                      checked={bucket.access === "Public"}
                      disabled={updatingBucketId === bucket.id || loading}
                      onChange={(_, checked) =>
                        checked
                          ? setBucketToPublish(bucket)
                          : void setBucketAccess(bucket, "Private")
                      }
                      slotProps={{
                        input: {
                          "aria-label": `Public read access for ${bucket.name}`,
                        },
                      }}
                    />
                  }
                  sx={{ m: 0, gap: 1, fontSize: 12 }}
                />
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography sx={{ mt: 2, fontSize: 12, color: "text.secondary" }}>
            Create a bucket before configuring its access.
          </Typography>
        )}
        <Alert severity="warning" sx={{ mt: 2 }}>
          When a public bucket is made private, a CDN may continue serving
          already-cached files until the configured TTL expires.
        </Alert>
      </Box>

      <Dialog
        open={bucketToPublish !== null}
        onClose={() => !updatingBucketId && setBucketToPublish(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Enable public reads?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Anyone with a file URL will be able to read files in{" "}
            <strong>{bucketToPublish?.name}</strong>. Upload and delete
            operations will still require authentication.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setBucketToPublish(null)}
            disabled={updatingBucketId !== null}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() =>
              bucketToPublish &&
              void setBucketAccess(bucketToPublish, "Public")
            }
            disabled={updatingBucketId !== null}
          >
            Enable public read
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
