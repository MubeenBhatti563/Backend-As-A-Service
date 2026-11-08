import { MyPlanResponse, PublicPlansResponse } from "@baas/types";
import { useQuery } from "@tanstack/react-query";
import { planApi } from "../api/plan.api";

export const PLAN_QUERY_KEYS = {
  myPlan: ["plan", "my-plan"] as const,
  allPlans: ["plan", "all-plans"] as const,
};

export function useMyPlan() {
  return useQuery<MyPlanResponse>({
    queryKey: PLAN_QUERY_KEYS.myPlan,
    queryFn: async () => {
      const response = await planApi.getMyPlan();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

export function useAllPlans() {
  return useQuery<PublicPlansResponse>({
    queryKey: PLAN_QUERY_KEYS.allPlans,
    queryFn: async () => {
      const response = await planApi.getAllPlans();
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 min
  });
}
