import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

/**
 * Shared shape of the raw rows returned by the introspection queries below.
 * PostgreSQL returns counts/sizes as bigint; Prisma surfaces them as bigint
 * (or numeric strings depending on driver version) — normalised in-service.
 */
interface TenantTableRow {
  table_name: string;
  row_count: bigint | number | string;
  total_bytes: bigint | number | string;
  last_vacuum: Date | string | null;
  last_autovacuum: Date | string | null;
  rls_enabled: boolean | number | string | null;
}

// ── Formatting helpers (exported for unit testing) ────────────────────────────

/**
 * Convert a byte count into a compact human-readable label.
 * Uses binary units (KiB/MiB/GiB) but with the conventional "KB/MB/GB" labels
 * used across the dashboard design.
 */
export function formatBytes(bytes: bigint | number | string): string {
  const b = typeof bytes === 'bigint' ? Number(bytes) : Number(bytes);
  if (!Number.isFinite(b) || b <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = b;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  // Whole numbers below 10 get one decimal (e.g. "3.2 GB"), otherwise round.
  const rounded = value >= 10 ? Math.round(value).toString() : value.toFixed(1).replace(/\.0$/, '');
  return `${rounded} ${units[i]}`;
}

/** Relative "time ago" label matching the presenter style used elsewhere. */
export function timeAgo(date: Date | string | null, now: Date = new Date()): string {
  if (!date) return 'Never';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return 'Never';
  const diffMins = Math.floor((now.getTime() - d.getTime()) / 60_000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
}

/** Coerce pg numeric/text aggregates (bigint strings) to JS numbers safely. */
function toNumber(value: bigint | number | string | null): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === 'bigint' ? Number(value) : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Coerce pg boolean-ish values to a real boolean. */
function toBoolean(value: boolean | number | string | null): boolean {
  return value === true || value === 1 || value === '1' || value === 't';
}

/**
 * Best-effort "last data modification" label for a table.
 *
 * PostgreSQL does not track a per-table last-write timestamp by default, so we
 * use the most recent vacuum/autovacuum activity from pg_stat_user_tables as
 * the practical proxy (it runs after meaningful data churn). Tables that were
 * never vacuumed fall back to "Never".
 */
export function lastModifiedLabel(
  row: Pick<TenantTableRow, 'last_vacuum' | 'last_autovacuum'>,
  now: Date = new Date(),
): string {
  const candidates = [row.last_vacuum, row.last_autovacuum]
    .map((v) => (v ? new Date(v as string | Date) : null))
    .filter((d): d is Date => d !== null && !Number.isNaN(d.getTime()));

  if (candidates.length === 0) return 'Never';
  const latest = new Date(Math.max(...candidates.map((d) => d.getTime())));
  return timeAgo(latest, now);
}

/**
 * Database module service.
 *
 * Introspects a project's tenant schema (created by the DB provisioning
 * worker: CREATE ROLE `role_proj_*` + CREATE SCHEMA `proj_*`) using only
 * parameterised queries — the schema name is never interpolated into SQL.
 */
@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve the tenant metadata for an owned project.
   * Throws NotFoundException when the project does not exist or is not owned
   * by the requesting user (mirrors ProjectService ownership checks).
   */
  private async resolveTenant(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { id: true, schemaName: true, status: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  /**
   * Full database overview for the dashboard:
   * header stats (size / tables / connections) + per-table rows.
   */
  async getOverview(projectId: string, userId: string) {
    const project = await this.resolveTenant(projectId, userId);

    // A PENDING project has no schema yet (worker still provisioning);
    // PAUSED projects keep their data, so they are still introspectable.
    if (project.status === 'PENDING') {
      return {
        stats: { size: '0 B', totalTables: 0, activeConnections: 0 },
        tables: [],
      };
    }

    const [tableRows, schemaBytes, activeConnections] = await Promise.all([
      this.listTables(project.schemaName),
      this.schemaSizeBytes(project.schemaName),
      this.countActiveConnections(),
    ]);

    const now = new Date();

    const tables = tableRows.map((row) => ({
      name: row.table_name,
      rows: toNumber(row.row_count),
      size: formatBytes(row.total_bytes),
      lastModified: lastModifiedLabel(row, now),
      rls: toBoolean(row.rls_enabled) ? ('active' as const) : ('disabled' as const),
    }));

    return {
      stats: {
        size: formatBytes(schemaBytes),
        totalTables: tables.length,
        activeConnections,
      },
      tables,
    };
  }

  /**
   * List base tables of the tenant schema with row counts, total size
   * (table + indexes + TOAST), last-modified proxy and RLS state.
   *
   * Security notes:
   *  - `$queryRaw` uses bound parameters only; the schema name is never
   *    string-interpolated into SQL, so there is no injection surface.
   *  - pg_stat_user_tables is already scoped per-schema via the join below,
   *    guaranteeing a tenant can only ever see its own tables.
   */
  private listTables(schemaName: string): Promise<TenantTableRow[]> {
    return this.prisma.$queryRaw<TenantTableRow[]>`
      SELECT
        c.relname                          AS table_name,
        COALESCE(s.n_live_tup, 0)::bigint  AS row_count,
        pg_total_relation_size(c.oid)::bigint AS total_bytes,
        s.last_vacuum                      AS last_vacuum,
        s.last_autovacuum                  AS last_autovacuum,
        (
          c.relrowsecurity
          OR EXISTS (
            SELECT 1
            FROM pg_policies p
            WHERE p.schemaname = n.nspname
              AND p.tablename = c.relname
          )
        )                                  AS rls_enabled
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN pg_stat_user_tables s
        ON s.schemaname = n.nspname
       AND s.relname = c.relname
      WHERE n.nspname = ${schemaName}
        AND c.relkind = 'r'
      ORDER BY c.relname ASC;
    `;
  }

  /** Total on-disk size of every relation living in the tenant schema. */
  private async schemaSizeBytes(schemaName: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<{ total: bigint | null }[]>`
      SELECT COALESCE(SUM(pg_total_relation_size(c.oid)), 0)::bigint AS total
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = ${schemaName}
        AND c.relkind IN ('r', 'i', 't');
    `;
    return toNumber(rows[0]?.total ?? 0);
  }

  /**
   * Count live backend connections attributed to the project's tenant role.
   *
   * The provisioning worker (db.processor.ts) creates a dedicated LOGIN role
   * per project named `role_proj_<token6>` while the schema is
   * `proj_<token12>` — the tokens differ, so exact equality is impossible.
   * We therefore count client backends whose usename starts with the
   * `role_` prefix that only tenant roles carry (platform/admin roles use
   * different names). This slightly over-counts across concurrent tenants;
   * precise attribution requires storing dbRole on the Project row and is
   * tracked as a follow-up.
   */
  private async countActiveConnections(): Promise<number> {
    const rows = await this.prisma.$queryRaw<{ cnt: bigint | null }[]>`
      SELECT COUNT(*)::bigint AS cnt
      FROM pg_stat_activity
      WHERE usename LIKE 'role_%'
        AND backend_type = 'client backend';
    `;
    return toNumber(rows[0]?.cnt ?? 0);
  }

  /**
   * Single-table metadata used by the table detail page.
   * Reuses the same introspection primitives; throws NotFound if the table
   * does not belong to the tenant schema (prevents cross-tenant reads).
   */
  async getTable(projectId: string, tableName: string, userId: string) {
    const safeName = tableName.toLowerCase();
    if (!/^[a-z0-9_]+$/.test(safeName)) {
      throw new BadRequestException('Invalid table name');
    }

    const overview = await this.getOverview(projectId, userId);
    const table = overview.tables.find((t) => t.name.toLowerCase() === safeName);

    if (!table) {
      throw new NotFoundException(`Table "${tableName}" not found`);
    }

    return table;
  }
}
