import type { ApiResponse } from "@baas/types";
import apiClient from "@/lib/api-client";
import type { Bucket, StorageSettings } from "./types";
import type { FileEntry } from "./browser/types";

interface FileListResponse {
  items: FileEntry[];
  nextCursor: string | null;
}

function projectStoragePath(projectId: string) {
  return `/project/${encodeURIComponent(projectId)}/storage`;
}

export async function fetchStorageSettings(projectId: string) {
  const response = (await apiClient.get(
    `${projectStoragePath(projectId)}/settings`,
  )) as unknown as ApiResponse<StorageSettings>;
  return response.data;
}

export async function updateStorageSettings(
  projectId: string,
  settings: StorageSettings,
) {
  const response = (await apiClient.patch(
    `${projectStoragePath(projectId)}/settings`,
    settings,
  )) as unknown as ApiResponse<StorageSettings>;
  return response.data;
}

export async function fetchStorageBuckets(projectId: string) {
  const response = (await apiClient.get(
    `${projectStoragePath(projectId)}/buckets`,
  )) as unknown as ApiResponse<Bucket[]>;
  return response.data;
}

export async function updateStorageBucketAccess(
  projectId: string,
  bucketId: string,
  access: Bucket["access"],
) {
  const response = (await apiClient.patch(
    `${projectStoragePath(projectId)}/buckets/${encodeURIComponent(bucketId)}/access`,
    { access },
  )) as unknown as ApiResponse<{ id: string; access: Bucket["access"] }>;
  return response.data;
}

export async function createStorageBucket(projectId: string, name: string) {
  const response = (await apiClient.post(
    `${projectStoragePath(projectId)}/buckets`,
    { name },
  )) as unknown as ApiResponse<Bucket>;
  return response.data;
}

export async function deleteStorageBucket(projectId: string, bucketId: string) {
  await apiClient.delete(
    `${projectStoragePath(projectId)}/buckets/${encodeURIComponent(bucketId)}`,
  );
}

export async function fetchStorageFiles(
  projectId: string,
  bucketId: string,
  options: { query?: string; cursor?: string } = {},
) {
  const response = (await apiClient.get(
    `${projectStoragePath(projectId)}/buckets/${encodeURIComponent(bucketId)}/files`,
    {
      params: {
        limit: 100,
        ...(options.query ? { q: options.query } : {}),
        ...(options.cursor ? { cursor: options.cursor } : {}),
      },
    },
  )) as unknown as ApiResponse<FileListResponse>;
  return response.data;
}

export async function uploadStorageFile(
  projectId: string,
  bucketId: string,
  file: File,
) {
  const form = new FormData();
  form.append("file", file);
  const response = (await apiClient.post(
    `${projectStoragePath(projectId)}/buckets/${encodeURIComponent(bucketId)}/files`,
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120_000,
    },
  )) as unknown as ApiResponse<FileEntry>;
  return response.data;
}

export async function downloadStorageFile(
  projectId: string,
  bucketId: string,
  fileId: string,
) {
  return (await apiClient.get(
    `${projectStoragePath(projectId)}/buckets/${encodeURIComponent(bucketId)}/files/${encodeURIComponent(fileId)}/download`,
    { responseType: "blob", timeout: 120_000 },
  )) as unknown as Blob;
}

export async function deleteStorageFile(
  projectId: string,
  bucketId: string,
  fileId: string,
) {
  await apiClient.delete(
    `${projectStoragePath(projectId)}/buckets/${encodeURIComponent(bucketId)}/files/${encodeURIComponent(fileId)}`,
  );
}

export function getPublicStorageFileUrl(
  bucketId: string,
  fileId: string,
  cdnBaseUrl?: string | null,
) {
  const apiBase = apiClient.defaults.baseURL?.replace(/\/+$/, "") ?? "";
  const base = cdnBaseUrl
    ? `${cdnBaseUrl.replace(/\/+$/, "")}/api/v1`
    : apiBase;
  return `${base}/storage/public/${encodeURIComponent(bucketId)}/${encodeURIComponent(fileId)}`;
}
