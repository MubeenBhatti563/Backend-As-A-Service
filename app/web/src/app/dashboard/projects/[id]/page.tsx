import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectOverview } from "@/features/project/api.server";
import { ProjectOverviewPage } from "@/features/project/ProjectOverviewPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Overview" };

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const data = await getProjectOverview(id);
  if (!data) notFound();
  return <ProjectOverviewPage data={data} projectId={id} />;
}
