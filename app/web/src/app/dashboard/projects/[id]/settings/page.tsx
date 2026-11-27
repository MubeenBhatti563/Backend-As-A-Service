import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECT_SETTINGS_SECTIONS, SettingsSectionPlaceholder } from "@/features/settings";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Project Settings" };

export default async function ProjectSettingsPage({ params }: PageProps) {
  const { id } = await params;
  if (!id) notFound();

  return <SettingsSectionPlaceholder title={PROJECT_SETTINGS_SECTIONS[0].label} />;
}
