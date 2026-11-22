import { z } from "zod";

export const databaseColumnTypeSchema = z.enum([
  "text", "integer", "bigint", "boolean", "uuid", "timestamptz", "jsonb",
]);

export const createTableDefinitionSchema = z.object({
  name: z.string().trim().min(1, "Enter a table name.").max(63)
    .regex(/^[a-z][a-z0-9_]*$/, "Use lowercase letters, numbers and underscores; start with a letter.")
    .refine((name) => !name.startsWith("pg_"), "Names beginning with pg_ are reserved."),
  columns: z.array(z.object({
    name: z.string().trim().min(1, "Enter a column name.").max(63)
      .regex(/^[a-z][a-z0-9_]*$/, "Use lowercase letters, numbers and underscores; start with a letter.")
      .refine((name) => name !== "id", "The id column is generated automatically."),
    type: databaseColumnTypeSchema,
    nullable: z.boolean(),
  })).min(1, "Add at least one column.").max(30, "A table can have up to 30 custom columns.")
    .superRefine((columns, context) => {
      const used = new Set<string>();
      columns.forEach((column, index) => {
        if (used.has(column.name)) {
          context.addIssue({ code: "custom", path: [index, "name"], message: "Column names must be unique." });
        }
        used.add(column.name);
      });
    }),
});

export type CreateTableFormValues = z.input<typeof createTableDefinitionSchema>;
export type CreateTableDefinition = z.output<typeof createTableDefinitionSchema>;

export function normalizeDatabaseType(dataType: string): string {
  return dataType.toLowerCase().replace(/\(\d+(?:,\s*\d+)?\)/g, "").trim();
}

export function validateDatabaseCell(value: string, dataType: string): string | undefined {
  const type = normalizeDatabaseType(dataType);
  if (type === "uuid" && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    return "Enter a valid UUID.";
  }
  if (type === "integer" && !/^-?\d+$/.test(value)) return "Enter a whole number.";
  if (type === "integer" && !Number.isSafeInteger(Number(value))) return "Enter a whole number within the safe range.";
  if (type === "bigint") {
    if (!/^-?\d+$/.test(value)) return "Enter a whole number.";
    try { BigInt(value); } catch { return "Enter a valid whole number."; }
  }
  if (["numeric", "real", "double precision"].includes(type) && (!value.trim() || !Number.isFinite(Number(value)))) {
    return "Enter a valid number.";
  }
  if ((type === "jsonb" || type === "json") && value.trim()) {
    try { JSON.parse(value); } catch { return "Enter valid JSON."; }
  }
  if (type === "date" && Number.isNaN(Date.parse(value))) return "Enter a valid date.";
  if (type.includes("timestamp") && Number.isNaN(Date.parse(value))) return "Enter a valid date and time.";
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
  return z.record(z.string(), z.string()).superRefine((values, context) => {
    for (const [key, value] of Object.entries(values)) {
      const field = fieldByName.get(key);
      if (!field) {
        context.addIssue({ code: "custom", path: [key], message: "This field cannot be changed." });
        continue;
      }
      if (!value.trim()) {
        if (!field.nullable && !field.hasDefault) context.addIssue({ code: "custom", path: [key], message: "This field is required." });
        continue;
      }
      const message = validateDatabaseCell(value, field.dataType ?? "text");
      if (message) context.addIssue({ code: "custom", path: [key], message });
    }

    for (const field of fields) {
      if (!field.nullable && !field.hasDefault && !Object.hasOwn(values, field.key)) {
        context.addIssue({ code: "custom", path: [field.key], message: "This field is required." });
      }
    }
  });
}
