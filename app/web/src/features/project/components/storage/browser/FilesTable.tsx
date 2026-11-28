import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { IconFile, IconFolder, IconTrash } from "@tabler/icons-react";
import type { FileEntry } from "./types";
import { formatBytes } from "../format-bytes";

export function FilesTable({
  entries,
  selectedIds,
  onToggle,
  onToggleAll,
  onDownload,
  onDelete,
}: {
  entries: FileEntry[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onDownload: (entry: FileEntry) => void;
  onDelete: (entry: FileEntry) => void;
}) {
  const allSelected = entries.length > 0 && selectedIds.length === entries.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  return (
    <Box
      sx={{
        overflowX: "auto",
        bgcolor: "background.default",
        border: 1,
        borderColor: "border.default",
        borderRadius: 1.5,
      }}
    >
      <Table
        aria-label="Files in bucket"
        size="small"
        sx={{
          minWidth: 760,
          "& .MuiTableCell-root": { px: 2, py: 2, borderColor: "border.default" },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={onToggleAll}
                slotProps={{ input: { "aria-label": "Select all files" } }}
              />
            </TableCell>
            {["Name", "Type", "Size", "Uploaded", "Owner", "Actions"].map((heading) => (
              <TableCell
                key={heading}
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "text.disabled",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {heading}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry) => {
            const Icon = entry.kind === "folder" ? IconFolder : IconFile;
            return (
              <TableRow key={entry.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={selectedIds.includes(entry.id)}
                    onChange={() => onToggle(entry.id)}
                    slotProps={{ input: { "aria-label": `Select ${entry.name}` } }}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Icon size={16} color={entry.kind === "folder" ? "#A855F7" : undefined} />
                    <Typography sx={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                      {entry.name}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontSize: 11, color: "text.secondary" }}>{entry.type}</TableCell>
                <TableCell sx={{ fontSize: 11, color: "text.secondary" }}>{formatBytes(entry.sizeBytes)}</TableCell>
                <TableCell sx={{ fontSize: 11, color: "text.secondary", whiteSpace: "nowrap" }}>
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(entry.uploadedAt))}
                </TableCell>
                <TableCell sx={{ fontSize: 11, color: "text.secondary", whiteSpace: "nowrap" }}>
                  {entry.owner}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                    <Button onClick={() => onDownload(entry)} size="small" variant="outlined" sx={{ fontSize: 10, textTransform: "none" }}>
                      Download
                    </Button>
                    <Button disabled size="small" variant="outlined" sx={{ fontSize: 10, textTransform: "none" }}>
                      Copy URL
                    </Button>
                    <IconButton
                      size="small"
                      aria-label={`Delete ${entry.name}`}
                      onClick={() => onDelete(entry)}
                    >
                      <IconTrash size={15} />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
          {entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography sx={{ py: 3, textAlign: "center", fontSize: 12, color: "text.secondary" }}>
                  No files match your search.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
