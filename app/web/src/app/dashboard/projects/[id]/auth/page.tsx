import type { Metadata } from "next";
import { AuthenticationPage } from "@/features/project/components/auth/AuthenticationPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Authentication" };

export default async function ProjectAuthenticationRoute({ params }: PageProps) {
  const { id } = await params;
  return <AuthenticationPage projectId={id} />;
}
