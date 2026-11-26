"use client";

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
import {
  createDatabaseIndex,
  type CreateIndexRequest,
} from "../table.client-api";
import { getErrorMessage } from "@/lib/get-error-message";
import { DatabaseActionDialog } from "./DatabaseActionDialog";

const createIndexFormSchema = z.object({
  name: z
    .string()
    .trim()
    .max(63)
    .optional()
    .refine((val) => !val || /^[a-z][a-z0-9_]*$/.test(val), {
      message: "Use lowercase letters, numbers, and underscores; start with a letter.",
    }),
  columns: z.array(z.string()).min(1, "Select at least one column to index."),
  method: z.enum(["btree", "hash", "gin", "gist"]),
  isUnique: z.boolean(),
});

type CreateIndexFormValues = z.infer<typeof createIndexFormSchema>;

interface Props {
  open: boolean;
  projectId: string;
  tableName: string;
  availableColumns: string[];
  onClose: () => void;
  onCreated: () => void;
}

export function CreateIndexDialog({
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
    formState: { errors, isSubmitting },
  } = useForm<CreateIndexFormValues>({
    resolver: zodResolver(createIndexFormSchema),
    defaultValues: {
      name: "",
      columns: [],
      method: "btree",
      isUnique: false,
    },
    mode: "onTouched",
  });

  const close = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  const submit = handleSubmit(async (values) => {
    try {
      const payload: CreateIndexRequest = {
        name: values.name?.trim() || undefined,
        columns: values.columns,
        method: values.method,
        isUnique: values.isUnique,
      };

      await createDatabaseIndex(projectId, tableName, payload);
      reset();
      onCreated();
      onClose();
    } catch (cause) {
      setError("root.server", {
        type: "server",
        message: getErrorMessage(cause, "Could not create this index."),
      });
    }
  });

  return (
    <DatabaseActionDialog
      open={open}
      title="Create index"
      description={`Add an index on "${tableName}" to speed up search and query lookups.`}
      submitLabel="Create index"
      submittingLabel="Creating…"
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
          label="Index name (optional)"
          placeholder={`e.g. ${tableName}_created_at_idx`}
          error={Boolean(errors.name)}
          helperText={errors.name?.message ?? "Leave blank to auto-generate from column names."}
          disabled={isSubmitting}
          slotProps={{ htmlInput: { maxLength: 63, autoCapitalize: "none", spellCheck: false } }}
          {...register("name")}
        />

        {/* Column Selection */}
        <Controller
          control={control}
          name="columns"
          render={({ field }) => (
            <FormControl fullWidth size="small" error={Boolean(errors.columns)}>
              <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: "text.secondary" }}>
                Target column(s) *
              </Typography>
              <Select
                multiple
                value={field.value}
                onChange={field.onChange}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((val) => (
                      <Typography key={val} sx={{ typography: "code", fontSize: 12, bgcolor: "background.elevated", px: 1, py: 0.25, borderRadius: 1 }}>
                        {val}
                      </Typography>
                    ))}
                  </Box>
                )}
              >
                {availableColumns.map((col) => (
                  <MenuItem key={col} value={col}>
                    <Checkbox size="small" checked={field.value.includes(col)} />
                    <Typography sx={{ typography: "code", fontSize: 13 }}>{col}</Typography>
                  </MenuItem>
                ))}
              </Select>
              {errors.columns && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.columns.message}
                </Typography>
              )}
            </FormControl>
          )}
        />

        {/* Index Method */}
        <Controller
          control={control}
          name="method"
          render={({ field }) => (
            <FormControl fullWidth size="small">
              <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: "text.secondary" }}>
                Index method
              </Typography>
              <Select {...field} disabled={isSubmitting}>
                <MenuItem value="btree">btree (General purpose, comparisons & sorting)</MenuItem>
                <MenuItem value="hash">hash (Equality checks)</MenuItem>
                <MenuItem value="gin">gin (JSONB, full text & array searching)</MenuItem>
                <MenuItem value="gist">gist (Geometric & full text indexing)</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        {/* Unique Checkbox */}
        <Controller
          control={control}
          name="isUnique"
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox size="small" checked={field.value} disabled={isSubmitting} onChange={field.onChange} />}
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Unique index
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Enforces that values across the indexed columns are unique
                  </Typography>
                </Box>
              }
            />
          )}
        />
      </Stack>
    </DatabaseActionDialog>
  );
}
