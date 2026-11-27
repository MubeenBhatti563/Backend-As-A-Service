import type { Bucket } from "../types";

export type BrowserViewMode = "list" | "grid";
export type FileEntryKind = "folder" | "file";

export interface FileEntry {
  id: string;
  name: string;
  kind: FileEntryKind;
  type: string;
  size?: string;
  uploaded?: string;
  owner: string;
}

export interface BucketBrowserData {
  bucket: Bucket;
  entries: FileEntry[];
}
