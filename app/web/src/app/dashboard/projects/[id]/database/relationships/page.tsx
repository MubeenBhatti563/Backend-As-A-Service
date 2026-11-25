import { Stack } from "@mui/material";
import { getRelationshipsData } from "@/features/database/relationships-mock-data";
import { DatabaseTabs } from "@/features/database/components/DatabaseTabs";
import { RelationshipsView } from "@/features/database/components/RelationshipsView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RelationshipsPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getRelationshipsData(id);

  return (
    // p: 8 = 32px (Figma content-wrapper). Remove if ProjectLayoutShell already pads <main>.
    <Stack spacing={6} useFlexGap sx={{ p: 8 }}>
      <DatabaseTabs projectId={id} value="relationships" dense />
      <RelationshipsView data={data} />
    </Stack>
  );
}
