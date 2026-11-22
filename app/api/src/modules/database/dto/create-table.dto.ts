import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DATABASE_COLUMN_TYPES = [
  'text', 'integer', 'bigint', 'boolean', 'uuid', 'timestamptz', 'jsonb',
] as const;

export const createTableSchema = z.object({
  name: z.string().trim().regex(/^[a-z][a-z0-9_]{0,62}$/, 'Use a lowercase name starting with a letter'),
  columns: z.array(z.object({
    name: z.string().trim().regex(/^[a-z][a-z0-9_]{0,62}$/, 'Use a lowercase column name'),
    type: z.enum(DATABASE_COLUMN_TYPES),
    nullable: z.boolean().default(true),
  })).min(1).max(30),
}).superRefine(({ name, columns }, ctx) => {
  const names = columns.map((column) => column.name);
  if (names.includes('id')) ctx.addIssue({ code: 'custom', path: ['columns'], message: 'The id column is created automatically' });
  if (new Set(names).size !== names.length) ctx.addIssue({ code: 'custom', path: ['columns'], message: 'Column names must be unique' });
  if (name.startsWith('pg_')) ctx.addIssue({ code: 'custom', path: ['name'], message: 'Table names starting with pg_ are reserved' });
});

export class CreateTableDto extends createZodDto(createTableSchema) {}

export const insertRowSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]));

export class InsertRowDto extends createZodDto(insertRowSchema) {}
