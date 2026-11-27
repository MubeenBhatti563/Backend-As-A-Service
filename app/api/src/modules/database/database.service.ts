import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import type {
  ErColumn,
  ErRelation,
  ErTable,
  RelationTone,
  RelationshipsData,
  TableIndexesResponse,
  TableRelationshipItem,
  TableRelationshipsResponse,
  TableStructureColumn,
  TableStructureResponse,
  TablePoliciesResponse,
  PolicyCommand,
  ExecuteQueryResult,
} from '@baas/types';
import { PrismaService } from '../../infra/prisma/prisma.service';
import type {
  AddColumnDto,
  CreateIndexDto,
  CreateTableDto,
  InsertRowDto,
  CreatePolicyDto,
} from './dto/create-table.dto';

const IDENTIFIER = /^[a-z_][a-z0-9_]{0,62}$/;
const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
const SQL_TYPES: Record<string, string> = {
  text: 'TEXT',
  integer: 'INTEGER',
  bigint: 'BIGINT',
  boolean: 'BOOLEAN',
  uuid: 'UUID',
  timestamptz: 'TIMESTAMPTZ',
  jsonb: 'JSONB',
};
const CAST_TYPES: Record<string, string> = {
  text: 'TEXT',
  'character varying': 'TEXT',
  integer: 'INTEGER',
  bigint: 'BIGINT',
  boolean: 'BOOLEAN',
  uuid: 'UUID',
  jsonb: 'JSONB',
  'timestamp with time zone': 'TIMESTAMPTZ',
  'timestamp without time zone': 'TIMESTAMP',
  date: 'DATE',
  numeric: 'NUMERIC',
  'double precision': 'DOUBLE PRECISION',
  real: 'REAL',
};
const isSensitiveColumn = (name: string) =>
  /password|secret|token|api[_]?key|private[_]?key/i.test(name);
const normalizedType = (type: string) =>
  type
    .toLowerCase()
    .replace(/\(\d+(?:,\s*\d+)?\)/g, '')
    .trim();
const castTypeFor = (type: string) => CAST_TYPES[normalizedType(type)];
const isManagedTimestamp = (name: string, type: string, hasDefault: boolean) =>
  hasDefault &&
  ['created_at', 'updated_at'].includes(name) &&
  normalizedType(type).startsWith('timestamp');

function prettyBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = -1;
  do {
    value /= 1024;
    unit += 1;
  } while (value >= 1024 && unit < units.length - 1);
  return `${Number(value.toFixed(2))} ${units[unit]}`;
}

function formatColumnType(rawType: string): string {
  const lower = rawType.toLowerCase();
  if (lower.startsWith('character varying') || lower.startsWith('varchar'))
    return 'varchar';
  if (
    lower.startsWith('timestamp with time zone') ||
    lower.startsWith('timestamptz')
  )
    return 'timestamptz';
  if (lower.startsWith('timestamp without time zone')) return 'timestamp';
  if (lower === 'integer' || lower === 'int4') return 'integer';
  if (lower === 'bigint' || lower === 'int8') return 'bigint';
  if (lower === 'smallint' || lower === 'int2') return 'smallint';
  if (lower.startsWith('numeric')) return 'numeric';
  return lower.replace(/\(\d+(?:,\s*\d+)?\)/g, '').trim();
}

function cellKind(type: string, name: string) {
  const lower = type.toLowerCase();
  if (name === 'id' || lower === 'uuid') return 'uuid';
  if (
    name === 'created_at' ||
    name === 'updated_at' ||
    lower.includes('timestamp')
  )
    return 'timestamp';
  if (name === 'role') return 'role';
  if (name.includes('status') || lower === 'boolean') return 'status';
  return name === 'name' || name === 'email' ? 'primary' : 'secondary';
}

@Injectable()
export class DatabaseService {
  constructor(private readonly prisma: PrismaService) {}

  private async getProject(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { id: true, schemaName: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (!IDENTIFIER.test(project.schemaName))
      throw new NotFoundException('Database not found');
    return project;
  }

  async getOverview(projectId: string, userId: string) {
    const project = await this.getProject(projectId, userId);
    const tables = await this.prisma.$queryRawUnsafe<
      Array<{
        name: string;
        rows: bigint | number;
        bytes: bigint | number;
        dataBytes: bigint | number;
        indexBytes: bigint | number;
        rls: boolean;
        modified: Date | null;
      }>
    >(
      `SELECT c.relname AS name,
        GREATEST(
          COALESCE(s.n_live_tup, 0),
          c.reltuples::bigint,
          0
        ) AS rows,
        pg_total_relation_size(c.oid) AS bytes,
        pg_relation_size(c.oid) AS "dataBytes",
        pg_indexes_size(c.oid) AS "indexBytes",
        c.relrowsecurity AS rls,
        (SELECT MAX(GREATEST(st.last_vacuum, st.last_autovacuum, st.last_analyze, st.last_autoanalyze))
          FROM pg_stat_user_tables st WHERE st.schemaname = n.nspname AND st.relname = c.relname) AS modified
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       LEFT JOIN pg_stat_user_tables s ON s.schemaname = n.nspname AND s.relname = c.relname
       WHERE n.nspname = $1 AND c.relkind IN ('r', 'p') ORDER BY c.relname`,
      project.schemaName,
    );

    const uncounted = tables.filter((table) => Number(table.rows) === 0);
    if (uncounted.length > 0) {
      await Promise.all(
        uncounted.map(async (table) => {
          try {
            const countResult = await this.prisma.$queryRawUnsafe<
              Array<{ count: bigint | number }>
            >(
              `SELECT COUNT(*)::bigint AS count FROM ${quote(project.schemaName)}.${quote(table.name)}`,
            );
            table.rows = countResult[0]?.count ?? 0n;
          } catch {
            // Keep estimated 0 if table was concurrently dropped
          }
        }),
      );
    }
    const sizeRows = await this.prisma.$queryRawUnsafe<
      Array<{ bytes: bigint | number }>
    >(
      "SELECT COALESCE(SUM(pg_total_relation_size(c.oid)), 0)::bigint AS bytes FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = $1 AND c.relkind IN ('r', 'p')",
      project.schemaName,
    );
    const connectionRows = await this.prisma.$queryRaw<
      Array<{ count: bigint | number }>
    >`
      SELECT COUNT(*)::bigint AS count FROM pg_stat_activity WHERE datname = current_database()`;

    return {
      stats: {
        size: prettyBytes(Number(sizeRows[0]?.bytes ?? 0)),
        totalTables: tables.length,
        activeConnections: Number(connectionRows[0]?.count ?? 0),
      },
      tables: tables.map((table) => ({
        name: table.name,
        rows: Number(table.rows),
        size: prettyBytes(Number(table.bytes)),
        sizeBytes: String(table.bytes),
        dataSizeBytes: String(table.dataBytes),
        indexSizeBytes: String(table.indexBytes),
        lastMaintained: table.modified
          ? new Date(table.modified).toISOString()
          : null,
        rls: table.rls ? 'active' : 'disabled',
      })),
    };
  }

  async getIndexes(projectId: string, userId: string) {
    const project = await this.getProject(projectId, userId);
    const [indexes, databaseStatsRows] = await Promise.all([
      this.prisma.$queryRawUnsafe<
        Array<{
          name: string;
          tableName: string;
          method: string;
          columns: string[];
          isUnique: boolean;
          isPrimary: boolean;
          isValid: boolean;
          definition: string;
          sizeBytes: bigint | number;
        }>
      >(
        `SELECT index_class.relname AS name,
          table_class.relname AS "tableName",
          access_method.amname AS method,
          COALESCE((
            SELECT array_agg(pg_get_indexdef(index_meta.indexrelid, keys.position, true) ORDER BY keys.position)
            FROM generate_series(1, index_meta.indnatts) AS keys(position)
          ), ARRAY[]::text[]) AS columns,
          index_meta.indisunique AS "isUnique",
          index_meta.indisprimary AS "isPrimary",
          index_meta.indisvalid AS "isValid",
          pg_get_indexdef(index_meta.indexrelid) AS definition,
          pg_relation_size(index_meta.indexrelid)::bigint AS "sizeBytes"
         FROM pg_index index_meta
         JOIN pg_class index_class ON index_class.oid = index_meta.indexrelid
         JOIN pg_class table_class ON table_class.oid = index_meta.indrelid
         JOIN pg_namespace table_namespace ON table_namespace.oid = table_class.relnamespace
         JOIN pg_am access_method ON access_method.oid = index_class.relam
         WHERE table_namespace.nspname = $1 AND table_class.relkind IN ('r', 'p')
         ORDER BY table_class.relname, index_class.relname`,
        project.schemaName,
      ),
      this.prisma.$queryRawUnsafe<
        Array<{
          size: string;
          totalTables: bigint | number;
          activeConnections: bigint | number;
        }>
      >(
        `SELECT pg_size_pretty(COALESCE(SUM(pg_total_relation_size(c.oid)), 0)::bigint) AS size,
          COUNT(c.oid)::bigint AS "totalTables",
          (SELECT COUNT(*)::bigint FROM pg_stat_activity WHERE datname = current_database()) AS "activeConnections"
         FROM pg_class c
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = $1 AND c.relkind IN ('r', 'p')`,
        project.schemaName,
      ),
    ]);
    const totalSizeBytes = indexes.reduce(
      (total, index) => total + BigInt(index.sizeBytes),
      0n,
    );

    return {
      stats: {
        totalIndexes: indexes.length,
        uniqueIndexes: indexes.filter((index) => index.isUnique).length,
        totalSizeBytes: totalSizeBytes.toString(),
      },
      databaseStats: {
        size: databaseStatsRows[0]?.size ?? '0 B',
        totalTables: Number(databaseStatsRows[0]?.totalTables ?? 0),
        activeConnections: Number(databaseStatsRows[0]?.activeConnections ?? 0),
      },
      indexes: indexes.map((index) => ({
        ...index,
        sizeBytes: String(index.sizeBytes),
      })),
    };
  }

  async getRelationships(
    projectId: string,
    userId: string,
  ): Promise<RelationshipsData> {
    const project = await this.getProject(projectId, userId);

    const [columnsRaw, relationsRaw] = await Promise.all([
      this.prisma.$queryRawUnsafe<
        Array<{
          tableName: string;
          columnName: string;
          type: string;
          isPrimary: boolean;
          isForeignKey: boolean;
        }>
      >(
        `SELECT
          c.relname AS "tableName",
          a.attname AS "columnName",
          format_type(a.atttypid, a.atttypmod) AS type,
          EXISTS (
            SELECT 1 FROM pg_index i
            WHERE i.indrelid = c.oid AND i.indisprimary AND a.attnum = ANY(i.indkey)
          ) AS "isPrimary",
          EXISTS (
            SELECT 1 FROM pg_constraint fk_con
            WHERE fk_con.conrelid = c.oid AND fk_con.contype = 'f' AND a.attnum = ANY(fk_con.conkey)
          ) AS "isForeignKey"
         FROM pg_attribute a
         JOIN pg_class c ON c.oid = a.attrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = $1
           AND c.relkind IN ('r', 'p')
           AND a.attnum > 0
           AND NOT a.attisdropped
         ORDER BY c.relname, a.attnum`,
        project.schemaName,
      ),
      this.prisma.$queryRawUnsafe<
        Array<{
          constraintName: string;
          childTable: string;
          childColumn: string;
          parentTable: string;
          parentColumn: string;
          isUnique: boolean;
        }>
      >(
        `SELECT
          con.conname AS "constraintName",
          src.relname AS "childTable",
          src_attr.attname AS "childColumn",
          ref.relname AS "parentTable",
          ref_attr.attname AS "parentColumn",
          EXISTS (
            SELECT 1 FROM pg_constraint u
            WHERE u.conrelid = src.oid
              AND u.contype IN ('p', 'u')
              AND u.conkey = ARRAY[src_attr.attnum]::smallint[]
          ) AS "isUnique"
         FROM pg_constraint con
         JOIN pg_class src ON src.oid = con.conrelid
         JOIN pg_namespace src_ns ON src_ns.oid = src.relnamespace
         JOIN LATERAL unnest(con.conkey, con.confkey) WITH ORDINALITY AS key_pair(local_attnum, ref_attnum, position) ON TRUE
         JOIN pg_attribute src_attr ON src_attr.attrelid = src.oid AND src_attr.attnum = key_pair.local_attnum
         JOIN pg_class ref ON ref.oid = con.confrelid
         JOIN pg_namespace ref_ns ON ref_ns.oid = ref.relnamespace
         JOIN pg_attribute ref_attr ON ref_attr.attrelid = ref.oid AND ref_attr.attnum = key_pair.ref_attnum
         WHERE con.contype = 'f'
           AND src_ns.nspname = $1
           AND ref_ns.nspname = $1
         ORDER BY con.conname, key_pair.position`,
        project.schemaName,
      ),
    ]);

    const tableColumnsMap = new Map<string, ErColumn[]>();
    for (const col of columnsRaw) {
      let list = tableColumnsMap.get(col.tableName);
      if (!list) {
        list = [];
        tableColumnsMap.set(col.tableName, list);
      }
      let key: 'pk' | 'fk' | undefined;
      if (col.isPrimary) key = 'pk';
      else if (col.isForeignKey) key = 'fk';

      list.push({
        name: col.columnName,
        type: formatColumnType(col.type),
        ...(key ? { key } : {}),
      });
    }

    const tableNames = Array.from(tableColumnsMap.keys());

    const dependencies = new Map<string, Set<string>>();
    for (const name of tableNames) {
      dependencies.set(name, new Set());
    }
    for (const r of relationsRaw) {
      if (r.childTable !== r.parentTable) {
        dependencies.get(r.childTable)?.add(r.parentTable);
      }
    }

    const ranks = new Map<string, number>();
    const getRank = (
      tableName: string,
      visited = new Set<string>(),
    ): number => {
      if (ranks.has(tableName)) return ranks.get(tableName)!;
      if (visited.has(tableName)) return 0;
      visited.add(tableName);
      const deps = dependencies.get(tableName);
      if (!deps || deps.size === 0) {
        ranks.set(tableName, 0);
        return 0;
      }
      let maxRank = 0;
      for (const parent of deps) {
        maxRank = Math.max(maxRank, getRank(parent, new Set(visited)) + 1);
      }
      ranks.set(tableName, maxRank);
      return maxRank;
    };

    for (const name of tableNames) {
      getRank(name);
    }

    const layers = new Map<number, string[]>();
    for (const name of tableNames) {
      const rank = ranks.get(name) ?? 0;
      if (!layers.has(rank)) layers.set(rank, []);
      layers.get(rank)!.push(name);
    }

    const sortedRanks = Array.from(layers.keys()).sort((a, b) => a - b);
    const positions = new Map<string, { x: number; y: number }>();

    if (sortedRanks.length <= 1) {
      tableNames.forEach((tName, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        positions.set(tName, {
          x: 40 + col * 320,
          y: 60 + row * 260,
        });
      });
    } else {
      for (let colIdx = 0; colIdx < sortedRanks.length; colIdx++) {
        const rank = sortedRanks[colIdx];
        const tablesInLayer = layers.get(rank)!;
        tablesInLayer.forEach((tName, rowIdx) => {
          positions.set(tName, {
            x: 40 + colIdx * 340,
            y: 60 + rowIdx * 260,
          });
        });
      }
    }

    const tables: ErTable[] = tableNames.map((name) => {
      const pos = positions.get(name) ?? { x: 40, y: 60 };
      return {
        id: name,
        name,
        x: pos.x,
        y: pos.y,
        columns: tableColumnsMap.get(name) ?? [],
      };
    });

    const TONES: RelationTone[] = ['secondary', 'warning', 'info'];

    const relations: ErRelation[] = relationsRaw.map((r, idx) => ({
      id: `${r.childTable}-${r.childColumn}-${r.parentTable}-${r.parentColumn}`,
      from: { table: r.parentTable, column: r.parentColumn },
      to: { table: r.childTable, column: r.childColumn },
      cardinality: r.isUnique ? '1:1' : '1:N',
      tone: TONES[idx % TONES.length],
    }));

    return { tables, relations };
  }

  async getTable(
    projectId: string,
    userId: string,
    tableName: string,
    rawPage?: string,
    rawPageSize?: string,
    search?: string,
  ) {
    if (!IDENTIFIER.test(tableName))
      throw new BadRequestException('Invalid table name');
    const page = rawPage === undefined ? 1 : Number(rawPage);
    const pageSize = rawPageSize === undefined ? 10 : Number(rawPageSize);
    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 100
    ) {
      throw new BadRequestException('Invalid pagination');
    }
    const project = await this.getProject(projectId, userId);
    const columnsMeta = await this.prisma.$queryRawUnsafe<
      Array<{
        name: string;
        type: string;
        primary: boolean;
        estimatedRows: bigint | number;
        writable: boolean;
        nullable: boolean;
        hasDefault: boolean;
        isForeignKey: boolean;
        foreignKeyTable: string | null;
        foreignKeyColumn: string | null;
      }>
    >(
      `SELECT a.attname AS name, format_type(a.atttypid, a.atttypmod) AS type,
        EXISTS (SELECT 1 FROM pg_index i WHERE i.indrelid = c.oid AND i.indisprimary AND a.attnum = ANY(i.indkey)) AS primary
        , GREATEST(c.reltuples::bigint, 0) AS "estimatedRows",
      (a.attgenerated = '' AND a.attidentity = '') AS writable,
        d.adbin IS NOT NULL AS "hasDefault",
        EXISTS (SELECT 1 FROM pg_constraint fk_con WHERE fk_con.conrelid = c.oid AND fk_con.contype = 'f' AND a.attnum = ANY(fk_con.conkey)) AS "isForeignKey",
        NOT a.attnotnull AS nullable,
        fk.ref_table AS "foreignKeyTable", fk.ref_column AS "foreignKeyColumn"
       FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid JOIN pg_namespace n ON n.oid = c.relnamespace
       LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
       LEFT JOIN LATERAL (
         SELECT ref.relname AS ref_table, ref_attr.attname AS ref_column
         FROM pg_constraint con
         JOIN LATERAL unnest(con.conkey, con.confkey) WITH ORDINALITY AS key_pair(local_attnum, ref_attnum, position) ON TRUE
         JOIN pg_class ref ON ref.oid = con.confrelid
         JOIN pg_namespace ref_ns ON ref_ns.oid = ref.relnamespace
         JOIN pg_attribute ref_attr ON ref_attr.attrelid = ref.oid AND ref_attr.attnum = key_pair.ref_attnum
         WHERE con.conrelid = c.oid AND con.contype = 'f' AND key_pair.local_attnum = a.attnum AND ref_ns.nspname = $1
         ORDER BY con.oid LIMIT 1
       ) fk ON TRUE
       WHERE n.nspname = $1 AND c.relname = $2 AND c.relkind IN ('r', 'p') AND a.attnum > 0 AND NOT a.attisdropped
       ORDER BY a.attnum`,
      project.schemaName,
      tableName,
    );
    if (columnsMeta.length === 0)
      throw new NotFoundException('Table not found');
    const schema = quote(project.schemaName);
    const table = quote(tableName);
    const visibleColumns = columnsMeta.filter(
      (column) => !isSensitiveColumn(column.name),
    );
    const primary = columnsMeta.find(
      (column) => column.primary && !isSensitiveColumn(column.name),
    )?.name;
    const projection = [
      primary ? `${quote(primary)} AS "__row_id"` : 'ctid::text AS "__row_id"',
      ...visibleColumns.map((column) => quote(column.name)),
    ].join(', ');
    const orderBy = primary ? quote(primary) : 'ctid';
    const trimmedSearch = search?.trim();
    const queryParams: unknown[] = [];
    let paramIndex = 1;
    let whereClause = '';

    if (trimmedSearch) {
      const searchPattern = `%${trimmedSearch}%`;
      const searchExprs = visibleColumns.map(
        (col) => `CAST(${quote(col.name)} AS TEXT) ILIKE $${paramIndex}`,
      );
      if (searchExprs.length > 0) {
        whereClause = ` WHERE (${searchExprs.join(' OR ')})`;
        queryParams.push(searchPattern);
        paramIndex++;
      }
    }

    const records = await this.prisma.$queryRawUnsafe<
      Array<Record<string, unknown>>
    >(
      `SELECT ${projection} FROM ${schema}.${table}${whereClause} ORDER BY ${orderBy} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      ...queryParams,
      pageSize,
      (page - 1) * pageSize,
    );
    const columns = visibleColumns.map((column) => ({
      key: column.name,
      label: column.name,
      kind: cellKind(column.type, column.name),
      writable:
        column.writable &&
        Boolean(castTypeFor(column.type)) &&
        !isManagedTimestamp(column.name, column.type, column.hasDefault),
      nullable: column.nullable,
      hasDefault:
        column.hasDefault ||
        (normalizedType(column.type) === 'uuid' && !column.isForeignKey),
      dataType: column.type,
      foreignKey:
        column.foreignKeyTable && column.foreignKeyColumn
          ? {
              tableName: column.foreignKeyTable,
              columnName: column.foreignKeyColumn,
            }
          : undefined,
    }));
    const rows = records.map((record) => {
      const row: Record<string, string> = { id: String(record.__row_id) };
      for (const column of visibleColumns) {
        const value = record[column.name];
        row[column.name] =
          value == null
            ? 'NULL'
            : value instanceof Date
              ? value.toISOString()
              : typeof value === 'object'
                ? (JSON.stringify(value) ?? '')
                : ['string', 'number', 'bigint', 'boolean'].includes(
                      typeof value,
                    )
                  ? String(value)
                  : '';
      }
      return row;
    });
    const countRows = await this.prisma.$queryRawUnsafe<
      Array<{ count: bigint }>
    >(
      `SELECT COUNT(*)::bigint AS count FROM ${schema}.${table}${whereClause}`,
      ...queryParams,
    );
    const totalRows = Number(countRows[0]?.count ?? 0n);
    const tableStats = await this.prisma.$queryRawUnsafe<
      Array<{ bytes: bigint | number; rls: boolean }>
    >(
      `SELECT pg_total_relation_size(c.oid) AS bytes, c.relrowsecurity AS rls FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = $1 AND c.relname = $2`,
      project.schemaName,
      tableName,
    );
    return {
      table: {
        name: tableName,
        rows: totalRows,
        size: prettyBytes(Number(tableStats[0]?.bytes ?? 0)),
        sizeBytes: String(tableStats[0]?.bytes ?? 0),
        lastMaintained: null,
        rls: tableStats[0]?.rls ? 'active' : 'disabled',
      },
      columns,
      rows,
      pagination: { page, pageSize, totalRows },
    };
  }

  async createTable(projectId: string, userId: string, dto: CreateTableDto) {
    const project = await this.getProject(projectId, userId);
    if (!IDENTIFIER.test(dto.name) || dto.columns.length > 30)
      throw new BadRequestException('Invalid table definition');
    const tableExists = await this.prisma.$queryRawUnsafe<
      Array<{ exists: boolean }>
    >(
      "SELECT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = $1 AND c.relname = $2 AND c.relkind IN ('r', 'p')) AS exists",
      project.schemaName,
      dto.name,
    );
    if (tableExists[0]?.exists)
      throw new ConflictException('A table with this name already exists');
    const names = new Set<string>(['id']);
    const definitions = ['"id" UUID PRIMARY KEY DEFAULT gen_random_uuid()'];
    for (const column of dto.columns) {
      if (
        !IDENTIFIER.test(column.name) ||
        names.has(column.name) ||
        !SQL_TYPES[column.type]
      ) {
        throw new BadRequestException('Invalid or duplicate column definition');
      }
      names.add(column.name);

      let defaultSql = '';
      if (
        column.defaultValue !== undefined &&
        column.defaultValue.trim() !== ''
      ) {
        const def = column.defaultValue.trim();
        if (column.type === 'boolean') {
          if (['true', 'false'].includes(def.toLowerCase())) {
            defaultSql = ` DEFAULT ${def.toLowerCase()}`;
          } else {
            throw new BadRequestException(
              `Default value for boolean column "${column.name}" must be true or false`,
            );
          }
        } else if (column.type === 'integer' || column.type === 'bigint') {
          if (/^-?\d+$/.test(def)) {
            defaultSql = ` DEFAULT ${def}`;
          } else {
            throw new BadRequestException(
              `Default value for "${column.name}" must be a number`,
            );
          }
        } else if (column.type === 'uuid') {
          if (
            def.toLowerCase() === 'gen_random_uuid()' ||
            def.toLowerCase() === 'uuid_generate_v4()'
          ) {
            defaultSql = ' DEFAULT gen_random_uuid()';
          } else if (
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              def,
            )
          ) {
            defaultSql = ` DEFAULT '${def}'::uuid`;
          } else {
            throw new BadRequestException(
              `Default value for uuid column "${column.name}" must be a UUID or gen_random_uuid()`,
            );
          }
        } else if (column.type === 'timestamptz') {
          if (['now()', 'current_timestamp'].includes(def.toLowerCase())) {
            defaultSql = ' DEFAULT CURRENT_TIMESTAMP';
          } else {
            defaultSql = ` DEFAULT '${def.replace(/'/g, "''")}'::timestamptz`;
          }
        } else if (column.type === 'jsonb') {
          try {
            JSON.parse(def);
            defaultSql = ` DEFAULT '${def.replace(/'/g, "''")}'::jsonb`;
          } catch {
            throw new BadRequestException(
              `Default value for jsonb column "${column.name}" must be valid JSON`,
            );
          }
        } else {
          defaultSql = ` DEFAULT '${def.replace(/'/g, "''")}'`;
        }
      } else if (column.type === 'uuid' && !column.foreignKey) {
        defaultSql = ' DEFAULT gen_random_uuid()';
      }

      let fkSql = '';
      if (column.foreignKey) {
        const refTable = column.foreignKey.table.trim();
        const refCol = column.foreignKey.column.trim();
        if (!IDENTIFIER.test(refTable) || !IDENTIFIER.test(refCol)) {
          throw new BadRequestException('Invalid foreign key identifiers');
        }
        const refExists = await this.prisma.$queryRawUnsafe<
          Array<{ exists: boolean }>
        >(
          `SELECT EXISTS (
             SELECT 1 FROM pg_attribute a
             JOIN pg_class c ON c.oid = a.attrelid
             JOIN pg_namespace n ON n.oid = c.relnamespace
             WHERE n.nspname = $1 AND c.relname = $2 AND a.attname = $3 AND a.attnum > 0 AND NOT a.attisdropped
          ) AS exists`,
          project.schemaName,
          refTable,
          refCol,
        );
        if (!refExists[0]?.exists) {
          throw new BadRequestException(
            `Referenced table or column "${refTable}"."${refCol}" does not exist`,
          );
        }
        fkSql = ` REFERENCES ${quote(project.schemaName)}.${quote(refTable)}(${quote(refCol)}) ON DELETE ${column.nullable ? 'SET NULL' : 'CASCADE'}`;
      }

      const uniqueSql = column.isUnique ? ' UNIQUE' : '';
      definitions.push(
        `${quote(column.name)} ${SQL_TYPES[column.type]}${defaultSql}${column.nullable ? '' : ' NOT NULL'}${uniqueSql}${fkSql}`,
      );
    }
    await this.prisma.$executeRawUnsafe(
      `CREATE TABLE ${quote(project.schemaName)}.${quote(dto.name)} (${definitions.join(', ')})`,
    );
    if (dto.enableRls) {
      await this.prisma.$executeRawUnsafe(
        `ALTER TABLE ${quote(project.schemaName)}.${quote(dto.name)} ENABLE ROW LEVEL SECURITY`,
      );
    }
    return { name: dto.name };
  }

  async dropTable(projectId: string, userId: string, tableName: string) {
    if (!IDENTIFIER.test(tableName))
      throw new BadRequestException('Invalid table name');
    const project = await this.getProject(projectId, userId);
    const tableExists = await this.prisma.$queryRawUnsafe<
      Array<{ exists: boolean }>
    >(
      "SELECT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = $1 AND c.relname = $2 AND c.relkind IN ('r', 'p')) AS exists",
      project.schemaName,
      tableName,
    );
    if (!tableExists[0]?.exists) throw new NotFoundException('Table not found');
    await this.prisma.$executeRawUnsafe(
      `DROP TABLE ${quote(project.schemaName)}.${quote(tableName)} CASCADE`,
    );
    return { dropped: true, name: tableName };
  }

  async insertRow(
    projectId: string,
    userId: string,
    tableName: string,
    dto: InsertRowDto,
  ) {
    if (!IDENTIFIER.test(tableName))
      throw new BadRequestException('Invalid table name');
    const project = await this.getProject(projectId, userId);
    const metadata = await this.prisma.$queryRawUnsafe<
      Array<{
        name: string;
        type: string;
        nullable: boolean;
        writable: boolean;
        hasDefault: boolean;
        isForeignKey: boolean;
      }>
    >(
      `SELECT a.attname AS name, format_type(a.atttypid, a.atttypmod) AS type,
        NOT a.attnotnull AS nullable,
        (a.attgenerated = '' AND a.attidentity = '') AS writable,
        d.adbin IS NOT NULL AS "hasDefault",
        EXISTS (SELECT 1 FROM pg_constraint fk_con WHERE fk_con.conrelid = c.oid AND fk_con.contype = 'f' AND a.attnum = ANY(fk_con.conkey)) AS "isForeignKey"
       FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid JOIN pg_namespace n ON n.oid = c.relnamespace
       LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
       WHERE n.nspname = $1 AND c.relname = $2 AND c.relkind IN ('r', 'p') AND a.attnum > 0 AND NOT a.attisdropped`,
      project.schemaName,
      tableName,
    );
    if (metadata.length === 0) throw new NotFoundException('Table not found');
    const supplied = Object.keys(dto);
    const byName = new Map(metadata.map((column) => [column.name, column]));
    for (const name of supplied) {
      const column = byName.get(name);
      if (
        !column ||
        !column.writable ||
        isSensitiveColumn(name) ||
        isManagedTimestamp(column.name, column.type, column.hasDefault) ||
        !castTypeFor(column.type)
      ) {
        throw new BadRequestException(`Column "${name}" cannot be set`);
      }
      if (dto[name] === null && !column.nullable)
        throw new BadRequestException(`Column "${name}" is required`);
    }
    const missing = metadata.find(
      (column) =>
        column.writable &&
        !column.nullable &&
        !column.hasDefault &&
        !(normalizedType(column.type) === 'uuid' && !column.isForeignKey) &&
        !isSensitiveColumn(column.name) &&
        !Object.hasOwn(dto, column.name),
    );
    if (missing)
      throw new BadRequestException(`Column "${missing.name}" is required`);
    const values = supplied.map((name) => {
      const value = dto[name];
      const column = byName.get(name)!;
      if (value === null) return null;
      if (column.type === 'jsonb') {
        try {
          return typeof value === 'string'
            ? JSON.stringify(JSON.parse(value))
            : JSON.stringify(value);
        } catch {
          throw new BadRequestException(
            `Column "${name}" must contain valid JSON`,
          );
        }
      }
      if (
        column.type === 'boolean' &&
        typeof value === 'string' &&
        !['true', 'false'].includes(value)
      ) {
        throw new BadRequestException(`Column "${name}" must be true or false`);
      }
      if (typeof value === 'object') {
        throw new BadRequestException(`Column "${name}" cannot be an object`);
      }
      return String(value);
    });
    const generatedUuidColumns = metadata
      .filter(
        (column) =>
          normalizedType(column.type) === 'uuid' &&
          !column.isForeignKey &&
          !column.hasDefault &&
          !isSensitiveColumn(column.name) &&
          !Object.hasOwn(dto, column.name),
      )
      .map((column) => column.name);
    const insertColumns = [...supplied, ...generatedUuidColumns];
    if (insertColumns.length === 0) {
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO ${quote(project.schemaName)}.${quote(tableName)} DEFAULT VALUES`,
      );
    } else {
      const columnSql = insertColumns.map(quote).join(', ');
      const placeholders = [
        ...supplied.map(
          (name, index) =>
            `$${index + 1}::${castTypeFor(byName.get(name)!.type)}`,
        ),
        ...generatedUuidColumns.map(() => 'gen_random_uuid()'),
      ].join(', ');
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO ${quote(project.schemaName)}.${quote(tableName)} (${columnSql}) VALUES (${placeholders})`,
        ...values,
      );
    }
    return { inserted: true };
  }

  async updateRow(
    projectId: string,
    userId: string,
    tableName: string,
    rowId: string,
    dto: InsertRowDto,
  ) {
    if (!IDENTIFIER.test(tableName))
      throw new BadRequestException('Invalid table name');
    if (!rowId || !rowId.trim())
      throw new BadRequestException('Invalid row ID');
    const project = await this.getProject(projectId, userId);
    const metadata = await this.prisma.$queryRawUnsafe<
      Array<{
        name: string;
        type: string;
        nullable: boolean;
        writable: boolean;
        hasDefault: boolean;
        primary: boolean;
      }>
    >(
      `SELECT a.attname AS name, format_type(a.atttypid, a.atttypmod) AS type,
        NOT a.attnotnull AS nullable,
        (a.attgenerated = '' AND a.attidentity = '') AS writable,
        d.adbin IS NOT NULL AS "hasDefault",
        EXISTS (SELECT 1 FROM pg_index i WHERE i.indrelid = c.oid AND i.indisprimary AND a.attnum = ANY(i.indkey)) AS primary
       FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid JOIN pg_namespace n ON n.oid = c.relnamespace
       LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
       WHERE n.nspname = $1 AND c.relname = $2 AND c.relkind IN ('r', 'p') AND a.attnum > 0 AND NOT a.attisdropped`,
      project.schemaName,
      tableName,
    );
    if (metadata.length === 0) throw new NotFoundException('Table not found');
    const primaryCol =
      metadata.find((c) => c.primary && !isSensitiveColumn(c.name))?.name ??
      'id';
    const supplied = Object.keys(dto).filter(
      (k) => k !== primaryCol && k !== '__row_id',
    );
    const byName = new Map(metadata.map((column) => [column.name, column]));

    for (const name of supplied) {
      const column = byName.get(name);
      if (
        !column ||
        !column.writable ||
        isSensitiveColumn(name) ||
        isManagedTimestamp(column.name, column.type, column.hasDefault) ||
        !castTypeFor(column.type)
      ) {
        throw new BadRequestException(`Column "${name}" cannot be updated`);
      }
      if (dto[name] === null && !column.nullable) {
        throw new BadRequestException(`Column "${name}" cannot be null`);
      }
    }

    if (supplied.length === 0) {
      return { updated: true };
    }

    const values = supplied.map((name) => {
      const value = dto[name];
      const column = byName.get(name)!;
      if (value === null) return null;
      if (column.type === 'jsonb') {
        try {
          return typeof value === 'string'
            ? JSON.stringify(JSON.parse(value))
            : JSON.stringify(value);
        } catch {
          throw new BadRequestException(
            `Column "${name}" must contain valid JSON`,
          );
        }
      }
      if (
        column.type === 'boolean' &&
        typeof value === 'string' &&
        !['true', 'false'].includes(value)
      ) {
        throw new BadRequestException(`Column "${name}" must be true or false`);
      }
      if (typeof value === 'object') {
        throw new BadRequestException(`Column "${name}" cannot be an object`);
      }
      return String(value);
    });

    const setClauses = supplied
      .map(
        (name, idx) =>
          `${quote(name)} = $${idx + 1}::${castTypeFor(byName.get(name)!.type)}`,
      )
      .join(', ');

    const rowIdParamIndex = supplied.length + 1;
    const result = await this.prisma.$queryRawUnsafe<
      Array<Record<string, unknown>>
    >(
      `UPDATE ${quote(project.schemaName)}.${quote(tableName)} SET ${setClauses} WHERE ${quote(primaryCol)}::text = $${rowIdParamIndex} RETURNING *`,
      ...values,
      rowId.trim(),
    );
    if (result.length === 0) {
      throw new NotFoundException('Row not found');
    }
    return { updated: true };
  }

  async deleteRow(
    projectId: string,
    userId: string,
    tableName: string,
    rowId: string,
  ) {
    if (!IDENTIFIER.test(tableName))
      throw new BadRequestException('Invalid table name');
    if (!rowId || !rowId.trim())
      throw new BadRequestException('Invalid row ID');
    const project = await this.getProject(projectId, userId);
    const metadata = await this.prisma.$queryRawUnsafe<
      Array<{ name: string; primary: boolean }>
    >(
      `SELECT a.attname AS name,
        EXISTS (SELECT 1 FROM pg_index i WHERE i.indrelid = c.oid AND i.indisprimary AND a.attnum = ANY(i.indkey)) AS primary
       FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = $1 AND c.relname = $2 AND c.relkind IN ('r', 'p') AND a.attnum > 0 AND NOT a.attisdropped`,
      project.schemaName,
      tableName,
    );
    if (metadata.length === 0) throw new NotFoundException('Table not found');
    const primaryCol =
      metadata.find((c) => c.primary && !isSensitiveColumn(c.name))?.name ??
      'id';
    await this.prisma.$executeRawUnsafe(
      `DELETE FROM ${quote(project.schemaName)}.${quote(tableName)} WHERE ${quote(primaryCol)}::text = $1`,
      rowId.trim(),
    );
    return { deleted: true };
  }

  async deleteRows(
    projectId: string,
    userId: string,
    tableName: string,
    rowIds: string[],
  ) {
    if (!IDENTIFIER.test(tableName))
      throw new BadRequestException('Invalid table name');
    if (!rowIds || rowIds.length === 0)
      throw new BadRequestException('No row IDs provided');
    const cleanIds = rowIds.map((id) => String(id).trim()).filter(Boolean);
    if (cleanIds.length === 0)
      throw new BadRequestException('No valid row IDs provided');
    const project = await this.getProject(projectId, userId);
    const metadata = await this.prisma.$queryRawUnsafe<
      Array<{ name: string; primary: boolean }>
    >(
      `SELECT a.attname AS name,
        EXISTS (SELECT 1 FROM pg_index i WHERE i.indrelid = c.oid AND i.indisprimary AND a.attnum = ANY(i.indkey)) AS primary
       FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = $1 AND c.relname = $2 AND c.relkind IN ('r', 'p') AND a.attnum > 0 AND NOT a.attisdropped`,
      project.schemaName,
      tableName,
    );
    if (metadata.length === 0) throw new NotFoundException('Table not found');
    const primaryCol =
      metadata.find((c) => c.primary && !isSensitiveColumn(c.name))?.name ??
      'id';
    await this.prisma.$executeRawUnsafe(
      `DELETE FROM ${quote(project.schemaName)}.${quote(tableName)} WHERE ${quote(primaryCol)}::text = ANY($1::text[])`,
      cleanIds,
    );
    return { deleted: true, count: cleanIds.length };
  }

  async getForeignKeyOptions(
    projectId: string,
    userId: string,
    tableName: string,
    columnName: string,
  ) {
    if (!IDENTIFIER.test(tableName) || !IDENTIFIER.test(columnName)) {
      throw new BadRequestException('Invalid table or column name');
    }
    const project = await this.getProject(projectId, userId);
    const references = await this.prisma.$queryRawUnsafe<
      Array<{ tableName: string; columnName: string }>
    >(
      `SELECT ref.relname AS "tableName", ref_attr.attname AS "columnName"
       FROM pg_constraint con
       JOIN pg_class src ON src.oid = con.conrelid
       JOIN pg_namespace src_ns ON src_ns.oid = src.relnamespace
       JOIN LATERAL unnest(con.conkey, con.confkey) WITH ORDINALITY AS key_pair(local_attnum, ref_attnum, position) ON TRUE
       JOIN pg_attribute src_attr ON src_attr.attrelid = src.oid AND src_attr.attnum = key_pair.local_attnum
       JOIN pg_class ref ON ref.oid = con.confrelid
       JOIN pg_namespace ref_ns ON ref_ns.oid = ref.relnamespace
       JOIN pg_attribute ref_attr ON ref_attr.attrelid = ref.oid AND ref_attr.attnum = key_pair.ref_attnum
       WHERE con.contype = 'f' AND src_ns.nspname = $1 AND src.relname = $2
         AND src_attr.attname = $3 AND ref_ns.nspname = $1
       LIMIT 1`,
      project.schemaName,
      tableName,
      columnName,
    );
    const reference = references[0];
    if (!reference)
      throw new BadRequestException(
        'No project-local foreign key found for this column',
      );
    if (
      !IDENTIFIER.test(reference.tableName) ||
      !IDENTIFIER.test(reference.columnName)
    ) {
      throw new BadRequestException('Unsupported foreign key identifier');
    }
    const rows = await this.prisma.$queryRawUnsafe<Array<{ value: string }>>(
      `SELECT ${quote(reference.columnName)}::text AS value
       FROM ${quote(project.schemaName)}.${quote(reference.tableName)}
       WHERE ${quote(reference.columnName)} IS NOT NULL
       ORDER BY ${quote(reference.columnName)}
       LIMIT 100`,
    );
    return { values: rows.map((row) => row.value), limit: 100 };
  }

  async getTableStructure(
    projectId: string,
    userId: string,
    tableName: string,
  ): Promise<TableStructureResponse> {
    if (!IDENTIFIER.test(tableName))
      throw new BadRequestException('Invalid table name');
    const project = await this.getProject(projectId, userId);

    const tableMeta = await this.prisma.$queryRawUnsafe<
      Array<{ bytes: bigint | number; rls: boolean; rows: bigint | number }>
    >(
      `SELECT pg_total_relation_size(c.oid) AS bytes,
        c.relrowsecurity AS rls,
        GREATEST(COALESCE(s.n_live_tup, 0), c.reltuples::bigint, 0) AS rows
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       LEFT JOIN pg_stat_user_tables s ON s.schemaname = n.nspname AND s.relname = c.relname
       WHERE n.nspname = $1 AND c.relname = $2 AND c.relkind IN ('r', 'p')`,
      project.schemaName,
      tableName,
    );
    if (tableMeta.length === 0) throw new NotFoundException('Table not found');

    const columnsMeta = await this.prisma.$queryRawUnsafe<
      Array<{
        name: string;
        type: string;
        isPrimary: boolean;
        isUnique: boolean;
        isNullable: boolean;
        isWritable: boolean;
        hasDefault: boolean;
        defaultValue: string | null;
        isForeignKey: boolean;
        foreignKeyTable: string | null;
        foreignKeyColumn: string | null;
        foreignKeyConstraint: string | null;
      }>
    >(
      `SELECT a.attname AS name,
        format_type(a.atttypid, a.atttypmod) AS type,
        EXISTS (
          SELECT 1 FROM pg_index i
          WHERE i.indrelid = c.oid AND i.indisprimary AND a.attnum = ANY(i.indkey)
        ) AS "isPrimary",
        EXISTS (
          SELECT 1 FROM pg_index i
          WHERE i.indrelid = c.oid AND i.indisunique AND NOT i.indisprimary AND a.attnum = ANY(i.indkey)
        ) AS "isUnique",
        NOT a.attnotnull AS "isNullable",
        (a.attgenerated = '' AND a.attidentity = '') AS "isWritable",
        d.adbin IS NOT NULL AS "hasDefault",
        pg_get_expr(d.adbin, d.adrelid) AS "defaultValue",
        EXISTS (
          SELECT 1 FROM pg_constraint fk_con
          WHERE fk_con.conrelid = c.oid AND fk_con.contype = 'f' AND a.attnum = ANY(fk_con.conkey)
        ) AS "isForeignKey",
        fk.ref_table AS "foreignKeyTable",
        fk.ref_column AS "foreignKeyColumn",
        fk.conname AS "foreignKeyConstraint"
       FROM pg_attribute a
       JOIN pg_class c ON c.oid = a.attrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
       LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
       LEFT JOIN LATERAL (
         SELECT con.conname, ref.relname AS ref_table, ref_attr.attname AS ref_column
         FROM pg_constraint con
         JOIN LATERAL unnest(con.conkey, con.confkey) WITH ORDINALITY AS key_pair(local_attnum, ref_attnum, position) ON TRUE
         JOIN pg_class ref ON ref.oid = con.confrelid
         JOIN pg_namespace ref_ns ON ref_ns.oid = ref.relnamespace
         JOIN pg_attribute ref_attr ON ref_attr.attrelid = ref.oid AND ref_attr.attnum = key_pair.ref_attnum
         WHERE con.conrelid = c.oid AND con.contype = 'f' AND key_pair.local_attnum = a.attnum AND ref_ns.nspname = $1
         ORDER BY con.oid LIMIT 1
       ) fk ON TRUE
       WHERE n.nspname = $1 AND c.relname = $2 AND c.relkind IN ('r', 'p') AND a.attnum > 0 AND NOT a.attisdropped
       ORDER BY a.attnum`,
      project.schemaName,
      tableName,
    );

    const primaryKeys: string[] = [];
    let uniqueConstraintsCount = 0;
    let foreignKeysCount = 0;

    const columns: TableStructureColumn[] = columnsMeta.map((col) => {
      if (col.isPrimary) primaryKeys.push(col.name);
      if (col.isUnique) uniqueConstraintsCount++;
      if (col.isForeignKey) foreignKeysCount++;

      return {
        name: col.name,
        type: col.type,
        formattedType: formatColumnType(col.type),
        isPrimary: Boolean(col.isPrimary),
        isNullable: Boolean(col.isNullable),
        isUnique: Boolean(col.isUnique),
        hasDefault: Boolean(col.hasDefault),
        defaultValue: col.defaultValue,
        isForeignKey: Boolean(col.isForeignKey),
        foreignKey:
          col.foreignKeyTable && col.foreignKeyColumn
            ? {
                tableName: col.foreignKeyTable,
                columnName: col.foreignKeyColumn,
                constraintName: col.foreignKeyConstraint ?? undefined,
              }
            : null,
        isWritable: Boolean(col.isWritable),
      };
    });

    const totalRows = Number(tableMeta[0]?.rows ?? 0);
    return {
      table: {
        name: tableName,
        rows: totalRows,
        size: prettyBytes(Number(tableMeta[0]?.bytes ?? 0)),
        sizeBytes: String(tableMeta[0]?.bytes ?? 0),
        lastMaintained: null,
        rls: tableMeta[0]?.rls ? 'active' : 'disabled',
      },
      columns,
      primaryKeys,
      uniqueConstraintsCount,
      foreignKeysCount,
    };
  }

  async addColumn(
    projectId: string,
    userId: string,
    tableName: string,
    dto: AddColumnDto,
  ) {
    if (!IDENTIFIER.test(tableName) || !IDENTIFIER.test(dto.name))
      throw new BadRequestException('Invalid table or column name');
    if (!SQL_TYPES[dto.type])
      throw new BadRequestException('Invalid column type');

    const project = await this.getProject(projectId, userId);

    const colExists = await this.prisma.$queryRawUnsafe<
      Array<{ exists: boolean }>
    >(
      `SELECT EXISTS (
         SELECT 1 FROM pg_attribute a
         JOIN pg_class c ON c.oid = a.attrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = $1 AND c.relname = $2 AND a.attname = $3 AND a.attnum > 0 AND NOT a.attisdropped
       ) AS exists`,
      project.schemaName,
      tableName,
      dto.name,
    );
    if (colExists[0]?.exists)
      throw new ConflictException(`Column "${dto.name}" already exists`);

    let defaultSql = '';
    if (dto.defaultValue !== undefined && dto.defaultValue.trim() !== '') {
      const def = dto.defaultValue.trim();
      if (dto.type === 'boolean') {
        if (['true', 'false'].includes(def.toLowerCase())) {
          defaultSql = ` DEFAULT ${def.toLowerCase()}`;
        } else {
          throw new BadRequestException(
            'Default boolean value must be true or false',
          );
        }
      } else if (dto.type === 'integer' || dto.type === 'bigint') {
        if (/^-?\d+$/.test(def)) {
          defaultSql = ` DEFAULT ${def}`;
        } else {
          throw new BadRequestException('Default value must be a number');
        }
      } else if (dto.type === 'uuid') {
        if (
          ['gen_random_uuid()', 'uuid_generate_v4()'].includes(
            def.toLowerCase(),
          )
        ) {
          defaultSql = ' DEFAULT gen_random_uuid()';
        } else if (
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            def,
          )
        ) {
          defaultSql = ` DEFAULT '${def}'::uuid`;
        } else {
          throw new BadRequestException(
            'Default value must be a valid UUID or gen_random_uuid()',
          );
        }
      } else if (dto.type === 'timestamptz') {
        if (['now()', 'current_timestamp'].includes(def.toLowerCase())) {
          defaultSql = ' DEFAULT CURRENT_TIMESTAMP';
        } else {
          defaultSql = ` DEFAULT '${def.replace(/'/g, "''")}'::timestamptz`;
        }
      } else if (dto.type === 'jsonb') {
        try {
          JSON.parse(def);
          defaultSql = ` DEFAULT '${def.replace(/'/g, "''")}'::jsonb`;
        } catch {
          throw new BadRequestException('Default value must be valid JSON');
        }
      } else {
        defaultSql = ` DEFAULT '${def.replace(/'/g, "''")}'`;
      }
    } else if (dto.type === 'uuid' && !dto.foreignKey) {
      defaultSql = ' DEFAULT gen_random_uuid()';
    }

    let fkSql = '';
    if (dto.foreignKey) {
      const refTable = dto.foreignKey.table.trim();
      const refCol = dto.foreignKey.column.trim();
      if (!IDENTIFIER.test(refTable) || !IDENTIFIER.test(refCol))
        throw new BadRequestException('Invalid foreign key identifiers');
      const refExists = await this.prisma.$queryRawUnsafe<
        Array<{ exists: boolean }>
      >(
        `SELECT EXISTS (
           SELECT 1 FROM pg_attribute a
           JOIN pg_class c ON c.oid = a.attrelid
           JOIN pg_namespace n ON n.oid = c.relnamespace
           WHERE n.nspname = $1 AND c.relname = $2 AND a.attname = $3 AND a.attnum > 0 AND NOT a.attisdropped
         ) AS exists`,
        project.schemaName,
        refTable,
        refCol,
      );
      if (!refExists[0]?.exists)
        throw new BadRequestException(
          `Referenced table or column "${refTable}"."${refCol}" does not exist`,
        );

      fkSql = ` REFERENCES ${quote(project.schemaName)}.${quote(refTable)}(${quote(refCol)}) ON DELETE ${dto.nullable ? 'SET NULL' : 'CASCADE'}`;
    }

    const uniqueSql = dto.isUnique ? ' UNIQUE' : '';
    const nullableSql = dto.nullable ? '' : ' NOT NULL';

    await this.prisma.$executeRawUnsafe(
      `ALTER TABLE ${quote(project.schemaName)}.${quote(tableName)} ADD COLUMN ${quote(dto.name)} ${SQL_TYPES[dto.type]}${defaultSql}${nullableSql}${uniqueSql}${fkSql}`,
    );

    return { added: true, column: dto.name };
  }

  async dropColumn(
    projectId: string,
    userId: string,
    tableName: string,
    columnName: string,
  ) {
    if (!IDENTIFIER.test(tableName) || !IDENTIFIER.test(columnName))
      throw new BadRequestException('Invalid table or column name');
    if (columnName.toLowerCase() === 'id')
      throw new BadRequestException('Cannot drop the primary key id column');

    const project = await this.getProject(projectId, userId);

    const colMeta = await this.prisma.$queryRawUnsafe<
      Array<{ isPrimary: boolean }>
    >(
      `SELECT EXISTS (
         SELECT 1 FROM pg_index i
         JOIN pg_class c ON c.oid = i.indrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
         JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(i.indkey)
         WHERE n.nspname = $1 AND c.relname = $2 AND a.attname = $3 AND i.indisprimary
       ) AS "isPrimary"
       FROM pg_attribute a
       JOIN pg_class c ON c.oid = a.attrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = $1 AND c.relname = $2 AND a.attname = $3 AND a.attnum > 0 AND NOT a.attisdropped`,
      project.schemaName,
      tableName,
      columnName,
    );
    if (colMeta.length === 0) throw new NotFoundException('Column not found');
    if (colMeta[0]?.isPrimary)
      throw new BadRequestException('Cannot drop a primary key column');

    await this.prisma.$executeRawUnsafe(
      `ALTER TABLE ${quote(project.schemaName)}.${quote(tableName)} DROP COLUMN ${quote(columnName)} CASCADE`,
    );

    return { dropped: true, column: columnName };
  }

  async addForeignKey(
    projectId: string,
    userId: string,
    tableName: string,
    dto: {
      sourceColumn: string;
      targetTable: string;
      targetColumn: string;
      constraintName?: string;
      onDelete: 'NO ACTION' | 'RESTRICT' | 'CASCADE' | 'SET NULL';
    },
  ) {
    const IDENT = /^[a-z_][a-z0-9_]{0,62}$/;
    if (
      !IDENT.test(tableName) ||
      !IDENT.test(dto.sourceColumn) ||
      !IDENT.test(dto.targetTable) ||
      !IDENT.test(dto.targetColumn) ||
      (dto.constraintName && !IDENT.test(dto.constraintName))
    )
      throw new BadRequestException('Invalid identifier');

    const project = await this.getProject(projectId, userId);
    const schema = project.schemaName;

    // Verify source column exists
    const srcCol = await this.prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
      `SELECT EXISTS (
         SELECT 1 FROM pg_attribute a
         JOIN pg_class c ON c.oid = a.attrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = $1 AND c.relname = $2 AND a.attname = $3 AND a.attnum > 0 AND NOT a.attisdropped
       ) AS exists`,
      schema, tableName, dto.sourceColumn,
    );
    if (!srcCol[0]?.exists)
      throw new BadRequestException(`Column "${dto.sourceColumn}" does not exist in table "${tableName}"`);

    // Verify target table.column exists
    const tgtCol = await this.prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
      `SELECT EXISTS (
         SELECT 1 FROM pg_attribute a
         JOIN pg_class c ON c.oid = a.attrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = $1 AND c.relname = $2 AND a.attname = $3 AND a.attnum > 0 AND NOT a.attisdropped
       ) AS exists`,
      schema, dto.targetTable, dto.targetColumn,
    );
    if (!tgtCol[0]?.exists)
      throw new BadRequestException(`Column "${dto.targetColumn}" does not exist in table "${dto.targetTable}"`);

    const constraintName = dto.constraintName ??
      `fk_${tableName}_${dto.sourceColumn}_${dto.targetTable}_${dto.targetColumn}`.slice(0, 63);

    await this.prisma.$executeRawUnsafe(
      `ALTER TABLE ${quote(schema)}.${quote(tableName)} ADD CONSTRAINT ${quote(constraintName)} FOREIGN KEY (${quote(dto.sourceColumn)}) REFERENCES ${quote(schema)}.${quote(dto.targetTable)}(${quote(dto.targetColumn)}) ON DELETE ${dto.onDelete}`,
    );

    return { added: true, constraint: constraintName };
  }

  async getTableRelationships(
    projectId: string,
    userId: string,
    tableName: string,
  ): Promise<TableRelationshipsResponse> {
    if (!IDENTIFIER.test(tableName))
      throw new BadRequestException('Invalid table name');
    const project = await this.getProject(projectId, userId);

    const tableMeta = await this.prisma.$queryRawUnsafe<
      Array<{ bytes: bigint | number; rls: boolean; rows: bigint | number }>
    >(
      `SELECT pg_total_relation_size(c.oid) AS bytes,
        c.relrowsecurity AS rls,
        GREATEST(COALESCE(s.n_live_tup, 0), c.reltuples::bigint, 0) AS rows
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       LEFT JOIN pg_stat_user_tables s ON s.schemaname = n.nspname AND s.relname = c.relname
       WHERE n.nspname = $1 AND c.relname = $2 AND c.relkind IN ('r', 'p')`,
      project.schemaName,
      tableName,
    );
    if (tableMeta.length === 0) throw new NotFoundException('Table not found');

    const allRelationships = await this.getRelationships(projectId, userId);

    const directRelations = allRelationships.relations.filter(
      (r) => r.from.table === tableName || r.to.table === tableName,
    );

    const connectedTableNames = new Set<string>([tableName]);
    for (const r of directRelations) {
      connectedTableNames.add(r.from.table);
      connectedTableNames.add(r.to.table);
    }

    const filteredErTables = allRelationships.tables.filter((t) =>
      connectedTableNames.has(t.name),
    );

    const rawFkMeta = await this.prisma.$queryRawUnsafe<
      Array<{
        constraintName: string;
        sourceTable: string;
        sourceColumn: string;
        targetTable: string;
        targetColumn: string;
        onDeleteCode: string;
        onUpdateCode: string;
        isUnique: boolean;
      }>
    >(
      `SELECT con.conname AS "constraintName",
        src.relname AS "sourceTable",
        src_attr.attname AS "sourceColumn",
        ref.relname AS "targetTable",
        ref_attr.attname AS "targetColumn",
        con.confdeltype::text AS "onDeleteCode",
        con.confupdtype::text AS "onUpdateCode",
        EXISTS (
          SELECT 1 FROM pg_index i
          WHERE i.indrelid = src.oid AND i.indisunique AND src_attr.attnum = ANY(i.indkey)
        ) AS "isUnique"
       FROM pg_constraint con
       JOIN pg_class src ON src.oid = con.conrelid
       JOIN pg_namespace src_ns ON src_ns.oid = src.relnamespace
       JOIN pg_class ref ON ref.oid = con.confrelid
       JOIN pg_namespace ref_ns ON ref_ns.oid = ref.relnamespace
       JOIN LATERAL unnest(con.conkey, con.confkey) WITH ORDINALITY AS key_pair(local_attnum, ref_attnum, position) ON TRUE
       JOIN pg_attribute src_attr ON src_attr.attrelid = src.oid AND src_attr.attnum = key_pair.local_attnum
       JOIN pg_attribute ref_attr ON ref_attr.attrelid = ref.oid AND ref_attr.attnum = key_pair.ref_attnum
       WHERE con.contype = 'f' AND src_ns.nspname = $1 AND ref_ns.nspname = $1
         AND (src.relname = $2 OR ref.relname = $2)
       ORDER BY con.conname`,
      project.schemaName,
      tableName,
    );

    const ACTION_MAP: Record<string, string> = {
      a: 'NO ACTION',
      r: 'RESTRICT',
      c: 'CASCADE',
      n: 'SET NULL',
      d: 'SET DEFAULT',
    };

    const relationships: TableRelationshipItem[] = rawFkMeta.map((fk) => ({
      id: `${fk.sourceTable}-${fk.sourceColumn}-${fk.targetTable}-${fk.targetColumn}`,
      direction: fk.sourceTable === tableName ? 'outgoing' : 'incoming',
      constraintName: fk.constraintName,
      sourceTable: fk.sourceTable,
      sourceColumn: fk.sourceColumn,
      targetTable: fk.targetTable,
      targetColumn: fk.targetColumn,
      cardinality: fk.isUnique ? '1:1' : '1:N',
      onDelete: ACTION_MAP[fk.onDeleteCode] ?? 'NO ACTION',
      onUpdate: ACTION_MAP[fk.onUpdateCode] ?? 'NO ACTION',
    }));

    return {
      table: {
        name: tableName,
        rows: Number(tableMeta[0]?.rows ?? 0),
        size: prettyBytes(Number(tableMeta[0]?.bytes ?? 0)),
        sizeBytes: String(tableMeta[0]?.bytes ?? 0),
        lastMaintained: null,
        rls: tableMeta[0]?.rls ? 'active' : 'disabled',
      },
      relationships,
      erData: {
        tables: filteredErTables,
        relations: directRelations,
      },
    };
  }

  async getTableIndexes(
    projectId: string,
    userId: string,
    tableName: string,
  ): Promise<TableIndexesResponse> {
    if (!IDENTIFIER.test(tableName))
      throw new BadRequestException('Invalid table name');
    const project = await this.getProject(projectId, userId);

    const tableMeta = await this.prisma.$queryRawUnsafe<
      Array<{ bytes: bigint | number; rls: boolean; rows: bigint | number }>
    >(
      `SELECT pg_total_relation_size(c.oid) AS bytes,
        c.relrowsecurity AS rls,
        GREATEST(COALESCE(s.n_live_tup, 0), c.reltuples::bigint, 0) AS rows
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       LEFT JOIN pg_stat_user_tables s ON s.schemaname = n.nspname AND s.relname = c.relname
       WHERE n.nspname = $1 AND c.relname = $2 AND c.relkind IN ('r', 'p')`,
      project.schemaName,
      tableName,
    );
    if (tableMeta.length === 0) throw new NotFoundException('Table not found');

    const indexes = await this.prisma.$queryRawUnsafe<
      Array<{
        name: string;
        tableName: string;
        method: string;
        columns: string[];
        isUnique: boolean;
        isPrimary: boolean;
        isValid: boolean;
        definition: string;
        sizeBytes: bigint | number;
      }>
    >(
      `SELECT index_class.relname AS name,
        table_class.relname AS "tableName",
        access_method.amname AS method,
        COALESCE((
          SELECT array_agg(pg_get_indexdef(index_meta.indexrelid, keys.position, true) ORDER BY keys.position)
          FROM generate_series(1, index_meta.indnatts) AS keys(position)
        ), ARRAY[]::text[]) AS columns,
        index_meta.indisunique AS "isUnique",
        index_meta.indisprimary AS "isPrimary",
        index_meta.indisvalid AS "isValid",
        pg_get_indexdef(index_meta.indexrelid) AS definition,
        pg_relation_size(index_meta.indexrelid)::bigint AS "sizeBytes"
       FROM pg_index index_meta
       JOIN pg_class index_class ON index_class.oid = index_meta.indexrelid
       JOIN pg_class table_class ON table_class.oid = index_meta.indrelid
       JOIN pg_namespace table_namespace ON table_namespace.oid = table_class.relnamespace
       JOIN pg_am access_method ON access_method.oid = index_class.relam
       WHERE table_namespace.nspname = $1 AND table_class.relname = $2
       ORDER BY index_class.relname`,
      project.schemaName,
      tableName,
    );

    const totalSizeBytes = indexes.reduce(
      (total, index) => total + BigInt(index.sizeBytes),
      0n,
    );

    return {
      table: {
        name: tableName,
        rows: Number(tableMeta[0]?.rows ?? 0),
        size: prettyBytes(Number(tableMeta[0]?.bytes ?? 0)),
        sizeBytes: String(tableMeta[0]?.bytes ?? 0),
        lastMaintained: null,
        rls: tableMeta[0]?.rls ? 'active' : 'disabled',
      },
      stats: {
        totalIndexes: indexes.length,
        uniqueIndexes: indexes.filter((index) => index.isUnique).length,
        totalSizeBytes: totalSizeBytes.toString(),
      },
      indexes: indexes.map((index) => ({
        ...index,
        sizeBytes: String(index.sizeBytes),
      })),
    };
  }

  async createTableIndex(
    projectId: string,
    userId: string,
    tableName: string,
    dto: CreateIndexDto,
  ) {
    if (!IDENTIFIER.test(tableName))
      throw new BadRequestException('Invalid table name');
    for (const col of dto.columns) {
      if (!IDENTIFIER.test(col))
        throw new BadRequestException(`Invalid column identifier "${col}"`);
    }

    const project = await this.getProject(projectId, userId);

    const indexName =
      dto.name?.trim() ||
      `${tableName}_${dto.columns.join('_')}_${dto.isUnique ? 'uniq_' : ''}idx`.slice(
        0,
        63,
      );
    if (!IDENTIFIER.test(indexName))
      throw new BadRequestException('Invalid index name');

    const method = ['btree', 'hash', 'gin', 'gist'].includes(dto.method)
      ? dto.method
      : 'btree';
    const uniqueSql = dto.isUnique ? 'UNIQUE ' : '';
    const columnsSql = dto.columns.map(quote).join(', ');

    await this.prisma.$executeRawUnsafe(
      `CREATE ${uniqueSql}INDEX ${quote(indexName)} ON ${quote(project.schemaName)}.${quote(tableName)} USING ${method} (${columnsSql})`,
    );

    return { created: true, name: indexName };
  }

  async dropTableIndex(
    projectId: string,
    userId: string,
    tableName: string,
    indexName: string,
  ) {
    if (!IDENTIFIER.test(tableName) || !IDENTIFIER.test(indexName))
      throw new BadRequestException('Invalid table or index name');
    const project = await this.getProject(projectId, userId);

    const indexMeta = await this.prisma.$queryRawUnsafe<
      Array<{ isPrimary: boolean }>
    >(
      `SELECT i.indisprimary AS "isPrimary"
       FROM pg_index i
       JOIN pg_class ic ON ic.oid = i.indexrelid
       JOIN pg_class tc ON tc.oid = i.indrelid
       JOIN pg_namespace n ON n.oid = tc.relnamespace
       WHERE n.nspname = $1 AND tc.relname = $2 AND ic.relname = $3`,
      project.schemaName,
      tableName,
      indexName,
    );
    if (indexMeta.length === 0)
      throw new NotFoundException('Index not found on this table');
    if (indexMeta[0]?.isPrimary)
      throw new BadRequestException('Cannot drop the primary key index');

    await this.prisma.$executeRawUnsafe(
      `DROP INDEX ${quote(project.schemaName)}.${quote(indexName)} CASCADE`,
    );

    return { dropped: true, name: indexName };
  }

  async toggleTableRls(
    projectId: string,
    userId: string,
    tableName: string,
    enabled: boolean,
  ) {
    if (!IDENTIFIER.test(tableName))
      throw new BadRequestException('Invalid table name');
    const project = await this.getProject(projectId, userId);

    const tableExists = await this.prisma.$queryRawUnsafe<
      Array<{ exists: boolean }>
    >(
      "SELECT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = $1 AND c.relname = $2 AND c.relkind IN ('r', 'p')) AS exists",
      project.schemaName,
      tableName,
    );
    if (!tableExists[0]?.exists) throw new NotFoundException('Table not found');

    const action = enabled ? 'ENABLE' : 'DISABLE';
    await this.prisma.$executeRawUnsafe(
      `ALTER TABLE ${quote(project.schemaName)}.${quote(tableName)} ${action} ROW LEVEL SECURITY`,
    );

    return { tableName, rls: enabled ? 'active' : 'disabled' };
  }

  async getTablePolicies(
    projectId: string,
    userId: string,
    tableName: string,
  ): Promise<TablePoliciesResponse> {
    if (!IDENTIFIER.test(tableName))
      throw new BadRequestException('Invalid table name');
    const project = await this.getProject(projectId, userId);

    const tableMeta = await this.prisma.$queryRawUnsafe<
      Array<{ bytes: bigint | number; rls: boolean; rows: bigint | number }>
    >(
      `SELECT pg_total_relation_size(c.oid) AS bytes,
        c.relrowsecurity AS rls,
        GREATEST(COALESCE(s.n_live_tup, 0), c.reltuples::bigint, 0) AS rows
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       LEFT JOIN pg_stat_user_tables s ON s.schemaname = n.nspname AND s.relname = c.relname
       WHERE n.nspname = $1 AND c.relname = $2 AND c.relkind IN ('r', 'p')`,
      project.schemaName,
      tableName,
    );
    if (tableMeta.length === 0) throw new NotFoundException('Table not found');

    const policies = await this.prisma.$queryRawUnsafe<
      Array<{
        name: string;
        command: string;
        roles: string[] | string;
        using: string | null;
        withCheck: string | null;
      }>
    >(
      `SELECT 
        policyname::text AS name,
        cmd::text AS command,
        roles::text[] AS roles,
        qual::text AS "using",
        with_check::text AS "withCheck"
       FROM pg_policies
       WHERE schemaname = $1 AND tablename = $2
       ORDER BY policyname`,
      project.schemaName,
      tableName,
    );

    return {
      table: {
        name: tableName,
        rows: Number(tableMeta[0]?.rows ?? 0),
        size: prettyBytes(Number(tableMeta[0]?.bytes ?? 0)),
        sizeBytes: String(tableMeta[0]?.bytes ?? 0),
        lastMaintained: null,
        rls: tableMeta[0]?.rls ? 'active' : 'disabled',
      },
      rlsEnabled: Boolean(tableMeta[0]?.rls),
      policies: policies.map((p) => ({
        name: p.name,
        command: (p.command === '*' ? 'ALL' : p.command) as PolicyCommand,
        roles: Array.isArray(p.roles)
          ? p.roles
          : typeof p.roles === 'string'
            ? p.roles.replace(/[{}]/g, '').split(',').filter(Boolean)
            : ['public'],
        using: p.using ?? null,
        withCheck: p.withCheck ?? null,
      })),
    };
  }

  async createTablePolicy(
    projectId: string,
    userId: string,
    tableName: string,
    dto: CreatePolicyDto,
  ) {
    if (!IDENTIFIER.test(tableName))
      throw new BadRequestException('Invalid table name');
    if (!IDENTIFIER.test(dto.name))
      throw new BadRequestException('Invalid policy name');

    const project = await this.getProject(projectId, userId);

    const rolesList = dto.roles?.length ? dto.roles : ['public'];
    for (const r of rolesList) {
      if (!/^[a-z_][a-z0-9_]{0,62}$/i.test(r) && r.toLowerCase() !== 'public') {
        throw new BadRequestException(`Invalid role identifier "${r}"`);
      }
    }
    const rolesSql = rolesList
      .map((r) => (r.toLowerCase() === 'public' ? 'PUBLIC' : quote(r)))
      .join(', ');

    let usingSql = '';
    let withCheckSql = '';

    const cmd = dto.command.toUpperCase();

    if (cmd === 'INSERT') {
      const expr = dto.withCheck?.trim() || dto.using?.trim();
      if (!expr) {
        throw new BadRequestException(
          'An INSERT policy requires a WITH CHECK expression',
        );
      }
      withCheckSql = ` WITH CHECK (${expr})`;
    } else if (cmd === 'SELECT' || cmd === 'DELETE') {
      const expr = dto.using?.trim();
      if (!expr) {
        throw new BadRequestException(
          `A ${cmd} policy requires a USING expression`,
        );
      }
      usingSql = ` USING (${expr})`;
    } else {
      // ALL or UPDATE
      if (dto.using?.trim()) {
        usingSql = ` USING (${dto.using.trim()})`;
      }
      if (dto.withCheck?.trim()) {
        withCheckSql = ` WITH CHECK (${dto.withCheck.trim()})`;
      }
      if (!usingSql && !withCheckSql) {
        throw new BadRequestException(
          'A policy requires at least a USING or WITH CHECK expression',
        );
      }
    }

    const sql = `CREATE POLICY ${quote(dto.name)} ON ${quote(project.schemaName)}.${quote(tableName)} FOR ${cmd} TO ${rolesSql}${usingSql}${withCheckSql}`;

    try {
      await this.prisma.$executeRawUnsafe(sql);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create policy';
      throw new BadRequestException(`PostgreSQL policy error: ${message}`);
    }

    return { created: true, name: dto.name };
  }

  async dropTablePolicy(
    projectId: string,
    userId: string,
    tableName: string,
    policyName: string,
  ) {
    if (!IDENTIFIER.test(tableName) || !IDENTIFIER.test(policyName))
      throw new BadRequestException('Invalid table or policy name');
    const project = await this.getProject(projectId, userId);

    await this.prisma.$executeRawUnsafe(
      `DROP POLICY ${quote(policyName)} ON ${quote(project.schemaName)}.${quote(tableName)}`,
    );

    return { dropped: true, name: policyName };
  }

  async executeQuery(
    projectId: string,
    userId: string,
    sql: string,
  ): Promise<ExecuteQueryResult> {
    const trimmed = sql.trim();
    if (!trimmed) {
      throw new BadRequestException('SQL query cannot be empty');
    }

    const DANGEROUS_PATTERNS = [
      /\bALTER\s+SYSTEM\b/i,
      /\bDROP\s+DATABASE\b/i,
      /\bCREATE\s+DATABASE\b/i,
      /\bCOPY\s+.*\bPROGRAM\b/i,
      /\bpg_read_file\b/i,
      /\bpg_write_file\b/i,
    ];
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(trimmed)) {
        throw new BadRequestException('Restricted statement detected');
      }
    }

    const project = await this.getProject(projectId, userId);
    const start = performance.now();

    try {
      const isSelectOrRead =
        /^(SELECT|WITH|EXPLAIN|SHOW|VALUES)\b/i.test(trimmed);

      const rawResult = await this.prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(
          `SET LOCAL search_path = ${quote(project.schemaName)}, public`,
        );
        await tx.$executeRawUnsafe(`SET LOCAL statement_timeout = '15s'`);

        if (isSelectOrRead || /\bRETURNING\b/i.test(trimmed)) {
          return await tx.$queryRawUnsafe<Array<Record<string, unknown>>>(
            trimmed,
          );
        } else {
          const affectedCount = await tx.$executeRawUnsafe(trimmed);
          return { __command: true, affectedCount };
        }
      });

      const executionMs = Math.round(performance.now() - start);

      if (
        rawResult &&
        typeof rawResult === 'object' &&
        '__command' in rawResult
      ) {
        const count = (rawResult as { affectedCount: number }).affectedCount;
        const firstWord =
          trimmed.split(/\s+/)[0]?.toUpperCase() ?? 'STATEMENT';
        return {
          columns: ['status'],
          rows: [
            {
              status: `${firstWord} executed successfully (${count} ${count === 1 ? 'row' : 'rows'} affected)`,
            },
          ],
          rowCount: count,
          executionMs,
          command: firstWord,
        };
      }

      const rowsList = Array.isArray(rawResult) ? rawResult : [];
      const serializedRows = rowsList.slice(0, 500).map((row) => {
        const out: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(row)) {
          if (typeof val === 'bigint') {
            out[key] = val.toString();
          } else if (val instanceof Date) {
            out[key] = val.toISOString();
          } else if (Buffer.isBuffer(val)) {
            out[key] = `\\x${val.toString('hex')}`;
          } else {
            out[key] = val;
          }
        }
        return out;
      });

      const columnSet = new Set<string>();
      for (const row of serializedRows) {
        Object.keys(row).forEach((k) => columnSet.add(k));
      }
      const columns = Array.from(columnSet);

      return {
        columns,
        rows: serializedRows,
        rowCount: rowsList.length,
        executionMs,
      };
    } catch (err: unknown) {
      const rawMessage =
        err instanceof Error ? err.message : 'Database query failed';
      const cleanMessage = rawMessage
        .replace(/Raw query failed\. Code: `.*?`\. Message:\s*/i, '')
        .replace(/Invalid `prisma\.\$queryRawUnsafe\(\)` invocation:\s*/i, '')
        .replace(/Invalid `prisma\.\$executeRawUnsafe\(\)` invocation:\s*/i, '')
        .trim();
      throw new BadRequestException(`SQL execution error: ${cleanMessage}`);
    }
  }
}
