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
import { AccountShell } from "@/components/sections/projects/AccountShell";
import { PageHeader } from "@/components/sections/projects/PageHeader";
import { STACK_BELOW_1100 } from "@/components/ui/projectStyle";
import { ProjectsSection } from "@/components/sections/projects/ProjectsSection";
import { RecentActivity } from "@/components/sections/projects/RecentActivity";
import { QuickstartHint } from "@/components/sections/projects/QuickstartHint";
import { UsagePanel } from "@/components/sections/projects/UsagePanel";
import { PlanCard } from "@/components/sections/projects/PlanCard";
import { useAuthStore } from "@/stores";

interface AccountOverviewPageProps {
  userMock?: AccountUser;
  projects?: Project[];
  usage?: UsageMetric[];
  activity?: ActivityEvent[];
  usageResetNote?: string;
}

/** "Account – Projects overview". Pass real data as props; defaults are the Figma sample data. */
function AccountOverviewPage({
  userMock = MOCK_USER,
  projects = MOCK_PROJECTS,
  usage = MOCK_USAGE,
  activity = MOCK_ACTIVITY,
  usageResetNote = "API quota resets Dec 1, 2026 (UTC)",
}: AccountOverviewPageProps) {
  const { user } = useAuthStore();

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
