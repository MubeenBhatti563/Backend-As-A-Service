"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Alert,
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { IconLink } from "@tabler/icons-react";
import {
  addDatabaseColumn,
  fetchDatabaseRelationships,
  type AddColumnRequest,
} from "../table.client-api";
import { getErrorMessage } from "@/lib/get-error-message";
import { DatabaseActionDialog } from "./DatabaseActionDialog";
import { databaseColumnTypeSchema } from "../schemas/table-actions.schema";
import type { ErTable } from "../types";

const COLUMN_TYPES: Array<{
  value: AddColumnRequest["type"];
  label: string;
  detail: string;
}> = [
  { value: "text", label: "Text", detail: "Words and longer text" },
  { value: "integer", label: "Integer", detail: "Whole numbers" },
  { value: "bigint", label: "Big integer", detail: "Large whole numbers" },
  { value: "boolean", label: "Boolean", detail: "True or false" },
  { value: "uuid", label: "UUID", detail: "Unique identifiers" },
  { value: "timestamptz", label: "Timestamp", detail: "Date and time" },
  { value: "jsonb", label: "JSON", detail: "Structured data" },
];

const addColumnFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a column name.")
    .max(63, "Column name must be 63 characters or fewer.")
    .regex(/^[a-z][a-z0-9_]*$/, "Use lowercase letters, numbers, and underscores; start with a letter."),
  type: databaseColumnTypeSchema,
  nullable: z.boolean(),
  isUnique: z.boolean().optional(),
  defaultValue: z.string().optional(),
  foreignKeyTable: z.string().optional(),
  foreignKeyColumn: z.string().optional(),
});

type AddColumnFormValues = z.infer<typeof addColumnFormSchema>;

interface Props {
  open: boolean;
  projectId: string;
  tableName: string;
  onClose: () => void;
  onAdded: () => void;
}

export function AddColumnDialog({
  open,
  projectId,
  tableName,
  onClose,
  onAdded,
}: Props) {
  const [availableTables, setAvailableTables] = useState<ErTable[]>([]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddColumnFormValues>({
    resolver: zodResolver(addColumnFormSchema),
    defaultValues: {
      name: "",
      type: "text",
      nullable: true,
      isUnique: false,
      defaultValue: "",
      foreignKeyTable: "",
      foreignKeyColumn: "",
    },
    mode: "onTouched",
  });

  const selectedFkTable = watch("foreignKeyTable");
  const targetTableObj = availableTables.find((t) => t.name === selectedFkTable);
  const targetColumns = targetTableObj?.columns ?? [];

  useEffect(() => {
    if (!open) return;
    void fetchDatabaseRelationships(projectId)
      .then((data) => {
        if (data?.tables) setAvailableTables(data.tables);
      })
      .catch(() => {});
  }, [open, projectId]);

  const close = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  const submit = handleSubmit(async (values) => {
    try {
      const payload: AddColumnRequest = {
        name: values.name.trim(),
        type: values.type,
        nullable: values.nullable,
        isUnique: Boolean(values.isUnique),
        defaultValue: values.defaultValue?.trim() || undefined,
        foreignKey:
          values.foreignKeyTable?.trim() && values.foreignKeyColumn?.trim()
            ? {
                table: values.foreignKeyTable.trim(),
                column: values.foreignKeyColumn.trim(),
              }
            : undefined,
      };

      await addDatabaseColumn(projectId, tableName, payload);
      reset();
      onAdded();
      onClose();
    } catch (cause) {
      setError("root.server", {
        type: "server",
        message: getErrorMessage(cause, "Could not add this column."),
      });
    }
  });

  return (
    <DatabaseActionDialog
      open={open}
      title="Add column"
      description={`Add a new column to table "${tableName}".`}
      submitLabel="Add column"
      submittingLabel="Adding…"
      saving={isSubmitting}
      maxWidth="sm"
      onClose={close}
      onSubmit={submit}
    >
      <Stack spacing={3}>
        {errors.root?.server?.message && (
          <Alert severity="error" role="alert">
            {errors.root.server.message}
          </Alert>
        )}

        <TextField
          autoFocus
          fullWidth
          label="Column name"
          placeholder="e.g. status"
          error={Boolean(errors.name)}
          helperText={errors.name?.message ?? "Use lowercase letters, numbers, and underscores."}
          disabled={isSubmitting}
          slotProps={{ htmlInput: { maxLength: 63, autoCapitalize: "none", spellCheck: false } }}
          {...register("name")}
        />

        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <FormControl fullWidth size="small">
              <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: "text.secondary" }}>
                Data type
              </Typography>
              <Select
                {...field}
                disabled={isSubmitting}
                renderValue={(value) => COLUMN_TYPES.find((t) => t.value === value)?.label ?? value}
              >
                {COLUMN_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    <Box>
                      <Typography variant="body2">{t.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t.detail}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Controller
            control={control}
            name="nullable"
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox size="small" checked={field.value} disabled={isSubmitting} onChange={field.onChange} />}
                label={<Typography variant="body2">Allow empty (Nullable)</Typography>}
              />
            )}
          />

          <Controller
            control={control}
            name="isUnique"
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox size="small" checked={Boolean(field.value)} disabled={isSubmitting} onChange={field.onChange} />}
                label={<Typography variant="body2">Unique constraint</Typography>}
              />
            )}
          />
        </Box>

        <TextField
          fullWidth
          size="small"
          label="Default value (optional)"
          placeholder="e.g. 0, active, false, gen_random_uuid()"
          disabled={isSubmitting}
          slotProps={{ htmlInput: { maxLength: 100, autoCapitalize: "none", spellCheck: false } }}
          {...register("defaultValue")}
        />

        {/* Foreign Key Section */}
        <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.elevated", border: "1px solid", borderColor: "border.subtle" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <IconLink size={15} />
            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary" }}>
              Foreign Key Reference (Optional)
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
            <Controller
              control={control}
              name="foreignKeyTable"
              render={({ field }) => (
                <FormControl size="small" fullWidth>
                  <Select
                    value={field.value || ""}
                    displayEmpty
                    disabled={isSubmitting}
                    onChange={(e) => {
                      const val = e.target.value as string;
                      field.onChange(val);
                      if (val) {
                        const tbl = availableTables.find((t) => t.name === val);
                        const hasId = tbl?.columns.some((c) => c.name === "id");
                        setValue("foreignKeyColumn", hasId ? "id" : (tbl?.columns[0]?.name ?? ""));
                      } else {
                        setValue("foreignKeyColumn", "");
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {availableTables.map((tbl) => (
                      <MenuItem key={tbl.name} value={tbl.name}>
                        {tbl.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="foreignKeyColumn"
              render={({ field }) => (
                <FormControl size="small" fullWidth disabled={!selectedFkTable || isSubmitting}>
                  <Select value={field.value || ""} displayEmpty onChange={field.onChange}>
                    <MenuItem value="" disabled>
                      <em>Select column</em>
                    </MenuItem>
                    {targetColumns.map((col) => (
                      <MenuItem key={col.name} value={col.name}>
                        {col.name} ({col.type})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Box>
        </Box>
      </Stack>
    </DatabaseActionDialog>
  );
}
