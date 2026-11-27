"use client";

import { useMemo, useState } from "react";
import { Alert, Box, ButtonBase, Stack, Typography } from "@mui/material";
import { IconUpload } from "@tabler/icons-react";
import { BrowserHeader } from "./BrowserHeader";
import { BrowserToolbar } from "./BrowserToolbar";
import { FilesTable } from "./FilesTable";
import type { BucketBrowserData, BrowserViewMode } from "./types";

export function StorageBrowserPage({
  projectId,
  data,
}: {
  projectId: string;
  data: BucketBrowserData;
}) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<BrowserViewMode>("list");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const entries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.entries.filter(
      (entry) =>
        !query ||
        entry.name.toLowerCase().includes(query) ||
        entry.type.toLowerCase().includes(query) ||
        entry.owner.toLowerCase().includes(query),
    );
  }, [data.entries, search]);

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

  return (
    <Stack spacing={{ xs: 3, md: 4 }} useFlexGap sx={{ minWidth: 0 }}>
      <BrowserHeader projectId={projectId} bucket={data.bucket} />
      <Alert severity="info">
        Preview only. Bucket totals and file rows are examples, not stored
        project files. Upload, download, URL, and delete actions are unavailable.
      </Alert>
      <BrowserToolbar
        bucketName={data.bucket.name}
        search={search}
        onSearchChange={setSearch}
        view={view}
        onViewChange={setView}
      />
      {view === "list" ? (
        <FilesTable
          entries={entries}
          selectedIds={selectedIds.filter((id) => entries.some((entry) => entry.id === id))}
          onToggle={toggle}
          onToggleAll={toggleAll}
        />
      ) : (
        <Box
          component="ul"
          aria-label="Sample files in grid view"
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
                {entry.type} · {entry.size ?? "Folder"}
              </Typography>
            </Box>
          ))}
          {entries.length === 0 && (
            <Typography sx={{ gridColumn: "1 / -1", p: 4, textAlign: "center", color: "text.secondary" }}>
              No sample files match your search.
            </Typography>
          )}
        </Box>
      )}
      <ButtonBase
        disabled
        aria-label="File upload unavailable in preview"
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
            File uploads are not available yet
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 11, color: "text.secondary" }}>
            This sample browser does not transfer or store files.
          </Typography>
        </Box>
      </ButtonBase>
    </Stack>
  );
}
