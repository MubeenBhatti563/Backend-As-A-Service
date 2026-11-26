import apiClient from '@/lib/api-client';
import type {
  AddColumnRequest,
  ApiResponse,
  CreateIndexRequest,
  CreateTableRequest,
  RelationshipsData,
  CreatePolicyRequest,
  TablePoliciesResponse,
  ToggleRlsRequest,
} from '@baas/types';
import type { TableDetail } from './types';

export type { AddColumnRequest, CreateIndexRequest, CreatePolicyRequest };
export type NewTableDefinition = CreateTableRequest;

export async function fetchTablePage(
  projectId: string,
  tableName: string,
  page: number,
  pageSize: number,
  query?: string,
) {
  const params: Record<string, unknown> = { page, pageSize };
  if (query && query.trim()) {
    params.q = query.trim();
  }
  const response = (await apiClient.get(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}`,
    { params },
  )) as unknown as ApiResponse<TableDetail>;
  return response.data;
}

export async function createDatabaseTable(projectId: string, definition: NewTableDefinition) {
  return apiClient.post(`/project/${encodeURIComponent(projectId)}/database/tables`, definition);
}

export async function dropDatabaseTable(projectId: string, tableName: string) {
  return apiClient.delete(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}`,
  );
}

export async function insertDatabaseRow(projectId: string, tableName: string, values: Record<string, string | null>) {
  return apiClient.post(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}/rows`,
    values,
  );
}

export async function updateDatabaseRow(
  projectId: string,
  tableName: string,
  rowId: string,
  values: Record<string, string | null>,
) {
  return apiClient.patch(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}/rows/${encodeURIComponent(rowId)}`,
    values,
  );
}

export async function deleteDatabaseRow(projectId: string, tableName: string, rowId: string) {
  return apiClient.delete(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}/rows/${encodeURIComponent(rowId)}`,
  );
}

export async function deleteDatabaseRows(projectId: string, tableName: string, rowIds: string[]) {
  return apiClient.post(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}/rows/delete-many`,
    { rowIds },
  );
}

export async function fetchForeignKeyOptions(projectId: string, tableName: string, columnName: string) {
  const response = (await apiClient.get(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}/foreign-key-options/${encodeURIComponent(columnName)}`,
  )) as unknown as ApiResponse<{ values: string[]; limit: number }>;
  return response.data;
}

export async function fetchDatabaseRelationships(projectId: string) {
  const response = (await apiClient.get(
    `/project/${encodeURIComponent(projectId)}/database/relationships`,
  )) as unknown as ApiResponse<RelationshipsData>;
  return response.data;
}

export async function addDatabaseColumn(
  projectId: string,
  tableName: string,
  column: AddColumnRequest,
) {
  return apiClient.post(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}/columns`,
    column,
  );
}

export async function dropDatabaseColumn(
  projectId: string,
  tableName: string,
  columnName: string,
) {
  return apiClient.delete(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}/columns/${encodeURIComponent(columnName)}`,
  );
}

export async function createDatabaseIndex(
  projectId: string,
  tableName: string,
  index: CreateIndexRequest,
) {
  return apiClient.post(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}/indexes`,
    index,
  );
}

export async function dropDatabaseIndex(
  projectId: string,
  tableName: string,
  indexName: string,
) {
  return apiClient.delete(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}/indexes/${encodeURIComponent(indexName)}`,
  );
}

export interface AddForeignKeyRequest {
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  constraintName?: string;
  onDelete: 'NO ACTION' | 'RESTRICT' | 'CASCADE' | 'SET NULL';
}

export async function addDatabaseForeignKey(
  projectId: string,
  tableName: string,
  body: AddForeignKeyRequest,
) {
  return apiClient.post(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}/relationships`,
    body,
  );
}

export async function toggleDatabaseTableRls(
  projectId: string,
  tableName: string,
  enabled: boolean,
) {
  const response = (await apiClient.patch(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}/rls`,
    { enabled },
  )) as unknown as ApiResponse<{ tableName: string; rls: string }>;
  return response.data;
}

export async function fetchDatabaseTablePolicies(
  projectId: string,
  tableName: string,
) {
  const response = (await apiClient.get(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}/policies`,
  )) as unknown as ApiResponse<TablePoliciesResponse>;
  return response.data;
}

export async function createDatabaseTablePolicy(
  projectId: string,
  tableName: string,
  policy: CreatePolicyRequest,
) {
  return apiClient.post(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}/policies`,
    policy,
  );
}

export async function dropDatabaseTablePolicy(
  projectId: string,
  tableName: string,
  policyName: string,
) {
  return apiClient.delete(
    `/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}/policies/${encodeURIComponent(policyName)}`,
  );
}

