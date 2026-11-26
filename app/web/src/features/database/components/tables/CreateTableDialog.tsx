"use client";

import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconLink,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import {
  createDatabaseTable,
  fetchDatabaseRelationships,
  type NewTableDefinition,
} from "../../table.client-api";
import { getErrorMessage } from "@/lib/get-error-message";
import { DatabaseActionDialog } from "../DatabaseActionDialog";
import {
  createTableDefinitionSchema,
  type CreateTableDefinition,
  type CreateTableFormValues,
} from "../../schemas/table-actions.schema";
import type { ErTable } from "../../types";

const COLUMN_TYPES: Array<{
  value: CreateTableDefinition["columns"][number]["type"];
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

const DEFAULT_VALUES: CreateTableFormValues = {
  name: "",
  enableRls: false,
  columns: [
    {
      name: "",
      type: "text",
      nullable: true,
      isUnique: false,
      defaultValue: "",
      foreignKeyTable: "",
      foreignKeyColumn: "",
    },
  ],
};

interface Props {
  open: boolean;
  projectId: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateTableDialog({
  open,
  projectId,
  onClose,
  onCreated,
}: Props) {
  const [availableTables, setAvailableTables] = useState<ErTable[]>([]);
  const [expandedCols, setExpandedCols] = useState<Record<number, boolean>>({});

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateTableFormValues, unknown, CreateTableDefinition>({
    resolver: zodResolver(createTableDefinitionSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "columns",
  });

  useEffect(() => {
    if (!open) return;
    void fetchDatabaseRelationships(projectId)
      .then((data) => {
        if (data?.tables) setAvailableTables(data.tables);
      })
      .catch(() => {
        // Fallback: available tables remains empty
      });
  }, [open, projectId]);

  const toggleExpanded = (index: number) => {
    setExpandedCols((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const close = () => {
    if (isSubmitting) return;
    reset(DEFAULT_VALUES);
    setExpandedCols({});
    onClose();
  };

  const submit = handleSubmit(async (definition) => {
    try {
      const payload: NewTableDefinition = {
        name: definition.name,
        enableRls: Boolean(definition.enableRls),
        columns: definition.columns.map((col) => ({
          name: col.name,
          type: col.type,
          nullable: col.nullable,
          isUnique: Boolean(col.isUnique),
          defaultValue: col.defaultValue?.trim() || undefined,
          foreignKey:
            col.foreignKeyTable?.trim() && col.foreignKeyColumn?.trim()
              ? {
                  table: col.foreignKeyTable.trim(),
                  column: col.foreignKeyColumn.trim(),
                }
              : undefined,
        })),
      };

      await createDatabaseTable(projectId, payload);
      reset(DEFAULT_VALUES);
      setExpandedCols({});
      onCreated();
      onClose();
    } catch (cause) {
      setError("root.server", {
        type: "server",
        message: getErrorMessage(cause, "Could not create this table."),
      });
    }
  });

  return (
    <DatabaseActionDialog
      open={open}
      title="Create a table"
      description="Choose a name and define the fields your records need. You can also specify foreign keys, uniqueness, and defaults."
      submitLabel="Create table"
      submittingLabel="Creating…"
      saving={isSubmitting}
      maxWidth="md"
      onClose={close}
      onSubmit={submit}
    >
      <Stack spacing={4}>
        {errors.root?.server?.message && (
          <Alert severity="error" role="alert">
            {errors.root.server.message}
          </Alert>
        )}

        <TextField
          autoFocus
          fullWidth
          label="Table name"
          placeholder="e.g. blog_posts"
          error={Boolean(errors.name)}
          helperText={
            errors.name?.message ??
            "Use lowercase letters, numbers, and underscores. Names must start with a letter."
          }
          disabled={isSubmitting}
          slotProps={{
            htmlInput: {
              maxLength: 63,
              autoCapitalize: "none",
              autoComplete: "off",
              spellCheck: false,
            },
          }}
          {...register("name")}
        />

        <FormControlLabel
          control={
            <Controller
              control={control}
              name="enableRls"
              render={({ field }) => (
                <Checkbox
                  checked={Boolean(field.value)}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={isSubmitting}
                  size="small"
                />
              )}
            />
          }
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Enable Row Level Security (RLS)
              </Typography>
              <Typography variant="caption" sx={{ color: "text.disabled", display: "block" }}>
                Restrict row access via security policies. Recommended for tables storing user data.
              </Typography>
            </Box>
          }
          sx={{ alignItems: "flex-start", ml: -0.5 }}
        />

        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 2,
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Columns
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Add the fields that belong on each record.
              </Typography>
            </Box>
            <Button
              onClick={() =>
                append({
                  name: "",
                  type: "text",
                  nullable: true,
                  isUnique: false,
                  defaultValue: "",
                  foreignKeyTable: "",
                  foreignKeyColumn: "",
                })
              }
              disabled={isSubmitting || fields.length >= 30}
              startIcon={<IconPlus size={16} />}
              sx={{ flexShrink: 0 }}
            >
              Add column
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1.5,
              p: 2,
              mb: 2,
              border: "1px solid",
              borderColor: "border.default",
              borderRadius: 2,
              bgcolor: "background.elevated",
            }}
          >
            <IconCircleCheck size={18} color="#10B981" aria-hidden />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                id · UUID · primary key
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Generated automatically for every row.
              </Typography>
            </Box>
          </Box>

          <Stack spacing={2}>
            {fields.map((field, index) => {
              const columnError = errors.columns?.[index];
              const selectedFkTable = watch(`columns.${index}.foreignKeyTable`);
              const isExpanded = Boolean(expandedCols[index]);
              const targetTableObj = availableTables.find(
                (t) => t.name === selectedFkTable,
              );
              const targetColumns = targetTableObj?.columns ?? [];

              return (
                <Box
                  key={field.id}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    border: "1px solid",
                    borderColor: columnError ? "error.main" : "border.default",
                    borderRadius: 2,
                    bgcolor: "background.default",
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr auto",
                        sm: "minmax(140px, 1fr) minmax(130px, 0.8fr) auto auto auto",
                      },
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <TextField
                      size="small"
                      fullWidth
                      label={`Column ${index + 1} name`}
                      placeholder="e.g. title"
                      disabled={isSubmitting}
                      error={Boolean(columnError?.name)}
                      helperText={columnError?.name?.message}
                      slotProps={{
                        htmlInput: {
                          maxLength: 63,
                          autoCapitalize: "none",
                          spellCheck: false,
                        },
                      }}
                      sx={{ gridColumn: { xs: "1", sm: "auto" } }}
                      {...register(`columns.${index}.name`)}
                    />
                    <Controller
                      control={control}
                      name={`columns.${index}.type`}
                      render={({ field: typeField }) => (
                        <FormControl
                          size="small"
                          fullWidth
                          sx={{ gridColumn: { xs: "1", sm: "auto" } }}
                        >
                          <Select
                            {...typeField}
                            disabled={isSubmitting}
                            renderValue={(value) =>
                              COLUMN_TYPES.find((type) => type.value === value)
                                ?.label ?? value
                            }
                            aria-label={`Type for column ${index + 1}`}
                            onChange={(event) => {
                              const type = event.target
                                .value as CreateTableDefinition["columns"][number]["type"];
                              typeField.onChange(type);
                            }}
                          >
                            {COLUMN_TYPES.map((type) => (
                              <MenuItem key={type.value} value={type.value}>
                                <Box>
                                  <Typography variant="body2">
                                    {type.label}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {type.detail}
                                  </Typography>
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
                          control={
                            <Checkbox
                              size="small"
                              checked={nullableField.value}
                              disabled={isSubmitting}
                              onChange={nullableField.onChange}
                            />
                          }
                          label={
                            <Typography variant="body2">Allow empty</Typography>
                          }
                        />
                      )}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        gridColumn: { xs: "2", sm: "auto" },
                      }}
                    >
                      <Tooltip title="Configure constraints (Foreign Key, Unique, Default)">
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => toggleExpanded(index)}
                          endIcon={
                            isExpanded ? (
                              <IconChevronUp size={14} />
                            ) : (
                              <IconChevronDown size={14} />
                            )
                          }
                          sx={{
                            fontSize: 12,
                            textTransform: "none",
                            color:
                              selectedFkTable || watch(`columns.${index}.isUnique`)
                                ? "primary.main"
                                : "text.secondary",
                          }}
                        >
                          {selectedFkTable ? "FK linked" : "More"}
                        </Button>
                      </Tooltip>
                      <IconButton
                        aria-label={`Remove column ${index + 1}`}
                        onClick={() => remove(index)}
                        disabled={isSubmitting || fields.length <= 1}
                        size="small"
                      >
                        <IconTrash size={17} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Expandable Advanced Settings (Foreign Key, Unique, Default) */}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box
                      sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: "1px dashed",
                        borderColor: "border.default",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                          gap: 2,
                          alignItems: "center",
                        }}
                      >
                        {/* Unique Checkbox */}
                        <Controller
                          control={control}
                          name={`columns.${index}.isUnique`}
                          render={({ field: uniqueField }) => (
                            <FormControlLabel
                              sx={{ m: 0 }}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={Boolean(uniqueField.value)}
                                  disabled={isSubmitting}
                                  onChange={uniqueField.onChange}
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    Unique constraint
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Enforce distinct values in this column
                                  </Typography>
                                </Box>
                              }
                            />
                          )}
                        />

                        {/* Default Value TextField */}
                        <TextField
                          size="small"
                          fullWidth
                          label="Default value (optional)"
                          placeholder="e.g. active, 0, false"
                          disabled={isSubmitting}
                          slotProps={{
                            htmlInput: {
                              maxLength: 100,
                              autoCapitalize: "none",
                              spellCheck: false,
                            },
                          }}
                          {...register(`columns.${index}.defaultValue`)}
                        />
                      </Box>

                      {/* Foreign Key Section */}
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: "background.elevated",
                          border: "1px solid",
                          borderColor: "border.subtle",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1.5,
                          }}
                        >
                          <IconLink size={15} />
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: "text.secondary",
                            }}
                          >
                            Foreign Key Reference (Optional)
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                            gap: 1.5,
                          }}
                        >
                          {/* Target Table Dropdown */}
                          <Controller
                            control={control}
                            name={`columns.${index}.foreignKeyTable`}
                            render={({ field: fkTableField }) => (
                              <FormControl size="small" fullWidth>
                                <Select
                                  value={fkTableField.value || ""}
                                  displayEmpty
                                  disabled={isSubmitting}
                                  onChange={(e) => {
                                    const val = e.target.value as string;
                                    fkTableField.onChange(val);
                                    if (val) {
                                      // If table has an 'id' column, preselect it
                                      const tbl = availableTables.find(
                                        (t) => t.name === val,
                                      );
                                      const hasId = tbl?.columns.some(
                                        (c) => c.name === "id",
                                      );
                                      setValue(
                                        `columns.${index}.foreignKeyColumn`,
                                        hasId
                                          ? "id"
                                          : (tbl?.columns[0]?.name ?? ""),
                                      );
                                    } else {
                                      setValue(
                                        `columns.${index}.foreignKeyColumn`,
                                        "",
                                      );
                                    }
                                  }}
                                >
                                  <MenuItem value="">
                                    <em>None (no foreign key)</em>
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

                          {/* Target Column Dropdown */}
                          <Controller
                            control={control}
                            name={`columns.${index}.foreignKeyColumn`}
                            render={({ field: fkColField }) => (
                              <FormControl
                                size="small"
                                fullWidth
                                disabled={!selectedFkTable || isSubmitting}
                                error={Boolean(columnError?.foreignKeyColumn)}
                              >
                                <Select
                                  value={fkColField.value || ""}
                                  displayEmpty
                                  onChange={fkColField.onChange}
                                >
                                  <MenuItem value="" disabled>
                                    <em>Select referenced column</em>
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
                        {columnError?.foreignKeyColumn && (
                          <Typography
                            color="error"
                            variant="caption"
                            sx={{ display: "block", mt: 0.5 }}
                          >
                            {columnError.foreignKeyColumn.message}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Stack>

          {errors.columns?.root?.message && (
            <Typography color="error" variant="caption" role="alert">
              {errors.columns.root.message}
            </Typography>
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1.5 }}
          >
            Up to 30 custom columns. Primary key UUID is generated automatically.
          </Typography>
        </Box>
      </Stack>
    </DatabaseActionDialog>
  );
}
