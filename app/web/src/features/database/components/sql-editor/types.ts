export interface QueryHistoryItem {
  id: string;
  preview: string;
  sql: string;
  ranAt: string;
}

export interface QueryResult {
  columns: GridColumn[];
  rows: GridRow[];
  executionMs: number;
}

export interface SqlEditorData {
  schema: string;
  initialQuery: string;
  history: QueryHistoryItem[];
  result: QueryResult | null;
}
import type { GridColumn, GridRow } from "../../types";

