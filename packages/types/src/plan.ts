// Shared plan and subscription types — used by both API and web.

export type PlanCode = "HOBBY" | "PRO" | "ENTERPRISE";
export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED";

export interface PlanData {
  id: string;
  code: PlanCode;
  name: string;
  description: string | null;
  /** cents; null = custom pricing (Enterprise) */
  priceCents: number | null;
  currency: string;
  isAvailable: boolean;
  maxProjects: number | null;
  maxRealtimeConnections: number | null;
  /** BigInt serialised as string over JSON */
  apiRequestsMonthly: string | null;
  dbStorageBytes: string | null;
  fileStorageBytes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionData {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: PlanData;
}

export interface PlanUsage {
  /** Bytes as numeric string (BigInt serialised) */
  dbBytes: string;
  fileBytes: string;
  apiRequests: string;
  peakRealtimeConns: number;
}

export interface MyPlanResponse {
  plan: PlanData;
  subscription: SubscriptionData | null;
  usage: PlanUsage;
}

export interface PublicPlansResponse {
  plans: PlanData[];
}
