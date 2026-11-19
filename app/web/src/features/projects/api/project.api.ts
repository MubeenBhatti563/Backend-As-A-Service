import API_ENDPOINTS from "@/config/endpoints";
import apiClient from "@/lib/api-client";
import {
  ActivityLogData,
  ApiResponse,
  CreateProjectInput,
  CreateProjectResponse,
  ProjectData,
  ProjectOverviewData,
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

  getActivity: async (): Promise<ApiResponse<ActivityLogData[]>> => {
    return (await apiClient.get(
      API_ENDPOINTS.PROJECT.ACTIVITY,
    )) as unknown as ApiResponse<ActivityLogData[]>;
  },

  getById: async (id: string): Promise<ApiResponse<ProjectData>> => {
    return (await apiClient.get(
      API_ENDPOINTS.PROJECT.BY_ID(id),
    )) as unknown as ApiResponse<ProjectData>;
  },

  getOverview: async (
    id: string,
  ): Promise<ApiResponse<ProjectOverviewData>> => {
    return (await apiClient.get(
      API_ENDPOINTS.PROJECT.OVERVIEW(id),
    )) as unknown as ApiResponse<ProjectOverviewData>;
  },
};
