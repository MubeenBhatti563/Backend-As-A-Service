import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PROJECT_SETTINGS_SECTIONS,
  SettingsSectionPlaceholder,
} from "@/features/settings";

interface PageProps {
  params: Promise<{ id: string; section: string }>;
}

export const metadata: Metadata = { title: "Project Settings" };

export default async function ProjectSettingsSectionPage({
  params,
}: PageProps) {
  const { id, section: slug } = await params;
  const section = PROJECT_SETTINGS_SECTIONS.find((item) => item.slug === slug);

  if (!id || !section || section.slug === "danger-zone") notFound();

  return <SettingsSectionPlaceholder title={section.label} />;
}
