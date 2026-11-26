"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Alert,
  Box,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { addDatabaseForeignKey } from "../../table.client-api";
import { getErrorMessage } from "@/lib/get-error-message";
import { DatabaseActionDialog } from "../DatabaseActionDialog";

const IDENT = /^[a-z_][a-z0-9_]{0,62}$/;

const schema = z.object({
  sourceColumn: z
    .string()
    .trim()
    .regex(IDENT, "Use lowercase letters, numbers, and underscores."),
  targetTable: z
    .string()
    .trim()
    .regex(IDENT, "Use lowercase letters, numbers, and underscores."),
  targetColumn: z
    .string()
    .trim()
    .regex(IDENT, "Use lowercase letters, numbers, and underscores."),
  constraintName: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || IDENT.test(v), {
      message: "Use lowercase letters, numbers, and underscores.",
    }),
  onDelete: z.enum(["NO ACTION", "RESTRICT", "CASCADE", "SET NULL"]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  projectId: string;
  tableName: string;
  availableColumns: string[];
  onClose: () => void;
  onCreated: () => void;
}

export function AddRelationshipDialog({
  open,
  projectId,
  tableName,
  availableColumns,
  onClose,
  onCreated,
}: Props) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sourceColumn: "",
      targetTable: "",
      targetColumn: "id",
      constraintName: "",
      onDelete: "NO ACTION",
    },
    mode: "onTouched",
  });

  const sourceColumn = watch("sourceColumn");

  const close = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  const submit = handleSubmit(async (values) => {
    try {
      await addDatabaseForeignKey(projectId, tableName, {
        sourceColumn: values.sourceColumn,
        targetTable: values.targetTable,
        targetColumn: values.targetColumn,
        constraintName: values.constraintName?.trim() || undefined,
        onDelete: values.onDelete,
      });
      reset();
      onCreated();
      onClose();
    } catch (cause) {
      setError("root.server", {
        type: "server",
        message: getErrorMessage(cause, "Could not add this relationship."),
      });
    }
  });

  return (
    <DatabaseActionDialog
      open={open}
      title="Add Relationship"
      description={`Add a foreign key constraint on "${tableName}" to reference another table.`}
      submitLabel="Add Relationship"
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

        {/* Source column */}
        <Controller
          control={control}
          name="sourceColumn"
          render={({ field }) => (
            <FormControl fullWidth size="small" error={Boolean(errors.sourceColumn)}>
              <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: "text.secondary" }}>
                Source column on <code>{tableName}</code> *
              </Typography>
              {availableColumns.length > 0 ? (
                <Select {...field} displayEmpty disabled={isSubmitting}>
                  <MenuItem value="" disabled>
                    <em>Select column</em>
                  </MenuItem>
                  {availableColumns.map((col) => (
                    <MenuItem key={col} value={col}>
                      {col}
                    </MenuItem>
                  ))}
                </Select>
              ) : (
                <TextField
                  {...field}
                  size="small"
                  placeholder="e.g. user_id"
                  error={Boolean(errors.sourceColumn)}
                  disabled={isSubmitting}
                  slotProps={{ htmlInput: { autoCapitalize: "none", spellCheck: false } }}
                />
              )}
              {errors.sourceColumn && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.sourceColumn.message}
                </Typography>
              )}
            </FormControl>
          )}
        />

        {/* Target table + column side by side */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: "text.secondary", display: "block" }}>
              Target table *
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. users"
              error={Boolean(errors.targetTable)}
              helperText={errors.targetTable?.message}
              disabled={isSubmitting}
              slotProps={{ htmlInput: { autoCapitalize: "none", spellCheck: false } }}
              {...register("targetTable")}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: "text.secondary", display: "block" }}>
              Target column *
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="id"
              error={Boolean(errors.targetColumn)}
              helperText={errors.targetColumn?.message}
              disabled={isSubmitting}
              slotProps={{ htmlInput: { autoCapitalize: "none", spellCheck: false } }}
              {...register("targetColumn")}
            />
          </Box>
        </Box>

        {/* On Delete action */}
        <Controller
          control={control}
          name="onDelete"
          render={({ field }) => (
            <FormControl fullWidth size="small">
              <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: "text.secondary" }}>
                On delete
              </Typography>
              <Select {...field} disabled={isSubmitting}>
                <MenuItem value="NO ACTION">NO ACTION (default — raise error)</MenuItem>
                <MenuItem value="RESTRICT">RESTRICT (like NO ACTION, checked immediately)</MenuItem>
                <MenuItem value="CASCADE">CASCADE (delete child rows automatically)</MenuItem>
                <MenuItem value="SET NULL">SET NULL (set FK column to NULL)</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        {/* Optional constraint name */}
        <TextField
          fullWidth
          size="small"
          label="Constraint name (optional)"
          placeholder={
            sourceColumn
              ? `fk_${tableName}_${sourceColumn}_…`
              : "Auto-generated if left blank"
          }
          error={Boolean(errors.constraintName)}
          helperText={errors.constraintName?.message ?? "Leave blank to auto-generate."}
          disabled={isSubmitting}
          slotProps={{ htmlInput: { maxLength: 63, autoCapitalize: "none", spellCheck: false } }}
          {...register("constraintName")}
        />
      </Stack>
    </DatabaseActionDialog>
  );
}
