"use client";
import { Box } from "@mui/material";
import { BELOW_1100, MOBILE } from "./styles";
import type { ProjectOverviewData } from "./types";
import { ChartsRow } from "./components/ChartsRow";
import { OverviewHeader } from "./components/OverviewHeader";
import { ProjectInfoCard, ProjectInfoCompact } from "./components/ProjectInfoCard";
import { QuickStartCard } from "./components/QuickStartCard";
import { RecentActivityCard } from "./components/RecentActivityCard";
import { StatsRow } from "./components/StatsRow";
import { SystemHealthCard } from "./components/SystemHealthCard";
import { useProjectOverview } from "@/features/projects/hooks/use-project";
import { useAuthStore } from "@/stores";

export function ProjectOverviewPage({
  data: initialData,
  projectId: propProjectId,
}: {
  data: ProjectOverviewData;
  projectId?: string;
}) {
  const currentProjectId = propProjectId ?? initialData.project.id;
  const { data: dynamicData } = useProjectOverview(
    currentProjectId,
    initialData,
  );
  const data = dynamicData ?? initialData;

  const { user: authUser } = useAuthStore();
  const { project, stats, charts, activity, health } = data;
  const _email = authUser?.email ?? data.user.email; // available if needed later

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        [MOBILE]: { gap: 4 },
      }}
    >
      <OverviewHeader />
      <ProjectInfoCard project={project} />
      <ProjectInfoCompact project={project} />
      <StatsRow stats={stats} />
      <ChartsRow charts={charts} />
      <Box
        sx={{
          display: "grid",
          alignItems: "start",
          gap: 5,
          gridTemplateColumns: "minmax(0, 696fr) minmax(0, 420fr)",
          [BELOW_1100]: { gridTemplateColumns: "minmax(0, 1fr)" },
          [MOBILE]: { gap: 4 },
        }}
      >
        <RecentActivityCard events={activity} />
        <SystemHealthCard services={health} />
      </Box>
      <QuickStartCard projectId={project.id} />
    </Box>
  );
}
