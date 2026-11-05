"use client";
import { Box } from "@mui/material";
import {
  MOCK_ACTIVITY,
  MOCK_PROJECTS,
  MOCK_USAGE,
  MOCK_USER,
} from "./mock-data";
import {
  AccountUser,
  ActivityEvent,
  Project,
  UsageMetric,
} from "@/types/projectPage";
import { AccountShell } from "@/features/projects/components/projects/AccountShell";
import { PageHeader } from "@/features/projects/components/projects/PageHeader";
import { STACK_BELOW_1100 } from "@/features/projects/components/projectStyle";
import { ProjectsSection } from "@/features/projects/components/projects/ProjectsSection";
import { RecentActivity } from "@/features/projects/components/projects/RecentActivity";
import { QuickstartHint } from "@/features/projects/components/projects/QuickstartHint";
import { UsagePanel } from "@/features/projects/components/projects/UsagePanel";
import { PlanCard } from "@/features/projects/components/projects/PlanCard";
import { useAuthStore } from "@/stores";
import Loading from "@/app/loading";

interface AccountOverviewPageProps {
  userMock?: AccountUser;
  projects?: Project[];
  usage?: UsageMetric[];
  activity?: ActivityEvent[];
  usageResetNote?: string;
}

function AccountOverviewPage({
  userMock = MOCK_USER,
  projects = MOCK_PROJECTS,
  usage = MOCK_USAGE,
  activity = MOCK_ACTIVITY,
  usageResetNote = "API quota resets Dec 1, 2026 (UTC)",
}: AccountOverviewPageProps) {
  const { user } = useAuthStore();

  if (!user) {
    return <Loading />;
  }

  return (
    <AccountShell user={user!} projectCount={projects.length}>
      <PageHeader name={user?.fullName || "Admin"} />

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 6,
          [STACK_BELOW_1100]: {
            flexDirection: "column",
            alignItems: "stretch",
          },
        }}
      >
        {/* projects + activity */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minWidth: 0,
            gap: 6,
          }}
        >
          <ProjectsSection projects={projects} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <RecentActivity events={activity} />
            <QuickstartHint />
          </Box>
        </Box>

        {/* usage + plan */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: "none",
            width: 348,
            gap: 5,
            [STACK_BELOW_1100]: { width: "100%" },
          }}
        >
          <UsagePanel
            metrics={usage}
            projectCount={projects.length}
            resetNote={usageResetNote}
          />
          <PlanCard plan={userMock.plan} tier={userMock.tier} />
        </Box>
      </Box>
    </AccountShell>
  );
}

export default AccountOverviewPage;
