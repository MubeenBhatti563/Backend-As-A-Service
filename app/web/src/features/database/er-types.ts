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
