import {
  ActivityLogData,
  CreateProjectInput,
  CreateProjectResponse,
  ProjectData,
  ProjectOverviewData,
} from "@baas/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "../api/project.api";

export function usePostProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: CreateProjectInput,
    ): Promise<CreateProjectResponse> => {
      const response = await projectApi.create(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", "activity"] });
    },
  });
}

export function useAllProjects() {
  return useQuery<ProjectData[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await projectApi.getAllProjects();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecentActivity() {
  return useQuery<ActivityLogData[]>({
    queryKey: ["project", "activity"],
    queryFn: async () => {
      const response = await projectApi.getActivity();
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useProjectById(projectId: string) {
  return useQuery<ProjectData>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await projectApi.getById(projectId);
      return response.data;
    },
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useProjectOverview(
  projectId: string,
  initialData?: ProjectOverviewData,
) {
  return useQuery<ProjectOverviewData>({
    queryKey: ["project", projectId, "overview"],
    queryFn: async () => {
      const response = await projectApi.getOverview(projectId);
      return response.data;
    },
    enabled: Boolean(projectId),
    initialData,
    staleTime: 1000 * 30,
    refetchInterval: (query) => {
      const status = query.state.data?.project.status;
      return status === "pending" ? 3000 : false;
    },
  });
}
