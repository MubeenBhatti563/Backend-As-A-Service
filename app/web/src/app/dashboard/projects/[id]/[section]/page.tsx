import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PROJECT_COMING_SOON_SECTIONS,
} from "@/features/project/constants";
import { ProjectComingSoonPage } from "@/features/project";

interface PageProps {
  params: Promise<{ id: string; section: string }>;
}

export const metadata: Metadata = { title: "Project Feature" };

export default async function ProjectSectionPage({ params }: PageProps) {
  const { id, section: slug } = await params;
  const section = PROJECT_COMING_SOON_SECTIONS.find(
    (item) => item.slug === slug,
  );
  if (!section) notFound();

  return (
    <ProjectComingSoonPage
      projectId={id}
      title={section.title}
      description={section.description}
      highlights={section.highlights}
    />
  );
}
