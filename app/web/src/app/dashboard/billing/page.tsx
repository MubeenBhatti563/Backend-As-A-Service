"use client";

import { AccountShell } from "@/features/projects/components/projects/AccountShell";
import { useAuthStore } from "@/stores";
import Loading from "@/app/loading";
import { useAllProjects } from "@/features/projects/hooks/use-project";
import { useAllPlans, useMyPlan } from "@/features/projects/hooks/use-plan";
import { UsagePanel } from "@/features/projects/components/projects/UsagePanel";
import type { UsageMetric } from "@/types/projectPage";
import type { MyPlanResponse } from "@baas/types";
import { Alert, Box, Button, Chip, Divider, Typography } from "@mui/material";
import {
  IconArrowRight,
  IconBolt,
  IconCheck,
  IconCreditCard,
  IconReceipt,
} from "@tabler/icons-react";

function toUsageMetrics(myPlan: MyPlanResponse | undefined): UsageMetric[] {
  if (!myPlan) return [];
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

const formatApiRequestLimit = (limit: string | null | undefined) =>
  limit == null
    ? "Custom"
    : new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(Number(limit));

export default function BillingPage() {
  const { user } = useAuthStore();
  const { data: projects } = useAllProjects();
  const { data: myPlan } = useMyPlan();
  const { data: plans } = useAllPlans();
  const usage = toUsageMetrics(myPlan);
  const proPlan = plans?.plans.find((plan) => plan.code === "PRO");

  if (!user) return <Loading />;

  return (
    <AccountShell
      user={user}
      projectCount={projects?.length ?? 0}
      activeNav="usage"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography
          sx={{ color: "secondary.main", fontSize: 11, letterSpacing: "1px" }}
        >
          ACCOUNT
        </Typography>
        <Typography
          component="h1"
          variant="h4"
          sx={{ fontSize: 28, fontWeight: 800 }}
        >
          Usage & billing
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
          Manage your plan and see what you get with Pro.
        </Typography>
      </Box>

      <UsagePanel
        metrics={usage}
        projectCount={projects?.length ?? 0}
        resetNote="API quota renews monthly"
        showLink={false}
      />
      {!myPlan && <Alert severity="info">Plan and usage data is loading or unavailable from the API.</Alert>}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1.15fr) minmax(300px, .85fr)",
          },
          gap: 5,
          alignItems: "start",
        }}
      >
        <Box
          component="section"
          aria-labelledby="current-plan"
          sx={{
            p: { xs: 5, md: 7 },
            bgcolor: "background.default",
            border: 1,
            borderColor: "border.strong",
            borderRadius: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 3,
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: "text.disabled",
                  fontSize: 10,
                  letterSpacing: ".8px",
                }}
              >
                CURRENT PLAN
              </Typography>
              <Typography
                id="current-plan"
                component="h2"
                sx={{ mt: 1, fontSize: 23, fontWeight: 700 }}
              >
                {myPlan?.plan.name ?? "Unavailable"}
              </Typography>
            </Box>
            <Chip
              label={myPlan?.plan.code ?? "Unavailable"}
              size="small"
              sx={{
                bgcolor: "background.elevated",
                color: "text.secondary",
                fontWeight: 600,
              }}
            />
          </Box>
          <Typography
            sx={{
              mt: 3,
              color: "text.secondary",
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            A great place to start. Your projects stay online while you decide
            when to grow.
          </Typography>
          <Divider sx={{ my: 5 }} />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              color: "text.secondary",
            }}
          >
            <IconReceipt size={17} aria-hidden />
            <Typography sx={{ fontSize: 12 }}>No invoices yet</Typography>
          </Box>
        </Box>

        <Box
          component="section"
          aria-labelledby="pro-plan"
          sx={{
            p: { xs: 5, md: 7 },
            bgcolor: "background.default",
            border: 1,
            borderColor: "secondary.main",
            borderRadius: 1.5,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 100% 0%, rgba(6,182,212,.12), transparent 58%)",
              pointerEvents: "none",
            }}
          />
          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Typography
                id="pro-plan"
                component="h2"
                sx={{ fontSize: 20, fontWeight: 700 }}
              >
                Move to Pro
              </Typography>
              <Chip
                icon={<IconBolt size={13} />}
                label="BUILT TO SCALE"
                size="small"
                sx={{
                  bgcolor: "rgba(6,182,212,.12)",
                  color: "secondary.main",
                  fontSize: 9,
                  fontWeight: 700,
                }}
              />
            </Box>
            <Box
              sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 4 }}
            >
              <Typography
                component="span"
                sx={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1.5px" }}
              >
                {proPlan ? new Intl.NumberFormat(undefined, { style: "currency", currency: proPlan.currency }).format((proPlan.priceCents ?? 0) / 100) : "Unavailable"}
              </Typography>
              <Typography
                component="span"
                sx={{ color: "text.secondary", fontSize: 12 }}
              >
                / month
              </Typography>
            </Box>
            <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 12 }}>
              Everything you need to ship with confidence.
            </Typography>
            <Box
              component="ul"
              sx={{
                listStyle: "none",
                p: 0,
                m: 0,
                mt: 5,
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
              }}
            >
              {(proPlan ? [
                proPlan.maxProjects == null ? "Unlimited projects" : `Up to ${proPlan.maxProjects} projects`,
                `${proPlan.dbStorageBytes ? (Number(proPlan.dbStorageBytes) / 1_000_000_000).toFixed(0) : "Custom"} GB database storage`,
                `${proPlan.fileStorageBytes ? (Number(proPlan.fileStorageBytes) / 1_000_000_000).toFixed(0) : "Custom"} GB file storage`,
                `${formatApiRequestLimit(proPlan.apiRequestsMonthly)} API requests per month`,
                `${proPlan.maxRealtimeConnections ?? "Custom"} concurrent realtime connections`,
              ] : []).map((item) => (
                <Box
                  component="li"
                  key={item}
                  sx={{ display: "flex", alignItems: "center", gap: 2 }}
                >
                  <IconCheck size={15} color="#06B6D4" aria-hidden />
                  <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                    {item}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Button
              variant="contained"
              fullWidth
              disabled
              endIcon={<IconArrowRight size={15} />}
              sx={{ mt: 5, height: 42, gap: 1, fontSize: 13 }}
            >
              {proPlan ? "Billing actions unavailable" : "Plan unavailable"}
            </Button>
            <Typography
              sx={{
                mt: 2,
                textAlign: "center",
                color: "text.disabled",
                fontSize: 10,
              }}
            >
              No commitment. Change or cancel anytime.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          color: "text.disabled",
        }}
      >
        <IconCreditCard size={15} aria-hidden />
        <Typography sx={{ fontSize: 11 }}>
          Secure checkout will be available soon.
        </Typography>
      </Box>
    </AccountShell>
  );
}
