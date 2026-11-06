import {
  CreateProjectInput,
  CreateProjectResponse,
  ProjectData,
} from "@baas/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { projectApi } from "../api/project.api";

export function usePostProject() {
  return useMutation({
    mutationFn: async (
      payload: CreateProjectInput,
    ): Promise<CreateProjectResponse> => {
      const response = await projectApi.create(payload);
      return response.data;
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
