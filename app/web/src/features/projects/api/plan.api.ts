import API_ENDPOINTS from "@/config/endpoints";
import apiClient from "@/lib/api-client";
import {
  ApiResponse,
  MyPlanResponse,
  PublicPlansResponse,
} from "@baas/types";

export const planApi = {
  getMyPlan: async (): Promise<ApiResponse<MyPlanResponse>> => {
    return (await apiClient.get(
      API_ENDPOINTS.PLAN.MY_PLAN,
    )) as unknown as ApiResponse<MyPlanResponse>;
  },

  getAllPlans: async (): Promise<ApiResponse<PublicPlansResponse>> => {
    return (await apiClient.get(
      API_ENDPOINTS.PLAN.ALL_PLANS,
    )) as unknown as ApiResponse<PublicPlansResponse>;
  },
};
