import type { Bucket } from "../types";

export type BrowserViewMode = "list" | "grid";
export type FileEntryKind = "folder" | "file";

export interface FileEntry {
  id: string;
  name: string;
  kind: FileEntryKind;
  type: string;
  sizeBytes: string;
  uploadedAt: string;
  owner: string;
}

export interface BucketBrowserData {
  bucket: Bucket;
  entries: FileEntry[];
}
