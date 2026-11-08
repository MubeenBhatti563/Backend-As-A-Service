import {
  ActivityLogData,
  CreateProjectInput,
  CreateProjectResponse,
  ProjectData,
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
