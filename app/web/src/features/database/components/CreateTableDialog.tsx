"use client";

import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert, Box, Button, Checkbox, FormControl, FormControlLabel,
  IconButton, MenuItem, Select, Stack, TextField, Typography,
} from "@mui/material";
import { IconCircleCheck, IconPlus, IconTrash } from "@tabler/icons-react";
import { createDatabaseTable } from "../table.client-api";
import { getErrorMessage } from "@/lib/get-error-message";
import { DatabaseActionDialog } from "./DatabaseActionDialog";
import {
  createTableDefinitionSchema,
  type CreateTableDefinition,
  type CreateTableFormValues,
} from "../schemas/table-actions.schema";

const COLUMN_TYPES: Array<{ value: CreateTableDefinition["columns"][number]["type"]; label: string; detail: string }> = [
  { value: "text", label: "Text", detail: "Words and longer text" },
  { value: "integer", label: "Integer", detail: "Whole numbers" },
  { value: "bigint", label: "Big integer", detail: "Large whole numbers" },
  { value: "boolean", label: "Boolean", detail: "True or false" },
  { value: "uuid", label: "UUID", detail: "Unique identifiers" },
  { value: "timestamptz", label: "Timestamp", detail: "Date and time" },
  { value: "jsonb", label: "JSON", detail: "Structured data" },
];

const DEFAULT_VALUES: CreateTableFormValues = {
  name: "",
  columns: [{ name: "", type: "text", nullable: true }],
};

interface Props {
  open: boolean;
  projectId: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateTableDialog({ open, projectId, onClose, onCreated }: Props) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateTableFormValues, unknown, CreateTableDefinition>({
    resolver: zodResolver(createTableDefinitionSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });
  const { fields, append, remove } = useFieldArray({ control, name: "columns" });

  const close = () => {
    if (isSubmitting) return;
    reset(DEFAULT_VALUES);
    onClose();
  };

  const submit = handleSubmit(async (definition) => {
    try {
      await createDatabaseTable(projectId, definition);
      reset(DEFAULT_VALUES);
      onCreated();
      onClose();
    } catch (cause) {
      setError("root.server", { type: "server", message: getErrorMessage(cause, "Could not create this table.") });
    }
  });

  return (
    <DatabaseActionDialog
      open={open}
      title="Create a table"
      description="Choose a name and define the fields your records need. Your table is created inside this project’s database."
      submitLabel="Create table"
      submittingLabel="Creating…"
      saving={isSubmitting}
      maxWidth="md"
      onClose={close}
      onSubmit={submit}
    >
      <Stack spacing={4}>
        {errors.root?.server?.message && <Alert severity="error" role="alert">{errors.root.server.message}</Alert>}

        <TextField
          autoFocus
          fullWidth
          label="Table name"
          placeholder="e.g. blog_posts"
          error={Boolean(errors.name)}
          helperText={errors.name?.message ?? "Use lowercase letters, numbers, and underscores. Names must start with a letter."}
          disabled={isSubmitting}
          slotProps={{ htmlInput: { maxLength: 63, autoCapitalize: "none", autoComplete: "off", spellCheck: false } }}
          {...register("name")}
        />

        <Box>
          <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Columns</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Add the fields that belong on each record.
              </Typography>
            </Box>
            <Button
              onClick={() => append({ name: "", type: "text", nullable: true })}
              disabled={isSubmitting || fields.length >= 30}
              startIcon={<IconPlus size={16} />}
              sx={{ flexShrink: 0 }}
            >
              Add column
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, p: 2, mb: 2, border: "1px solid", borderColor: "border.default", borderRadius: 2, bgcolor: "background.elevated" }}>
            <IconCircleCheck size={18} color="#10B981" aria-hidden />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>id · UUID · primary key</Typography>
              <Typography variant="caption" color="text.secondary">Generated automatically for every row.</Typography>
            </Box>
          </Box>

          <Stack spacing={1.5}>
            {fields.map((field, index) => {
              const columnError = errors.columns?.[index];
              return (
                <Box key={field.id} sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr) auto", sm: "minmax(140px, 1fr) minmax(125px, .8fr) auto auto auto" }, alignItems: "center", gap: 1.5, p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: columnError ? "error.main" : "border.default", borderRadius: 2, bgcolor: "background.default" }}>
                  <TextField
                    size="small"
                    fullWidth
                    label={`Column ${index + 1} name`}
                    placeholder="e.g. title"
                    disabled={isSubmitting}
                    error={Boolean(columnError?.name)}
                    helperText={columnError?.name?.message}
                    slotProps={{ htmlInput: { maxLength: 63, autoCapitalize: "none", spellCheck: false } }}
                    sx={{ gridColumn: { xs: "1", sm: "auto" } }}
                    {...register(`columns.${index}.name`)}
                  />
                  <Controller
                    control={control}
                    name={`columns.${index}.type`}
                    render={({ field: typeField }) => (
                      <FormControl size="small" fullWidth sx={{ gridColumn: { xs: "1", sm: "auto" } }}>
                        <Select
                          {...typeField}
                          disabled={isSubmitting}
                          renderValue={(value) => COLUMN_TYPES.find((type) => type.value === value)?.label ?? value}
                          aria-label={`Type for column ${index + 1}`}
                          onChange={(event) => {
                            const type = event.target.value as CreateTableDefinition["columns"][number]["type"];
                            typeField.onChange(type);
                          }}
                        >
                          {COLUMN_TYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              <Box>
                                <Typography variant="body2">{type.label}</Typography>
                                <Typography variant="caption" color="text.secondary">{type.detail}</Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                  <Controller
                    control={control}
                    name={`columns.${index}.nullable`}
                    render={({ field: nullableField }) => (
                      <FormControlLabel
                        sx={{ m: 0, gridColumn: { xs: "1", sm: "auto" } }}
                        control={<Checkbox size="small" checked={nullableField.value} disabled={isSubmitting} onChange={nullableField.onChange} />}
                        label={<Typography variant="body2">Allow empty</Typography>}
                      />
                    )}
                  />
                  <IconButton
                    aria-label={`Remove column ${index + 1}`}
                    onClick={() => remove(index)}
                    disabled={isSubmitting || fields.length <= 1}
                    sx={{ gridColumn: { xs: "2", sm: "auto" }, gridRow: { xs: "1 / 4", sm: "auto" }, alignSelf: { xs: "start", sm: "center" } }}
                  >
                    <IconTrash size={17} />
                  </IconButton>
                </Box>
              );
            })}
          </Stack>
          {errors.columns?.root?.message && <Typography color="error" variant="caption" role="alert">{errors.columns.root.message}</Typography>}
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
            Up to 30 custom columns. UUID values are generated automatically; you can enter a different UUID when adding a row.
          </Typography>
        </Box>
      </Stack>
    </DatabaseActionDialog>
  );
}
