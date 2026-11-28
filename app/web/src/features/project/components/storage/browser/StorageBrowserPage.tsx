"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { IconUpload } from "@tabler/icons-react";
import { getErrorMessage } from "@/lib/get-error-message";
import { BrowserHeader } from "./BrowserHeader";
import { BrowserToolbar } from "./BrowserToolbar";
import { FilesTable } from "./FilesTable";
import {
  deleteStorageFile,
  downloadStorageFile,
  fetchStorageBuckets,
  fetchStorageFiles,
  uploadStorageFile,
} from "../api";
import type { Bucket } from "../types";
import { formatBytes } from "../format-bytes";
import type { FileEntry, BrowserViewMode } from "./types";

const MAX_FILE_BYTES = 50 * 1024 * 1024;

export function StorageBrowserPage({
  projectId,
  bucketId,
}: {
  projectId: string;
  bucketId: string;
}) {
  const [bucket, setBucket] = useState<Bucket | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [view, setView] = useState<BrowserViewMode>("list");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [bucketLoading, setBucketLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FileEntry | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    fetchStorageBuckets(projectId)
      .then((buckets) => {
        if (!active) return;
        const found = buckets.find((item) => item.id === bucketId);
        if (!found) {
          setError("Storage bucket not found.");
          setBucket(null);
        } else {
          setBucket(found);
        }
      })
      .catch((failure: unknown) => {
        if (active) setError(getErrorMessage(failure, "Could not load bucket."));
      })
      .finally(() => {
        if (active) setBucketLoading(false);
      });
    return () => {
      active = false;
    };
  }, [bucketId, projectId]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    fetchStorageFiles(projectId, bucketId, { query: debouncedSearch || undefined })
      .then((result) => {
        if (!active) return;
        setEntries(result.items);
        setNextCursor(result.nextCursor);
        setSelectedIds([]);
      })
      .catch((failure: unknown) => {
        if (active) setError(getErrorMessage(failure, "Could not load bucket files."));
      })
      .finally(() => {
        if (active) setFilesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [bucketId, debouncedSearch, projectId, reloadKey]);

  const toggle = (id: string) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id],
    );
  };

  const toggleAll = () => {
    setSelectedIds((previous) =>
      entries.length > 0 && entries.every((entry) => previous.includes(entry.id))
        ? previous.filter((id) => !entries.some((entry) => entry.id === id))
        : [...new Set([...previous, ...entries.map((entry) => entry.id)])],
    );
  };

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    setError("");
    try {
      const result = await fetchStorageFiles(projectId, bucketId, {
        query: debouncedSearch || undefined,
        cursor: nextCursor,
      });
      setEntries((current) => [...current, ...result.items]);
      setNextCursor(result.nextCursor);
    } catch (failure) {
      setError(getErrorMessage(failure, "Could not load more files."));
    } finally {
      setLoadingMore(false);
    }
  };

  const upload = async (selectedFile: File | undefined) => {
    if (!selectedFile) return;
    if (selectedFile.size > MAX_FILE_BYTES) {
      setError("Files cannot exceed 50 MiB.");
      return;
    }
    setUploading(true);
    setError("");
    setNotice("");
    try {
      const uploaded = await uploadStorageFile(projectId, bucketId, selectedFile);
      setBucket((current) =>
        current
          ? {
              ...current,
              fileCount: current.fileCount + 1,
              sizeBytes: (BigInt(current.sizeBytes) + BigInt(uploaded.sizeBytes)).toString(),
            }
          : current,
      );
      setNotice(`${selectedFile.name} uploaded.`);
      setFilesLoading(true);
      setReloadKey((key) => key + 1);
    } catch (failure) {
      setError(getErrorMessage(failure, "File upload failed."));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const download = async (entry: FileEntry) => {
    setError("");
    try {
      const blob = await downloadStorageFile(projectId, bucketId, entry.id);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = entry.name;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (failure) {
      setError(getErrorMessage(failure, "Could not download file."));
    }
  };

  const deleteFile = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");
    setNotice("");
    try {
      await deleteStorageFile(projectId, bucketId, deleteTarget.id);
      setEntries((current) => current.filter((entry) => entry.id !== deleteTarget.id));
      setSelectedIds((current) => current.filter((id) => id !== deleteTarget.id));
      setBucket((current) =>
        current
          ? {
              ...current,
              fileCount: Math.max(0, current.fileCount - 1),
              sizeBytes: (
                BigInt(current.sizeBytes) >= BigInt(deleteTarget.sizeBytes)
                  ? BigInt(current.sizeBytes) - BigInt(deleteTarget.sizeBytes)
                  : BigInt(0)
              ).toString(),
            }
          : current,
      );
      setDeleteTarget(null);
    } catch (failure) {
      setError(getErrorMessage(failure, "Could not delete file."));
    } finally {
      setDeleting(false);
    }
  }, [bucketId, deleteTarget, projectId]);

  return (
    <Stack spacing={{ xs: 3, md: 4 }} useFlexGap sx={{ minWidth: 0 }}>
      {bucket && (
        <BrowserHeader
          projectId={projectId}
          bucket={bucket}
          onUploadFile={() => fileInput.current?.click()}
        />
      )}
      <Alert severity="info">
        Files are private and accessible only to project owners through the
        authenticated dashboard. Public URLs, CDN configuration, and folders
        are not enabled.
      </Alert>
      {error && <Alert severity="error">{error}</Alert>}
      {notice && <Alert severity="success">{notice}</Alert>}
      <BrowserToolbar
        bucketName={bucket?.name ?? "bucket"}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setFilesLoading(true);
          setError("");
        }}
        view={view}
        onViewChange={setView}
      />
      {view === "list" ? (
        <FilesTable
          entries={entries}
          selectedIds={selectedIds.filter((id) => entries.some((entry) => entry.id === id))}
          onToggle={toggle}
          onToggleAll={toggleAll}
          onDownload={(entry) => void download(entry)}
          onDelete={setDeleteTarget}
        />
      ) : (
        <Box
          component="ul"
          aria-label="Files in bucket"
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
            m: 0,
            p: 0,
            listStyle: "none",
          }}
        >
          {entries.map((entry) => (
            <Box
              component="li"
              key={entry.id}
              sx={{
                minWidth: 0,
                p: 3,
                bgcolor: "background.default",
                border: 1,
                borderColor: "border.default",
                borderRadius: 1.5,
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 600, overflowWrap: "anywhere" }}>
                {entry.name}
              </Typography>
              <Typography sx={{ mt: 1, fontSize: 11, color: "text.secondary" }}>
                {entry.type} · {formatBytes(entry.sizeBytes)}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button size="small" onClick={() => void download(entry)}>Download</Button>
                <Button size="small" color="error" onClick={() => setDeleteTarget(entry)}>Delete</Button>
              </Stack>
            </Box>
          ))}
          {!filesLoading && entries.length === 0 && (
            <Typography sx={{ gridColumn: "1 / -1", p: 4, textAlign: "center", color: "text.secondary" }}>
              No files {debouncedSearch ? "match your search" : "in this bucket yet"}.
            </Typography>
          )}
        </Box>
      )}
      {(filesLoading || bucketLoading) && (
        <Typography role="status" sx={{ fontSize: 12, color: "text.secondary" }}>
          Loading storage…
        </Typography>
      )}
      {nextCursor && (
        <Button
          variant="outlined"
          onClick={() => void loadMore()}
          disabled={loadingMore || filesLoading}
          sx={{ alignSelf: "center", textTransform: "none" }}
        >
          {loadingMore ? "Loading…" : "Load more files"}
        </Button>
      )}

      <input
        ref={fileInput}
        type="file"
        hidden
        onChange={(event) => void upload(event.target.files?.[0])}
        aria-label="Choose file to upload"
      />
      <ButtonBase
        disabled={uploading || bucketLoading || !bucket}
        onClick={() => fileInput.current?.click()}
        aria-label="Choose file to upload"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
          p: { xs: 4, sm: 6 },
          border: "1px dashed",
          borderColor: "border.strong",
          borderRadius: 1.5,
        }}
      >
        <IconUpload size={28} color="currentColor" />
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
            {uploading ? "Uploading file…" : "Choose a file to upload"}
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 11, color: "text.secondary" }}>
            Maximum file size: 50 MiB. Files are stored privately.
          </Typography>
        </Box>
      </ButtonBase>

      <Dialog
        open={deleteTarget !== null}
        onClose={() => !deleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete file?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: "text.secondary", overflowWrap: "anywhere" }}>
            {deleteTarget?.name} will be permanently deleted from this bucket.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button onClick={() => void deleteFile()} color="error" variant="contained" disabled={deleting}>
            {deleting ? "Deleting…" : "Delete file"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
