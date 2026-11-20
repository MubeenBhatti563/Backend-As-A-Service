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
