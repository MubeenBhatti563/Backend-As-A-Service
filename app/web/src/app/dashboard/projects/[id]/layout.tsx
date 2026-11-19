import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getProjectOverview } from "@/features/project/mock-data";
import { ProjectLayoutShell } from "@/features/project/components/ProjectLayoutShell";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ProjectLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const data = await getProjectOverview(id);
  if (!data) notFound();

  return (
    <ProjectLayoutShell
      projectId={id}
      projects={data.projects}
      email={data.user.email}
    >
      {children}
    </ProjectLayoutShell>
  );
}
