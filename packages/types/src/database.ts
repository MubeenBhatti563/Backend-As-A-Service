export type RlsStatus = "active" | "disabled";

export interface DatabaseTable {
  name: string;
  rows: number;
  size: string;
  lastModified: string;
  rls: RlsStatus;
}

export interface DatabaseStats {
  size: string;
  totalTables: number;
  activeConnections: number;
}

export interface DatabaseOverview {
  stats: DatabaseStats;
  tables: DatabaseTable[];
}

export type DatabaseTabValue =
  | "tables"
  | "sql-editor"
  | "relationships"
  | "indexes";

/* ---------- Table detail ---------- */

export type TableTabValue = "data" | "structure" | "relationships" | "indexes";

export type CellKind =
  | "uuid"
  | "primary"
  | "secondary"
  | "role"
  | "status"
  | "timestamp";

export interface GridColumn {
  key: string;
  label: string;
  kind: CellKind;
}

export type GridRow = { id: string } & Record<string, string>;

export interface TableDetail {
  table: DatabaseTable;
  columns: GridColumn[];
  rows: GridRow[];
  pagination: { page: number; pageSize: number; totalRows: number };
}
