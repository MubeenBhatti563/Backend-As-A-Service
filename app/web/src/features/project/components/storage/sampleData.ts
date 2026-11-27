import type { Bucket, StorageStat } from "./types";

export const SAMPLE_STORAGE_STATS: StorageStat[] = [
  { id: "used", label: "Sample storage used", value: "856 MB", indicator: "Sample" },
  { id: "buckets", label: "Sample buckets", value: "4" },
  { id: "files", label: "Sample files", value: "2,384" },
];

export const SAMPLE_BUCKETS: Bucket[] = [
  { id: "avatars", name: "avatars", access: "Public", fileCount: 1204, size: "450 MB", createdAt: "Oct 24, 2025" },
  { id: "documents", name: "documents", access: "Private", fileCount: 42, size: "206 MB", createdAt: "Oct 25, 2025" },
  { id: "uploads", name: "uploads", access: "Private", fileCount: 1123, size: "185 MB", createdAt: "Oct 25, 2025" },
  { id: "public-assets", name: "public-assets", access: "Public", fileCount: 15, size: "15 MB", createdAt: "Oct 26, 2025" },
];
