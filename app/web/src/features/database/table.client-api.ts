import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@baas/types';
import type { TableDetail } from './types';

export type NewTableDefinition = {
  name: string;
  columns: Array<{ name: string; type: 'text' | 'integer' | 'bigint' | 'boolean' | 'uuid' | 'timestamptz' | 'jsonb'; nullable: boolean }>;
};

export async function fetchTablePage(projectId: string, tableName: string, page: number, pageSize: number) {
  const response = await apiClient.get(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}`,
    { params: { page, pageSize } },
  ) as unknown as ApiResponse<TableDetail>;
  return response.data;
}

export async function createDatabaseTable(projectId: string, definition: NewTableDefinition) {
  return apiClient.post(`/project/${encodeURIComponent(projectId)}/database/tables`, definition);
}

export async function insertDatabaseRow(projectId: string, tableName: string, values: Record<string, string | null>) {
  return apiClient.post(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}/rows`,
    values,
  );
}

export async function fetchForeignKeyOptions(projectId: string, tableName: string, columnName: string) {
  const response = await apiClient.get(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}/foreign-key-options/${encodeURIComponent(columnName)}`,
  ) as unknown as ApiResponse<{ values: string[]; limit: number }>;
  return response.data;
}
