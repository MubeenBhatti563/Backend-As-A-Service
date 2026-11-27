export interface QueryHistoryItem {
  id: string;
  preview: string;
  sql: string;
  ranAt: string;
}

export interface SqlResultColumn {
  key: string;
  label: string;
}

export type SqlResultRow = Record<string, unknown>;

export interface QueryResult {
  columns: SqlResultColumn[];
  rows: SqlResultRow[];
  executionMs: number;
  rowCount?: number;
  command?: string;
}

export interface SqlEditorData {
  schema: string;
  initialQuery: string;
  history: QueryHistoryItem[];
  result: QueryResult | null;
}


