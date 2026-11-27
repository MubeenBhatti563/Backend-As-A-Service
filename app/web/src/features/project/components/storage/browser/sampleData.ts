import { SAMPLE_BUCKETS } from "../sampleData";
import type { BucketBrowserData, FileEntry } from "./types";

const SAMPLE_FILES: Record<string, FileEntry[]> = {
  avatars: [
    { id: "avatar-folder", name: "thumbnails", kind: "folder", type: "Folder", owner: "Sample system" },
    { id: "avatar-1", name: "profile-1.jpg", kind: "file", type: "image/jpeg", size: "245 KB", uploaded: "2 minutes ago", owner: "sample-user-01" },
    { id: "avatar-2", name: "profile-2.png", kind: "file", type: "image/png", size: "1.2 MB", uploaded: "15 minutes ago", owner: "sample-user-02" },
    { id: "avatar-3", name: "default-avatar.svg", kind: "file", type: "image/svg+xml", size: "12 KB", uploaded: "1 hour ago", owner: "Sample system" },
  ],
  documents: [
    { id: "doc-folder", name: "invoices", kind: "folder", type: "Folder", owner: "Sample system" },
    { id: "doc-1", name: "welcome-guide.pdf", kind: "file", type: "application/pdf", size: "840 KB", uploaded: "Yesterday", owner: "sample-user-03" },
    { id: "doc-2", name: "terms-of-service.pdf", kind: "file", type: "application/pdf", size: "1.4 MB", uploaded: "3 days ago", owner: "Sample system" },
  ],
  uploads: [
    { id: "upload-folder", name: "2026", kind: "folder", type: "Folder", owner: "Sample system" },
    { id: "upload-1", name: "campaign-banner.png", kind: "file", type: "image/png", size: "2.1 MB", uploaded: "20 minutes ago", owner: "sample-user-04" },
    { id: "upload-2", name: "product-demo.mp4", kind: "file", type: "video/mp4", size: "18.6 MB", uploaded: "2 hours ago", owner: "sample-user-05" },
  ],
  "public-assets": [
    { id: "asset-folder", name: "icons", kind: "folder", type: "Folder", owner: "Sample system" },
    { id: "asset-1", name: "brand-mark.svg", kind: "file", type: "image/svg+xml", size: "8 KB", uploaded: "4 days ago", owner: "Sample system" },
    { id: "asset-2", name: "site-background.webp", kind: "file", type: "image/webp", size: "640 KB", uploaded: "1 week ago", owner: "sample-user-06" },
  ],
};

export function getSampleBucketBrowserData(bucketId: string): BucketBrowserData | undefined {
  const bucket = SAMPLE_BUCKETS.find((item) => item.id === bucketId);
  const entries = SAMPLE_FILES[bucketId];
  if (!bucket || !entries) return undefined;
  return { bucket, entries };
}
