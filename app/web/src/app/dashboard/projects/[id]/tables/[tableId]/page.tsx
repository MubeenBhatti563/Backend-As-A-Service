import { redirect } from "next/navigation";

export default async function TableDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string; tableId: string }>;
}) {
  const { id, tableId } = await params;
  redirect(`/dashboard/projects/${id}/database/tables/${tableId}`);
}
