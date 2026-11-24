export type RlsStatus = "active" | "disabled";

export interface DatabaseTable {
  name: string;
  rows: number;
  size: string;
  sizeBytes: string;
  dataSizeBytes?: string;
  indexSizeBytes?: string;
  lastMaintained: string | null;
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

export interface DatabaseIndex {
  name: string;
  tableName: string;
  method: string;
  columns: string[];
  isUnique: boolean;
  isPrimary: boolean;
  isValid: boolean;
  definition: string;
  sizeBytes: string;
}

export interface DatabaseIndexesResponse {
  stats: {
    totalIndexes: number;
    uniqueIndexes: number;
    totalSizeBytes: string;
  };
  databaseStats: DatabaseStats;
  indexes: DatabaseIndex[];
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
  writable?: boolean;
  nullable?: boolean;
  hasDefault?: boolean;
  dataType?: string;
  foreignKey?: { tableName: string; columnName: string };
}

export type GridRow = { id: string } & Record<string, string>;

export interface TableDetail {
  table: DatabaseTable;
  columns: GridColumn[];
  rows: GridRow[];
  pagination: { page: number; pageSize: number; totalRows: number };
}
