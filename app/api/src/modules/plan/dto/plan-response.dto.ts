import { createZodDto } from "nestjs-zod";
import { z } from "zod";

// ── Shared sub-schemas ────────────────────────────────────────────────────────

const PlanDataSchema = z.object({
  id: z.string(),
  code: z.enum(["HOBBY", "PRO", "ENTERPRISE"]),
  name: z.string(),
  description: z.string().nullable(),
  priceCents: z.number().int().nullable(),
  currency: z.string(),
  isAvailable: z.boolean(),
  maxProjects: z.number().int().nullable(),
  maxRealtimeConnections: z.number().int().nullable(),
  /** BigInt is serialised as a numeric string over JSON. */
  apiRequestsMonthly: z.string().nullable(),
  dbStorageBytes: z.string().nullable(),
  fileStorageBytes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const SubscriptionDataSchema = z.object({
  id: z.string(),
  userId: z.string(),
  planId: z.string(),
  status: z.enum(["ACTIVE", "PAST_DUE", "CANCELED"]),
  currentPeriodStart: z.string(),
  currentPeriodEnd: z.string(),
  cancelAtPeriodEnd: z.boolean(),
  plan: PlanDataSchema,
});

const PlanUsageSchema = z.object({
  dbBytes: z.string(),
  fileBytes: z.string(),
  apiRequests: z.string(),
  peakRealtimeConns: z.number().int(),
});

// ── Response DTOs ─────────────────────────────────────────────────────────────

export const MyPlanResponseSchema = z.object({
  plan: PlanDataSchema,
  subscription: SubscriptionDataSchema.nullable(),
  usage: PlanUsageSchema,
});

export const PublicPlansResponseSchema = z.object({
  plans: z.array(PlanDataSchema),
});

export class MyPlanResponseDto extends createZodDto(MyPlanResponseSchema) {}
export class PublicPlansResponseDto extends createZodDto(
  PublicPlansResponseSchema
) {}
