import { cache } from "react";
import { cookies } from "next/headers";
import type { ProjectOverviewData } from "./types";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3000/api/v1").replace(/\/$/, "");

/** Authenticated, request-deduplicated project overview fetch for Server Components. */
export const getProjectOverview = cache(async (projectId: string): Promise<ProjectOverviewData | null> => {
  const cookieHeader = (await cookies()).toString();
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/project/${encodeURIComponent(projectId)}/overview`, {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: "no-store",
    });
  } catch {
    throw new Error("The project API could not be reached. Check the API server and retry.");
  }
  if (response.status === 404) return null;
  const body = await response.json() as { data?: ProjectOverviewData; message?: string };
  if (!response.ok) throw new Error(body.message ?? `Project request failed (${response.status}).`);
  if (!body.data) throw new Error("The project API returned an invalid overview response.");
  return body.data;
});
