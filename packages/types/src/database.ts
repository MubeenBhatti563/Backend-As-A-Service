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

/* ---------- Relationships (ER diagram) ---------- */

export interface ErColumn {
  name: string;
  type: string;
  /** pk = primary key (amber key icon), fk = foreign key (blue link icon). */
  key?: "pk" | "fk";
}

export interface ErTable {
  id: string;
  name: string;
  /** Initial canvas position in px (top-left of the node). */
  x: number;
  y: number;
  columns: ErColumn[];
}

/** Maps to theme palette colours: info = blue, secondary = cyan, warning = amber. */
export type RelationTone = "info" | "secondary" | "warning";

export interface ErRelation {
  id: string;
  /** Parent side (the "1"), e.g. users.id */
  from: { table: string; column: string };
  /** Child side, e.g. posts.user_id */
  to: { table: string; column: string };
  cardinality: "1:1" | "1:N";
  tone: RelationTone;
  dashed?: boolean;
}

export interface RelationshipsData {
  tables: ErTable[];
  relations: ErRelation[];
}

export type DatabaseColumnType =
  | "text"
  | "integer"
  | "bigint"
  | "boolean"
  | "uuid"
  | "timestamptz"
  | "jsonb";

export interface CreateTableColumnDefinition {
  name: string;
  type: DatabaseColumnType;
  nullable: boolean;
  isUnique?: boolean;
  defaultValue?: string;
  foreignKey?: {
    table: string;
    column: string;
  };
}

export interface CreateTableRequest {
  name: string;
  columns: CreateTableColumnDefinition[];
}

/* ---------- Table Structure ---------- */

export interface TableStructureColumn {
  name: string;
  type: string;
  formattedType: string;
  isPrimary: boolean;
  isNullable: boolean;
  isUnique: boolean;
  hasDefault: boolean;
  defaultValue: string | null;
  isForeignKey: boolean;
  foreignKey: {
    tableName: string;
    columnName: string;
    constraintName?: string;
  } | null;
  isWritable: boolean;
}

export interface TableStructureResponse {
  table: DatabaseTable;
  columns: TableStructureColumn[];
  primaryKeys: string[];
  uniqueConstraintsCount: number;
  foreignKeysCount: number;
}

/* ---------- Table Relationships ---------- */

export interface TableRelationshipItem {
  id: string;
  direction: "outgoing" | "incoming";
  constraintName: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  cardinality: "1:1" | "1:N";
  onDelete?: string;
  onUpdate?: string;
}

export interface TableRelationshipsResponse {
  table: DatabaseTable;
  relationships: TableRelationshipItem[];
  erData: RelationshipsData;
}

/* ---------- Table Indexes ---------- */

export interface TableIndexesResponse {
  table: DatabaseTable;
  stats: {
    totalIndexes: number;
    uniqueIndexes: number;
    totalSizeBytes: string;
  };
  indexes: DatabaseIndex[];
}

export interface CreateIndexRequest {
  name?: string;
  columns: string[];
  method?: "btree" | "hash" | "gin" | "gist";
  isUnique?: boolean;
}

export interface AddColumnRequest {
  name: string;
  type: DatabaseColumnType;
  nullable: boolean;
  isUnique?: boolean;
  defaultValue?: string;
  foreignKey?: {
    table: string;
    column: string;
  };
}



