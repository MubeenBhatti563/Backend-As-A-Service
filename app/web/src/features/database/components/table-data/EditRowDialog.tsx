"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Box,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { GridColumn, GridRow } from "../../types";
import {
  updateDatabaseRow,
  fetchForeignKeyOptions,
} from "../../table.client-api";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  createAddRowSchema,
  normalizeDatabaseType,
} from "../../schemas/table-actions.schema";
import { DatabaseActionDialog } from "../DatabaseActionDialog";

interface Props {
  open: boolean;
  projectId: string;
  tableName: string;
  columns: GridColumn[];
  row: GridRow | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditRowDialog({
  open,
  projectId,
  tableName,
  columns,
  row,
  onClose,
  onUpdated,
}: Props) {
  const writableColumns = useMemo(
    () => columns.filter((column) => column.writable),
    [columns],
  );
  const foreignKeyColumns = useMemo(
    () => writableColumns.filter((column) => column.foreignKey),
    [writableColumns],
  );
  const managedTimestamps = useMemo(
    () =>
      columns.filter(
        (column) =>
          ["created_at", "updated_at"].includes(column.key) && column.hasDefault,
      ),
    [columns],
  );

  const [foreignKeyOptions, setForeignKeyOptions] = useState<
    Record<string, string[]>
  >({});
  const [foreignKeyLoading, setForeignKeyLoading] = useState(false);
  const [foreignKeyError, setForeignKeyError] = useState("");

  const schema = useMemo(
    () => createAddRowSchema(writableColumns),
    [writableColumns],
  );

  const defaultValues = useMemo(() => {
    if (!row) return {};
    const vals: Record<string, string> = {};
    for (const col of writableColumns) {
      const raw = row[col.key];
      vals[col.key] = raw === "NULL" || raw == null ? "" : String(raw);
    }
    return vals;
  }, [row, writableColumns]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, string>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  useEffect(() => {
    if (row && open) {
      reset(defaultValues);
    }
  }, [row, open, defaultValues, reset]);

  useEffect(() => {
    if (!open || foreignKeyColumns.length === 0) return;
    let cancelled = false;
    void Promise.resolve()
      .then(() => {
        if (cancelled) return [];
        setForeignKeyLoading(true);
        setForeignKeyError("");
        return Promise.all(
          foreignKeyColumns.map(async (column) => {
            try {
              const result = await fetchForeignKeyOptions(
                projectId,
                tableName,
                column.key,
              );
              return [column.key, result.values] as const;
            } catch {
              return [column.key, null] as const;
            }
          }),
        );
      })
      .then((results) => {
        if (cancelled) return;
        setForeignKeyLoading(false);
        setForeignKeyOptions(
          Object.fromEntries(
            results.filter(
              (result): result is readonly [string, string[]] =>
                result[1] !== null,
            ),
          ),
        );
        setForeignKeyError(
          results.some((result) => result[1] === null)
            ? "Could not load one or more related records. Close and reopen the form to retry."
            : "",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [open, projectId, tableName, foreignKeyColumns]);

  const close = () => {
    if (isSubmitting) return;
    reset(defaultValues);
    onClose();
  };

  const submit = handleSubmit(async (values) => {
    if (!row) return;
    const payload: Record<string, string | null> = {};

    for (const col of writableColumns) {
      const key = col.key;
      const rawVal = values[key];
      const strVal = rawVal !== undefined && rawVal !== null ? String(rawVal).trim() : "";
      const type = normalizeDatabaseType(col.dataType ?? "text");

      if (strVal === "") {
        if (col.nullable) {
          payload[key] = null;
        }
      } else {
        payload[key] =
          type === "timestamp with time zone"
            ? new Date(strVal).toISOString()
            : strVal;
      }
    }

    try {
      await updateDatabaseRow(projectId, tableName, row.id, payload);
      onClose();
      onUpdated();
    } catch (cause) {
      setError("root.server", {
        type: "server",
        message: getErrorMessage(cause, "Could not update this row."),
      });
    }
  });

  return (
    <DatabaseActionDialog
      open={open}
      title="Edit row"
      description={`Update field values for record "${row?.id ?? ""}". Leave optional fields blank to set to NULL.`}
      submitLabel="Save changes"
      submittingLabel="Saving…"
      saving={isSubmitting}
      submitDisabled={foreignKeyLoading}
      onClose={close}
      onSubmit={submit}
    >
      <Stack spacing={3}>
        {errors.root?.server?.message && (
          <Alert severity="error" role="alert">
            {errors.root.server.message}
          </Alert>
        )}
        {foreignKeyError && (
          <Alert severity="warning" role="alert">
            {foreignKeyError}
          </Alert>
        )}
        {managedTimestamps.length > 0 && (
          <Alert severity="info">
            {managedTimestamps.map((column) => column.label).join(" and ")}{" "}
            {managedTimestamps.length === 1 ? "is" : "are"} updated automatically
            by the database.
          </Alert>
        )}
        {writableColumns.length === 0 ? (
          <Alert severity="info">
            This table has no editable fields. Generated and sensitive fields
            cannot be edited.
          </Alert>
        ) : (
          <>
            <Box sx={{ mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Record values
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {writableColumns.length} editable{" "}
                {writableColumns.length === 1 ? "field" : "fields"}.
              </Typography>
            </Box>
            {writableColumns.map((column, index) => {
              const type = normalizeDatabaseType(column.dataType ?? "text");
              const isJson = type === "jsonb" || type === "json";
              const isNumber = [
                "integer",
                "numeric",
                "real",
                "double precision",
              ].includes(type);
              const optional = Boolean(column.nullable || column.hasDefault);
              const inputType =
                type === "date"
                  ? "date"
                  : type.includes("timestamp")
                    ? "datetime-local"
                    : isNumber
                      ? "number"
                      : "text";
              const fieldError = errors[column.key]?.message;
              const helperText =
                fieldError ??
                (column.foreignKey
                  ? `Select an existing ${column.foreignKey.tableName}.${column.foreignKey.columnName}`
                  : `${column.dataType ?? "Text"} · ${optional ? "Optional (NULL if blank)" : "Required"}`);

              const inputProps = {
                fullWidth: true,
                label: column.label,
                disabled: isSubmitting,
                required: !optional,
                error: Boolean(fieldError),
                helperText,
                multiline: isJson,
                minRows: isJson ? 4 : undefined,
                type: inputType,
                autoFocus: index === 0,
                placeholder: isJson
                  ? '{"key": "value"}'
                  : type === "uuid"
                    ? "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    : undefined,
                slotProps: {
                  htmlInput: {
                    step: type === "integer" ? 1 : "any",
                    inputMode: ["bigint", "uuid"].includes(type)
                      ? ("text" as const)
                      : undefined,
                    spellCheck: isJson ? false : undefined,
                  },
                },
              };

              if (column.foreignKey) {
                const options = foreignKeyOptions[column.key] ?? [];
                return (
                  <Controller
                    key={column.key}
                    name={column.key}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...inputProps}
                        select
                        name={field.name}
                        inputRef={field.ref}
                        value={field.value ?? ""}
                        onBlur={field.onBlur}
                        onChange={(event) => {
                          clearErrors("root.server");
                          field.onChange(event.target.value);
                        }}
                        disabled={
                          isSubmitting ||
                          foreignKeyLoading ||
                          options.length === 0
                        }
                      >
                        {column.nullable && (
                          <MenuItem value="">NULL (not set)</MenuItem>
                        )}
                        {options.map((option) => (
                          <MenuItem
                            key={option}
                            value={option}
                            sx={{ fontFamily: "monospace", fontSize: 13 }}
                          >
                            {option}
                          </MenuItem>
                        ))}
                        {options.length === 0 && (
                          <MenuItem disabled value="">
                            {foreignKeyLoading
                              ? "Loading related records…"
                              : "No related records found"}
                          </MenuItem>
                        )}
                      </TextField>
                    )}
                  />
                );
              }

              return (
                <TextField
                  key={column.key}
                  {...inputProps}
                  {...register(column.key, {
                    onChange: () => clearErrors("root.server"),
                  })}
                />
              );
            })}
          </>
        )}
      </Stack>
    </DatabaseActionDialog>
  );
}
