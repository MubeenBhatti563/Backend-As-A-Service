import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infra/prisma/prisma.service";
import type { Plan, ProjectUsage } from "@prisma/client";

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Serialise BigInt → string so the value survives JSON.stringify. */
function bigintToStr(v: bigint | null): string | null {
  return v === null ? null : v.toString();
}

function serialisePlan(plan: Plan) {
  return {
    id: plan.id,
    code: plan.code as "HOBBY" | "PRO" | "ENTERPRISE",
    name: plan.name,
    description: plan.description,
    priceCents: plan.priceCents,
    currency: plan.currency,
    isAvailable: plan.isAvailable,
    maxProjects: plan.maxProjects,
    maxRealtimeConnections: plan.maxRealtimeConnections,
    apiRequestsMonthly: bigintToStr(plan.apiRequestsMonthly),
    dbStorageBytes: bigintToStr(plan.dbStorageBytes),
    fileStorageBytes: bigintToStr(plan.fileStorageBytes),
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns all publicly available plans (for a pricing page). */
  async getPublicPlans() {
    const plans = await this.prisma.plan.findMany({
      where: { isAvailable: true },
      orderBy: { priceCents: "asc" },
    });
    return { plans: plans.map(serialisePlan) };
  }

  /**
   * Returns the authenticated user's current plan, subscription details,
   * and aggregated usage for the current calendar month.
   *
   * Users who have never subscribed default to the HOBBY plan.
   */
  async getMyPlan(userId: string) {
    // ── Fallback: Hobby plan ──────────────────────────────────────────────
    const hobbyPlan = await this.prisma.plan.findUniqueOrThrow({
      where: { code: "HOBBY" },
    });

    // ── Subscription (may not exist for new / free users) ─────────────────
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    const activePlan = subscription ? subscription.plan : hobbyPlan;

    // ── Aggregate usage across all user projects for current billing month ─
    const periodStart = new Date();
    periodStart.setDate(1);
    periodStart.setHours(0, 0, 0, 0);

    const usageRows: Pick<
      ProjectUsage,
      "dbBytes" | "fileBytes" | "apiRequests" | "peakRealtimeConns"
    >[] = await this.prisma.projectUsage.findMany({
      where: {
        periodStart: { gte: periodStart },
        project: { ownerId: userId },
      },
      select: {
        dbBytes: true,
        fileBytes: true,
        apiRequests: true,
        peakRealtimeConns: true,
      },
    });

    const usage = usageRows.reduce(
      (acc, row) => ({
        dbBytes: acc.dbBytes + row.dbBytes,
        fileBytes: acc.fileBytes + row.fileBytes,
        apiRequests: acc.apiRequests + row.apiRequests,
        peakRealtimeConns: Math.max(acc.peakRealtimeConns, row.peakRealtimeConns),
      }),
      { dbBytes: 0n, fileBytes: 0n, apiRequests: 0n, peakRealtimeConns: 0 }
    );

    return {
      plan: serialisePlan(activePlan),
      subscription: subscription
        ? {
            id: subscription.id,
            userId: subscription.userId,
            planId: subscription.planId,
            status: subscription.status as "ACTIVE" | "PAST_DUE" | "CANCELED",
            currentPeriodStart: subscription.currentPeriodStart.toISOString(),
            currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            plan: serialisePlan(subscription.plan),
          }
        : null,
      usage: {
        dbBytes: usage.dbBytes.toString(),
        fileBytes: usage.fileBytes.toString(),
        apiRequests: usage.apiRequests.toString(),
        peakRealtimeConns: usage.peakRealtimeConns,
      },
    };
  }
}
