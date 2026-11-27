import type { Metadata } from "next";
import { StoragePage } from "@/features/project/components/storage/StoragePage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Project Storage" };

export default async function ProjectStorageRoute({ params }: PageProps) {
  const { id } = await params;
  return <StoragePage projectId={id} />;
}
