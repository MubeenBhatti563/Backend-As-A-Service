import { Box } from "@mui/material";
import { BELOW_1100, MOBILE } from "./styles";
import type { ProjectOverviewData } from "./types";
import { ChartsRow } from "./components/ChartsRow";
import { OverviewHeader } from "./components/OverviewHeader";
import { ProjectInfoCard, ProjectInfoCompact } from "./components/ProjectInfoCard";
import { ProjectShell } from "./components/ProjectShell";
import { QuickStartCard } from "./components/QuickStartCard";
import { RecentActivityCard } from "./components/RecentActivityCard";
import { StatsRow } from "./components/StatsRow";
import { SystemHealthCard } from "./components/SystemHealthCard";

export function ProjectOverviewPage({ data }: { data: ProjectOverviewData }) {
  const { project, projects, user, stats, charts, activity, health } = data;

  return (
    <ProjectShell projectId={project.id} projects={projects} email={user.email} activeKey="overview">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 6, [MOBILE]: { gap: 4 } }}>
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
    </ProjectShell>
  );
}
