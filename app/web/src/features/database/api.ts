import { cookies } from 'next/headers';
import type { DatabaseIndexesResponse, DatabaseOverview, TableDetail } from './types';

const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3000/api/v1').replace(/\/$/, '');

async function getData<T>(path: string): Promise<T | null> {
  const cookieHeader = (await cookies()).toString();
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: 'no-store',
    });
  } catch {
    throw new Error('The database API could not be reached. Check that the API server is running, then retry.');
  }
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Database request failed (${response.status}). Retry the request or check your session.`);
  const result = await response.json();
  return result.data as T;
}

export function getDatabaseOverview(projectId: string): Promise<DatabaseOverview | null> {
  return getData<DatabaseOverview>(`/project/${encodeURIComponent(projectId)}/database`);
}

export function getDatabaseIndexes(projectId: string): Promise<DatabaseIndexesResponse | null> {
  return getData<DatabaseIndexesResponse>(`/project/${encodeURIComponent(projectId)}/database/indexes`);
}

export function getTableDetail(projectId: string, tableName: string): Promise<TableDetail | null> {
  return getData<TableDetail>(`/project/${encodeURIComponent(projectId)}/database/tables/${encodeURIComponent(tableName)}`);
}
