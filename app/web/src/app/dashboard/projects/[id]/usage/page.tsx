import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectUsage } from "@/features/project/api.server";
import { ProjectUsagePage } from "@/features/project";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Project Usage" };

export default async function ProjectUsageRoute({ params }: PageProps) {
  const { id } = await params;
  const usage = await getProjectUsage(id);
  if (!usage) notFound();

  return <ProjectUsagePage data={usage} />;
}
