"use client";
import { Box, Skeleton, Typography, Alert, Button } from "@mui/material";
import { MOCK_ACTIVITY, MOCK_USAGE, MOCK_USER } from "./mock-data";
import {
  AccountUser,
  ActivityEvent,
  Project,
  UsageMetric,
} from "@/types/projectPage";
import { MyPlanResponse, ProjectData } from "@baas/types";
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
import { useAllProjects } from "@/features/projects/hooks/use-project";
import { useMyPlan } from "@/features/projects/hooks/use-plan";
import { panelSx } from "@/features/projects/components/projectStyle";
import { IconRefresh } from "@tabler/icons-react";

/** Map API ProjectData → page-local Project shape */
function toProject(p: ProjectData): Project {
  const statusMap: Record<ProjectData["status"], Project["status"]> = {
    ACTIVE: "active",
    PAUSED: "paused",
    PENDING: "paused",
  };

  const updatedAt =
    p.updatedAt instanceof Date
      ? p.updatedAt.toISOString()
      : String(p.updatedAt);

  const updatedDate = new Date(updatedAt);
  const diffMs = Date.now() - updatedDate.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  let lastActivity: string;
  if (diffMins < 1) lastActivity = "Updated just now";
  else if (diffMins < 60) lastActivity = `Updated ${diffMins} min ago`;
  else if (diffMins < 1440)
    lastActivity = `Updated ${Math.floor(diffMins / 60)} hours ago`;
  else
    lastActivity = `Updated ${updatedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return {
    id: p.id,
    name: p.name,
    identifier: p.schemaName,
    description: p.description ?? "",
    region: p.deploymentRegion,
    status: statusMap[p.status] ?? "paused",
    dbSize: "—",
    fileSize: "—",
    lastActivity,
    updatedAt,
  };
}

/** Map API MyPlanResponse usage + plan limits → UsageMetric[] */
function toUsageMetrics(
  myPlan: MyPlanResponse | undefined,
  fallback: UsageMetric[],
): UsageMetric[] {
  if (!myPlan) return fallback;
  const { usage, plan } = myPlan;
  const toGB = (bytes: string) =>
    Number((Number(bytes) / 1_000_000_000).toFixed(2));
  const toLimitGB = (bytes: string | null) =>
    bytes ? Number((Number(bytes) / 1_000_000_000).toFixed(2)) : null;

  return [
    {
      key: "db",
      label: "Database storage",
      icon: "database",
      used: toGB(usage.dbBytes),
      limit: toLimitGB(plan.dbStorageBytes) ?? 0,
      unit: "GB",
    },
    {
      key: "files",
      label: "File storage",
      icon: "files",
      used: toGB(usage.fileBytes),
      limit: toLimitGB(plan.fileStorageBytes) ?? 0,
      unit: "GB",
    },
    {
      key: "api",
      label: "API requests",
      icon: "api",
      used: Number(usage.apiRequests),
      limit: plan.apiRequestsMonthly ? Number(plan.apiRequestsMonthly) : 0,
      basis: "Monthly",
    },
    {
      key: "realtime",
      label: "Realtime connections",
      icon: "realtime",
      used: usage.peakRealtimeConns,
      limit: plan.maxRealtimeConnections ?? 0,
      basis: "Concurrent · current connections",
    },
  ];
}

function ProjectsSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Skeleton variant="text" width={120} height={28} />
        <Skeleton variant="rounded" width={28} height={20} />
      </Box>
      <Box
        sx={{
          display: "grid",
          gap: 4,
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          [STACK_BELOW_1100]: { gridTemplateColumns: "minmax(0, 1fr)" },
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={180}
            sx={{ borderRadius: 2 }}
          />
        ))}
      </Box>
    </Box>
  );
}

interface AccountOverviewPageProps {
  userMock?: AccountUser;
  usage?: UsageMetric[];
  activity?: ActivityEvent[];
  usageResetNote?: string;
}

function AccountOverviewPage({
  userMock = MOCK_USER,
  usage = MOCK_USAGE,
  activity = MOCK_ACTIVITY,
  usageResetNote = "API quota resets Dec 1, 2026 (UTC)",
}: AccountOverviewPageProps) {
  const { user } = useAuthStore();
  const { data: rawProjects, isLoading, isError, refetch } = useAllProjects();
  const { data: myPlan } = useMyPlan();

  if (!user) {
    return <Loading />;
  }

  const projects: Project[] = (rawProjects ?? []).map(toProject);

  const planName = myPlan?.plan.name ?? userMock.plan;
  const planTier =
    myPlan?.plan.priceCents === 0
      ? "Free"
      : (myPlan?.plan.name ?? userMock.tier);
  const displayUsage = toUsageMetrics(myPlan, usage);

  return (
    <AccountShell user={user} projectCount={projects.length}>
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
          {isLoading ? (
            <ProjectsSkeleton />
          ) : isError ? (
            <Box
              sx={{
                ...panelSx,
                p: 6,
                display: "flex",
                flexDirection: "column",
                gap: 3,
                alignItems: "flex-start",
              }}
            >
              <Alert
                severity="error"
                sx={{ width: "100%", bgcolor: "transparent", p: 0 }}
              >
                Failed to load projects. Please try again.
              </Alert>
              <Button
                size="small"
                variant="outlined"
                startIcon={<IconRefresh size={14} />}
                onClick={() => refetch()}
                sx={{ textTransform: "none" }}
              >
                Retry
              </Button>
            </Box>
          ) : projects.length === 0 ? (
            <Box
              sx={{
                ...panelSx,
                p: 10,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography
                sx={{ color: "text.secondary", fontSize: 14, fontWeight: 500 }}
              >
                No projects yet
              </Typography>
              <Typography sx={{ color: "text.disabled", fontSize: 12 }}>
                Create your first project to get started.
              </Typography>
            </Box>
          ) : (
            <ProjectsSection projects={projects} />
          )}

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
            metrics={displayUsage}
            projectCount={projects.length}
            resetNote={usageResetNote}
          />
          <PlanCard plan={planName} tier={planTier} />
        </Box>
      </Box>
    </AccountShell>
  );
}

export default AccountOverviewPage;
