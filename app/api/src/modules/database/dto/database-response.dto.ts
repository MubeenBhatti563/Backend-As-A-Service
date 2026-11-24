import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Response DTOs for the Database module.
 *
 * These schemas are the API contract for
 * `GET /api/v1/project/:id/database/overview` and mirror the shared
 * TypeScript types in `@baas/types` (packages/types/src/database.ts) so the
 * web dashboard can consume them without any hand-written mapping layer.
 */

// ── Sub-schemas ───────────────────────────────────────────────────────────────

/**
 * Row-Level Security state of a tenant table.
 * "active"   → at least one ENABLED RLS policy exists on the table.
 * "disabled" → no enabled policies (table protected only by role grants).
 */
export const RlsStatusSchema = z.enum(['active', 'disabled']);

/** A single base table inside a project's tenant schema. */
export const DatabaseTableSchema = z.object({
  /** Table name, e.g. "users". */
  name: z.string(),
  /** Exact row count (SELECT COUNT(*) per table). */
  rows: z.number().int().nonnegative(),
  /** Human-readable size from pg_total_relation_size(), e.g. "12 MB". */
  size: z.string(),
  /** Last data modification label ("Just now", "5m ago", …) or "Never". */
  lastModified: z.string(),
  /** Derived from pg_policies (count of ENABLED policies > 0). */
  rls: RlsStatusSchema,
});

/** Aggregate stats rendered in the database header strip. */
export const DatabaseStatsSchema = z.object({
  /** Total size of the whole tenant schema, human-readable (e.g. "3.2 GB"). */
  size: z.string(),
  /** Number of base tables in the tenant schema. */
  totalTables: z.number().int().nonnegative(),
  /** Live backend connections attributed to the project's tenant role. */
  activeConnections: z.number().int().nonnegative(),
});

// ── Top-level response ────────────────────────────────────────────────────────

export const DatabaseOverviewResponseSchema = z.object({
  stats: DatabaseStatsSchema,
  tables: z.array(DatabaseTableSchema),
});

export class DatabaseOverviewResponseDto extends createZodDto(
  DatabaseOverviewResponseSchema,
) {}
