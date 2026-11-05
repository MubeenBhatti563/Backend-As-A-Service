import { CreateProjectInput } from "@baas/types";
import { useMutation } from "@tanstack/react-query";
import { projectApi } from "../api/project.api";

export function usePostProject() {
  return useMutation({
    mutationFn: (payload: CreateProjectInput) => projectApi.create(payload),
  });
}
