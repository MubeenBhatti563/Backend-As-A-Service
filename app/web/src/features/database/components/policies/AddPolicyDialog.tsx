"use client";

import { useEffect, useState } from "react";
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
import {
  createDatabaseTablePolicy,
} from "../../table.client-api";
import { getErrorMessage } from "@/lib/get-error-message";
import { DatabaseActionDialog } from "../DatabaseActionDialog";
import type { CreatePolicyRequest, PolicyCommand } from "../../types";

const IDENT = /^[a-z_][a-z0-9_]{0,62}$/;

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Policy name is required.")
    .max(63, "Policy name must be 63 characters or fewer.")
    .regex(IDENT, "Use lowercase letters, numbers, and underscores."),
  command: z.enum(["ALL", "SELECT", "INSERT", "UPDATE", "DELETE"]),
  roles: z.string().trim(),
  using: z.string().trim().optional(),
  withCheck: z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

interface PolicyTemplate {
  id: string;
  label: string;
  description: string;
  name: string;
  command: PolicyCommand;
  roles: string;
  using?: string;
  withCheck?: string;
}

const TEMPLATES: PolicyTemplate[] = [
  {
    id: "custom",
    label: "Custom Policy",
    description: "Write your own custom SQL expressions.",
    name: "",
    command: "SELECT",
    roles: "public",
    using: "",
    withCheck: "",
  },
  {
    id: "public_read",
    label: "Public Read Access",
    description: "Allow everyone (including unauthenticated visitors) to read rows.",
    name: "enable_public_read",
    command: "SELECT",
    roles: "public",
    using: "true",
  },
  {
    id: "auth_read",
    label: "Authenticated Read",
    description: "Allow only logged-in users to read rows.",
    name: "enable_authenticated_read",
    command: "SELECT",
    roles: "authenticated",
    using: "true",
  },
  {
    id: "user_ownership",
    label: "User Owns Rows (auth.uid())",
    description: "Users can read, update, and delete their own rows matching user_id.",
    name: "users_own_records",
    command: "ALL",
    roles: "authenticated",
    using: "auth.uid() = user_id",
    withCheck: "auth.uid() = user_id",
  },
  {
    id: "auth_insert",
    label: "Authenticated Insert",
    description: "Allow logged-in users to insert rows.",
    name: "enable_insert_for_authenticated",
    command: "INSERT",
    roles: "authenticated",
    withCheck: "true",
  },
];

interface Props {
  open: boolean;
  projectId: string;
  tableName: string;
  onClose: () => void;
  onCreated: () => void;
}

export function AddPolicyDialog({
  open,
  projectId,
  tableName,
  onClose,
  onCreated,
}: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState("custom");

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      command: "SELECT",
      roles: "public",
      using: "",
      withCheck: "",
    },
    mode: "onTouched",
  });

  const command = watch("command");

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const tmpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl || tmpl.id === "custom") return;

    setValue("name", tmpl.name, { shouldValidate: true });
    setValue("command", tmpl.command, { shouldValidate: true });
    setValue("roles", tmpl.roles, { shouldValidate: true });
    setValue("using", tmpl.using ?? "", { shouldValidate: true });
    setValue("withCheck", tmpl.withCheck ?? "", { shouldValidate: true });
  };

  const close = () => {
    if (isSubmitting) return;
    reset();
    setSelectedTemplate("custom");
    onClose();
  };

  const submit = handleSubmit(async (values) => {
    try {
      const rolesArray = values.roles
        .split(",")
        .map((r: string) => r.trim())
        .filter(Boolean);

      const request: CreatePolicyRequest = {
        name: values.name.trim(),
        command: values.command,
        roles: rolesArray.length > 0 ? rolesArray : ["public"],
        using: values.using?.trim() || undefined,
        withCheck: values.withCheck?.trim() || undefined,
      };

      await createDatabaseTablePolicy(projectId, tableName, request);
      reset();
      setSelectedTemplate("custom");
      onCreated();
      onClose();
    } catch (cause) {
      setError("root.server", {
        type: "server",
        message: getErrorMessage(cause, "Could not create this policy."),
      });
    }
  });

  const isInsert = command === "INSERT";
  const isSelectOrDelete = command === "SELECT" || command === "DELETE";

  return (
    <DatabaseActionDialog
      open={open}
      title="Create Security Policy"
      description={`Add a Row-Level Security (RLS) policy on table "${tableName}".`}
      submitLabel="Create Policy"
      submittingLabel="Creating…"
      saving={isSubmitting}
      maxWidth="md"
      onClose={close}
      onSubmit={submit}
    >
      <Stack spacing={3}>
        {errors.root?.server?.message && (
          <Alert severity="error" role="alert">
            {errors.root.server.message}
          </Alert>
        )}

        {/* Template Selector */}
        <Box>
          <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: "text.secondary", display: "block" }}>
            Policy template
          </Typography>
          <Select
            fullWidth
            size="small"
            value={selectedTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
            disabled={isSubmitting}
          >
            {TEMPLATES.map((tmpl) => (
              <MenuItem key={tmpl.id} value={tmpl.id}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {tmpl.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {tmpl.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Policy Name + Command row */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr" }, gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: "text.secondary", display: "block" }}>
              Policy name *
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. enable_read_for_all_users"
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              disabled={isSubmitting}
              slotProps={{ htmlInput: { autoCapitalize: "none", spellCheck: false } }}
              {...register("name")}
            />
          </Box>

          <Controller
            control={control}
            name="command"
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: "text.secondary" }}>
                  Action / Command
                </Typography>
                <Select {...field} disabled={isSubmitting}>
                  <MenuItem value="ALL">ALL (SELECT, INSERT, UPDATE, DELETE)</MenuItem>
                  <MenuItem value="SELECT">SELECT (Read)</MenuItem>
                  <MenuItem value="INSERT">INSERT (Create)</MenuItem>
                  <MenuItem value="UPDATE">UPDATE (Modify)</MenuItem>
                  <MenuItem value="DELETE">DELETE (Remove)</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Box>

        {/* Target Roles */}
        <Box>
          <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: "text.secondary", display: "block" }}>
            Target roles (comma-separated, default: public)
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="public, authenticated, anon"
            error={Boolean(errors.roles)}
            helperText={errors.roles?.message ?? "Enter 'public' for all callers, or 'authenticated' for signed-in users."}
            disabled={isSubmitting}
            slotProps={{ htmlInput: { autoCapitalize: "none", spellCheck: false } }}
            {...register("roles")}
          />
        </Box>

        {/* USING clause expression */}
        {!isInsert && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                USING expression {isSelectOrDelete ? "*" : "(optional for reads/updates)"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                e.g. <code>true</code> or <code>auth.uid() = user_id</code>
              </Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              placeholder="true"
              error={Boolean(errors.using)}
              helperText={
                errors.using?.message ??
                "PostgreSQL boolean expression that determines which existing rows can be read or modified."
              }
              disabled={isSubmitting}
              slotProps={{ htmlInput: { autoCapitalize: "none", spellCheck: false, style: { fontFamily: "monospace" } } }}
              {...register("using")}
            />
          </Box>
        )}

        {/* WITH CHECK clause expression */}
        {!isSelectOrDelete && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                WITH CHECK expression {isInsert ? "*" : "(optional for inserts/updates)"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                e.g. <code>true</code> or <code>auth.uid() = user_id</code>
              </Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              placeholder="true"
              error={Boolean(errors.withCheck)}
              helperText={
                errors.withCheck?.message ??
                "PostgreSQL boolean expression that validates new or updated rows being written."
              }
              disabled={isSubmitting}
              slotProps={{ htmlInput: { autoCapitalize: "none", spellCheck: false, style: { fontFamily: "monospace" } } }}
              {...register("withCheck")}
            />
          </Box>
        )}
      </Stack>
    </DatabaseActionDialog>
  );
}
