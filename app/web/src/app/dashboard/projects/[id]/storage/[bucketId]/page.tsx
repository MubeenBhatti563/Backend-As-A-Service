import type { Metadata } from "next";
import { StorageBrowserPage } from "@/features/project/components/storage/browser/StorageBrowserPage";

interface PageProps {
  params: Promise<{ id: string; bucketId: string }>;
}

export const metadata: Metadata = { title: "Storage Bucket Preview" };

export default async function ProjectStorageBucketRoute({ params }: PageProps) {
  const { id, bucketId } = await params;
  return <StorageBrowserPage projectId={id} bucketId={bucketId} />;
}
