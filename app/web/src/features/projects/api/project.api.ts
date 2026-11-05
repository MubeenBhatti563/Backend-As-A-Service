import API_ENDPOINTS from "@/config/endpoints";
import apiClient from "@/lib/api-client";
import { ApiResponse, CreateProjectInput, ProjectData } from "@baas/types";

export const projectApi = {
  create: async (
    payload: CreateProjectInput,
  ): Promise<ApiResponse<ProjectData>> => {
    return (await apiClient.post(
      API_ENDPOINTS.PROJECT.CREATE,
      payload,
    )) as unknown as ApiResponse<ProjectData>;
  },
};
