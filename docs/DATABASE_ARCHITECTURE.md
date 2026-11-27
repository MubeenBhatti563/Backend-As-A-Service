# Database Architecture & Tenant Data Management

This document details the multi-tenant database subsystem, schema isolation model, catalog introspection, and security architecture.

---

## 1. Multi-Tenant Schema Isolation

Every project provisioned in the platform receives a dedicated, isolated PostgreSQL schema:

- **Schema Format**: `tenant_<project_id>` (e.g. `tenant_1ec95258_ffc3_4cac_9e6a_132076ed7db6`).
- **Provisioning**: Managed asynchronously by the BullMQ background database worker (`src/workers/db-workers/db.processor.ts`).
- **Isolation Boundary**: All tenant tables, indexes, constraints, and policies reside strictly within `project.schemaName`.
- **Identifier Security**: Every table, column, constraint, index, and policy identifier is strictly validated against the regex `/^[a-z_][a-z0-9_]{0,62}$/` and safely quoted using `quote()` to prevent SQL injection.

---

## 2. Table Subsystem & Capabilities

Each tenant table in `/dashboard/projects/[id]/database/tables/[tableName]` has 5 dedicated views:

```
/dashboard/projects/[id]/database/tables/[tableName]
├── /               -> Data grid (interactive pagination, search, row insert/edit/delete)
├── /structure      -> Column schema, primary keys, nullability, unique/foreign keys
├── /relationships  -> Incoming & outgoing foreign keys, interactive ER canvas
├── /indexes        -> B-tree/Hash/GIN/GiST index manager & byte size tracking
└── /policies       -> Row-Level Security (RLS) toggle & pg_policies management
```

### A. Data Grid (`/tables/[tableName]`)

- **Pagination & Search**: `GET /project/:id/database/tables/:tableName?page=1&pageSize=50&q=...`
- **Mutations**:
  - Insert row: `POST /project/:id/database/tables/:tableName/rows`
  - Update row: `PATCH /project/:id/database/tables/:tableName/rows/:rowId`
  - Single delete: `DELETE /project/:id/database/tables/:tableName/rows/:rowId`
  - Bulk delete: `POST /project/:id/database/tables/:tableName/rows/delete-many`
- **Safety**: Primary keys (`id`) default to `gen_random_uuid()` and are non-editable.

### B. Table Structure (`/tables/[tableName]/structure`)

- **Introspection**: Reads `information_schema.columns`, `pg_constraint`, and `pg_attribute`.
- **Add Column**: `POST /project/:id/database/tables/:tableName/columns`
  - Supported types: `text`, `integer`, `bigint`, `boolean`, `uuid`, `timestamptz`, `jsonb`.
  - Supports default values, nullability, unique constraint, and foreign key constraint at column creation.
- **Drop Column**: `DELETE /project/:id/database/tables/:tableName/columns/:columnName` (primary keys cannot be dropped).

### C. Foreign Keys & Entity-Relationships (`/tables/[tableName]/relationships`)

- **Global ER Canvas**: `GET /project/:id/database/relationships` produces a topological ER diagram with auto-arranged node positions via React Flow.
- **Table Relationships**: `GET /project/:id/database/tables/:tableName/relationships` returns directional metadata (incoming vs outgoing), cardinality (`1:1` or `1:N`), constraint names, and `ON DELETE` rules.
- **Add Foreign Key**: `POST /project/:id/database/tables/:tableName/relationships`
  - Validates source table and target table/column existence.
  - Supports `ON DELETE`: `NO ACTION`, `RESTRICT`, `CASCADE`, `SET NULL`.
  - Auto-generates constraint names capped at 63 characters (`fk_<source>_<col>_<target>_<col>`).

### D. Table Indexes (`/tables/[tableName]/indexes`)

- **Catalog Source**: `pg_index`, `pg_class`, `pg_am`, and `pg_namespace`.
- **Create Index**: `POST /project/:id/database/tables/:tableName/indexes`
  - Methods: `btree` (default), `hash`, `gin`, `gist`.
  - Unique index support (`isUnique: true`).
- **Drop Index**: `DELETE /project/:id/database/tables/:tableName/indexes/:indexName` (primary key indexes are protected).

---

## 3. Row-Level Security (RLS) & Policies

Row-Level Security enforces authorization directly at the database engine level.

### A. Lifecycle & Toggle

- **Status Introspection**: Queried via `c.relrowsecurity AS rls` on `pg_class`.
- **Toggle API**: `PATCH /project/:id/database/tables/:tableName/rls`
  ```sql
  ALTER TABLE "tenant_abc"."posts" ENABLE ROW LEVEL SECURITY;
  -- or
  ALTER TABLE "tenant_abc"."posts" DISABLE ROW LEVEL SECURITY;
  ```
- **Creation-time RLS**: `CreateTableDialog` includes an optional "Enable Row Level Security" switch during initial table creation.

### B. Security Warning

> [!WARNING]
> When Row-Level Security is enabled on a PostgreSQL table without any defined policies, PostgreSQL denies all reads and writes to non-superusers by default. The dashboard displays an explicit warning alert prompting users to create at least one policy.

### C. Policy Management (CRUD)

- **Catalog Introspection**: `GET /project/:id/database/tables/:tableName/policies`
  Queries `pg_policies` with explicit casting to ensure Prisma deserialization:
  ```sql
  SELECT
    policyname::text AS name,
    cmd::text AS command,
    roles::text[] AS roles,
    qual::text AS "using",
    with_check::text AS "withCheck"
  FROM pg_policies
  WHERE schemaname = $1 AND tablename = $2
  ORDER BY policyname
  ```
- **Create Policy**: `POST /project/:id/database/tables/:tableName/policies`
  - Syntax:
    ```sql
    CREATE POLICY <name> ON <schema>.<table>
      FOR [ALL | SELECT | INSERT | UPDATE | DELETE]
      TO <roles>
      [ USING ( <using_expression> ) ]
      [ WITH CHECK ( <check_expression> ) ];
    ```
  - Command Rules:
    - `SELECT` & `DELETE`: Require `USING` clause; cannot have `WITH CHECK`.
    - `INSERT`: Requires `WITH CHECK` clause; cannot have `USING`.
    - `UPDATE` & `ALL`: Can accept both `USING` and `WITH CHECK`.
- **Drop Policy**: `DELETE /project/:id/database/tables/:tableName/policies/:policyName`
  ```sql
  DROP POLICY "<name>" ON "<schema>"."<table>";
  ```

### D. Built-in Policy Presets

The `AddPolicyDialog` provides common architectural presets:

1. **Public Read Access**: `SELECT` for `public` with `USING (true)`.
2. **Authenticated Read**: `SELECT` for `authenticated` with `USING (true)`.
3. **User Owns Rows**: `ALL` for `authenticated` with `USING (auth.uid() = user_id)` and `WITH CHECK (auth.uid() = user_id)`.
4. **Authenticated Insert**: `INSERT` for `authenticated` with `WITH CHECK (true)`.
5. **Custom**: Freeform SQL boolean expressions.

---

## 4. SQL Workspace & Query Execution Engine

The interactive SQL Editor (`/dashboard/projects/[id]/database/sql-editor`) enables developers to run arbitrary queries directly against their tenant database schema.

### A. Monaco Editor Frontend Integration

- **Editor Engine**: Powered by `@monaco-editor/react` (VS Code's editor core).
- **Custom Theme (`baas-dark`)**: Styled to match `#090D16` input background with custom syntax highlighting tokens for SQL keywords, strings, identifiers, and comments.
- **Schema-Aware Autocompletion**: Registers a PostgreSQL completion provider providing real-time suggestions for:
  - Standard SQL keywords (`SELECT`, `JOIN`, `WHERE`, `GROUP BY`, etc.).
  - Project-specific table names (derived from the project overview).
  - Project-specific column names and data types.
- **Execution Shortcuts**: `Cmd + Enter` (macOS) and `Ctrl + Enter` (Linux / Windows) immediately trigger execution without requiring a mouse click.
- **Local Query History**: Successfully run or saved queries are persisted in `localStorage` under `baas_sql_history_${projectId}` for instant recall.

### B. Backend Execution Sandbox & Security

- **Endpoint**: `POST /api/v1/project/:id/database/query`
- **Payload**: `{ sql: string }` (maximum 20,000 characters).
- **Schema Isolation**: The query executes within a PostgreSQL transaction with:
  ```sql
  SET LOCAL search_path = quote(project.schemaName), public;
  ```
  This allows queries like `SELECT * FROM posts` to automatically resolve to the tenant's isolated schema without leaking other tenants' tables.
- **Denial-of-Service & Lock Prevention**:
  ```sql
  SET LOCAL statement_timeout = '15s';
  ```
  A strict 15-second cap prevents runaway Cartesian joins or locks from degrading database performance.
- **Administrative Command Blacklist**: Reject destructive cluster-level commands before execution (`ALTER SYSTEM`, `DROP DATABASE`, `CREATE DATABASE`, `COPY ... PROGRAM`, `pg_read_file`, `pg_write_file`).
- **Safe Data Serialization**:
  - `BigInt` values are serialized to strings.
  - `Date` instances are formatted as ISO 8601 strings.
  - Binary buffers are formatted as hex strings (`\x...`).
- **Performance Capping**: Result payloads are capped at 500 rows per query to preserve browser DOM rendering speed and avoid memory pressure.

