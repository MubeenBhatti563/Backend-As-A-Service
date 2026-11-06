import API_ENDPOINTS from "@/config/endpoints";
import apiClient from "@/lib/api-client";
import {
  ApiResponse,
  CreateProjectInput,
  CreateProjectResponse,
  ProjectData,
} from "@baas/types";

export type { CreateProjectResponse };

export const projectApi = {
  create: async (
    payload: CreateProjectInput,
  ): Promise<ApiResponse<CreateProjectResponse>> => {
    return (await apiClient.post(
      API_ENDPOINTS.PROJECT.CREATE,
      payload,
    )) as unknown as ApiResponse<CreateProjectResponse>;
  },

  getAllProjects: async (): Promise<ApiResponse<ProjectData[]>> => {
    return (await apiClient.get(
      API_ENDPOINTS.PROJECT.GET_ALL,
    )) as unknown as ApiResponse<ProjectData[]>;
  },
};
