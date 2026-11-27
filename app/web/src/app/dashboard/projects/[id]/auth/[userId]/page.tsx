import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserDetailPage } from "@/features/project/components/auth/UserDetailPage";
import { findSampleUser } from "@/features/project/components/auth/mockData";

interface PageProps {
  params: Promise<{ id: string; userId: string }>;
}

export const metadata: Metadata = { title: "Authentication User Preview" };

export default async function ProjectAuthenticationUserRoute({ params }: PageProps) {
  const { id, userId } = await params;
  const user = findSampleUser(userId);
  if (!user) notFound();

  return <UserDetailPage projectId={id} user={user} />;
}
