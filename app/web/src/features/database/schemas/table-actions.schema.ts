import { z } from "zod";

export const databaseColumnTypeSchema = z.enum([
  "text", "integer", "bigint", "boolean", "uuid", "timestamptz", "jsonb",
]);

export const createTableDefinitionSchema = z.object({
  name: z.string().trim()
    .min(1, "Enter a table name.")
    .max(63, "Table name must be 63 characters or fewer.")
    .superRefine((val, ctx) => {
      if (!val) return;
      if (!/^[a-z][a-z0-9_]*$/.test(val)) {
        ctx.addIssue({ code: "custom", message: "Use lowercase letters, numbers, and underscores; start with a letter." });
      } else if (val.startsWith("pg_")) {
        ctx.addIssue({ code: "custom", message: "Names beginning with pg_ are reserved." });
      }
    }),
  columns: z.array(z.object({
    name: z.string().trim()
      .min(1, "Enter a column name.")
      .max(63, "Column name must be 63 characters or fewer.")
      .superRefine((val, ctx) => {
        if (!val) return;
        if (!/^[a-z][a-z0-9_]*$/.test(val)) {
          ctx.addIssue({ code: "custom", message: "Use lowercase letters, numbers, and underscores; start with a letter." });
        } else if (val.toLowerCase() === "id") {
          ctx.addIssue({ code: "custom", message: "The id column is generated automatically." });
        }
      }),
    type: databaseColumnTypeSchema,
    nullable: z.boolean(),
    isUnique: z.boolean().optional(),
    defaultValue: z.string().optional(),
    foreignKeyTable: z.string().optional(),
    foreignKeyColumn: z.string().optional(),
  })).min(1, "Add at least one column.").max(30, "A table can have up to 30 custom columns.")
    .superRefine((columns, context) => {
      const used = new Set<string>();
      columns.forEach((column, index) => {
        const trimmed = column.name.trim();
        if (trimmed) {
          if (used.has(trimmed)) {
            context.addIssue({ code: "custom", path: [index, "name"], message: "Column names must be unique." });
          }
          used.add(trimmed);
        }
        if (column.foreignKeyTable && !column.foreignKeyColumn) {
          context.addIssue({ code: "custom", path: [index, "foreignKeyColumn"], message: "Select a referenced column." });
        }
      });
    }),
});

export type CreateTableFormValues = z.input<typeof createTableDefinitionSchema>;
export type CreateTableDefinition = z.output<typeof createTableDefinitionSchema>;

export function normalizeDatabaseType(dataType: string): string {
  return dataType.toLowerCase().replace(/\(\d+(?:,\s*\d+)?\)/g, "").trim();
}

export function validateDatabaseCell(value: unknown, dataType: string): string | undefined {
  const type = normalizeDatabaseType(dataType);
  const trimmed = typeof value === "string" ? value.trim() : value !== undefined && value !== null ? String(value).trim() : "";
  if (!trimmed) return undefined;

  if (type === "uuid") {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
      return "Enter a valid UUID.";
    }
  }
  if (type === "smallint" || type === "int2") {
    if (!/^-?\d+$/.test(trimmed)) return "Enter a whole number.";
    const n = Number(trimmed);
    if (!Number.isInteger(n) || n < -32768 || n > 32767) {
      return "Enter a small integer between -32,768 and 32,767.";
    }
  }
  if (type === "integer" || type === "int" || type === "int4") {
    if (!/^-?\d+$/.test(trimmed)) return "Enter a whole number.";
    const n = Number(trimmed);
    if (!Number.isInteger(n) || n < -2147483648 || n > 2147483647) {
      return "Enter an integer between -2,147,483,648 and 2,147,483,647.";
    }
  }
  if (type === "bigint" || type === "int8") {
    if (!/^-?\d+$/.test(trimmed)) return "Enter a whole number.";
    try {
      const b = BigInt(trimmed);
      const min = BigInt("-9223372036854775808");
      const max = BigInt("9223372036854775807");
      if (b < min || b > max) {
        return "Enter a valid 64-bit whole number.";
      }
    } catch {
      return "Enter a valid whole number.";
    }
  }
  if (["numeric", "decimal", "real", "double precision", "float", "float4", "float8"].includes(type)) {
    if (Number.isNaN(Number(trimmed)) || !Number.isFinite(Number(trimmed))) {
      return "Enter a valid number.";
    }
  }
  if (type === "boolean") {
    if (!["true", "false", "t", "f", "1", "0"].includes(trimmed.toLowerCase())) {
      return "Enter true or false.";
    }
  }
  if (type === "jsonb" || type === "json") {
    try {
      JSON.parse(trimmed);
    } catch {
      return "Enter valid JSON.";
    }
  }
  if (type === "date") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed) || Number.isNaN(Date.parse(trimmed))) {
      return "Enter a valid date (YYYY-MM-DD).";
    }
  }
  if (type.includes("timestamp")) {
    if (Number.isNaN(Date.parse(trimmed))) {
      return "Enter a valid date and time.";
    }
  }
  return undefined;
}

export interface AddRowField {
  key: string;
  nullable?: boolean;
  hasDefault?: boolean;
  dataType?: string;
}

export function createAddRowSchema(fields: AddRowField[]) {
  const fieldByName = new Map(fields.map((field) => [field.key, field]));
  return z
    .record(z.string(), z.string())
    .superRefine((values, context) => {
      for (const [key, rawValue] of Object.entries(values)) {
        const field = fieldByName.get(key);
        if (!field) {
          context.addIssue({ code: "custom", path: [key], message: "This field cannot be changed." });
          continue;
        }
        const value = (rawValue ?? "").trim();
        if (!value) {
          if (!field.nullable && !field.hasDefault) {
            context.addIssue({ code: "custom", path: [key], message: "This field is required." });
          }
          continue;
        }
        const message = validateDatabaseCell(value, field.dataType ?? "text");
        if (message) context.addIssue({ code: "custom", path: [key], message });
      }

      for (const field of fields) {
        if (!field.nullable && !field.hasDefault) {
          const rawValue = values[field.key];
          const value = (rawValue ?? "").trim();
          if (!value) {
            const hasIssue = context.issues?.some((i) => i.path && i.path.includes(field.key));
            if (!hasIssue) {
              context.addIssue({ code: "custom", path: [field.key], message: "This field is required." });
            }
          }
        }
      }
    });
}
