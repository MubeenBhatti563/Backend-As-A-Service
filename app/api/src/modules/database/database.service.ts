import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import type { CreateTableDto, InsertRowDto } from './dto/create-table.dto';

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
    const schema = quote(project.schemaName);
    const tables = await this.prisma.$queryRawUnsafe<
      Array<{
        name: string;
        bytes: bigint | number;
        rls: boolean;
        modified: Date | null;
      }>
    >(
      `SELECT c.relname AS name,
        pg_total_relation_size(c.oid) AS bytes, c.relrowsecurity AS rls,
        (SELECT MAX(GREATEST(s.last_vacuum, s.last_autovacuum, s.last_analyze, s.last_autoanalyze))
          FROM pg_stat_user_tables s WHERE s.schemaname = n.nspname AND s.relname = c.relname) AS modified
       FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = $1 AND c.relkind IN ('r', 'p') ORDER BY c.relname`,
      project.schemaName,
    );
    const rowCounts = new Map<string, bigint>();
    const countBatchSize = 4;
    for (let offset = 0; offset < tables.length; offset += countBatchSize) {
      const batch = tables.slice(offset, offset + countBatchSize);
      const counts = await Promise.all(
        batch.map(async (table) => {
          const result = await this.prisma.$queryRawUnsafe<
            Array<{ count: bigint }>
          >(
            `SELECT COUNT(*)::bigint AS count FROM ${schema}.${quote(table.name)}`,
          );
          return [table.name, result[0]?.count ?? 0n] as const;
        }),
      );
      for (const [name, count] of counts) rowCounts.set(name, count);
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
        rows: Number(rowCounts.get(table.name) ?? 0n),
        size: prettyBytes(Number(table.bytes)),
        sizeBytes: String(table.bytes),
        lastMaintained: table.modified
          ? new Date(table.modified).toISOString()
          : null,
        rls: table.rls ? 'active' : 'disabled',
      })),
    };
  }

  async getTable(
    projectId: string,
    userId: string,
    tableName: string,
    rawPage?: string,
    rawPageSize?: string,
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
    const estimatedRows = Number(columnsMeta[0]?.estimatedRows ?? 0);
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
    const records = await this.prisma.$queryRawUnsafe<
      Array<Record<string, unknown>>
    >(
      `SELECT ${projection} FROM ${schema}.${table} ORDER BY ${orderBy} LIMIT $1 OFFSET $2`,
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
    const totalRows = Math.max(
      estimatedRows,
      (page - 1) * pageSize + rows.length,
    );
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
      const generatedUuid = column.type === 'uuid';
      definitions.push(
        `${quote(column.name)} ${SQL_TYPES[column.type]}${generatedUuid ? ' DEFAULT gen_random_uuid()' : ''}${column.nullable ? '' : ' NOT NULL'}`,
      );
    }
    await this.prisma.$executeRawUnsafe(
      `CREATE TABLE ${quote(project.schemaName)}.${quote(dto.name)} (${definitions.join(', ')})`,
    );
    return { name: dto.name };
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
}
