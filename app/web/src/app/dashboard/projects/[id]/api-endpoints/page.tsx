import type { Metadata } from "next";
import { ApiEndpointsPage } from "@/features/project/components/api-endpoints/ApiEndpointsPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "API Endpoints" };

export default async function ProjectApiEndpointsRoute({ params }: PageProps) {
  await params;
  return <ApiEndpointsPage />;
}
