import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorageBrowserPage } from "@/features/project/components/storage/browser/StorageBrowserPage";
import { getSampleBucketBrowserData } from "@/features/project/components/storage/browser/sampleData";

interface PageProps {
  params: Promise<{ id: string; bucketId: string }>;
}

export const metadata: Metadata = { title: "Storage Bucket Preview" };

export default async function ProjectStorageBucketRoute({ params }: PageProps) {
  const { id, bucketId } = await params;
  const data = getSampleBucketBrowserData(bucketId);
  if (!data) notFound();

  return <StorageBrowserPage projectId={id} data={data} />;
}
