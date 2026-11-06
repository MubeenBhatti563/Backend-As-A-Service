"use client";
// CreateProjectStep.tsx – right side of onboarding step 2 ("Create your first project").
// Needs: @mui/material, @tabler/icons-react, next, react-hook-form, zod, @hookform/resolvers
// and ./create-project.schema.ts. Render it inside <OnboardingLayout currentStep="project">.
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button } from "@mui/material";
import { IconArrowRight, IconFlag } from "@tabler/icons-react";
import { Controller, useForm } from "react-hook-form";
import {
  createProjectSchema,
  PROJECT_REGIONS,
  type CreateProjectFormValues,
  type CreateProjectPayload,
} from "../../schemas/create-project.schema";
import { Field, SelectField } from "./OnboardingField";
import { StepHeader } from "./StepHeader";

const COPY = {
  label: "Infrastructure Setup",
  title: "Create your project",
  description:
    "Establish a new isolated secure cloud runtime to start building schemas and deploying logic.",
  nameLabel: "Project Name",
  namePlaceholder: "my-saas-app",
  descriptionLabel: "Project Description",
  descriptionPlaceholder:
    "Production backend instance for my next-gen application services.",
  regionLabel: "Database Deployment Region",
  back: "Back",
  submit: "Create Project Instance",
} as const;

interface CreateProjectStepProps {
  onSubmit?: (payload: CreateProjectPayload) => Promise<void>;
  onSuccess: () => void;
  onBack: () => void;
}

export function CreateProjectStep({
  onSubmit,
  onSuccess,
  onBack,
}: CreateProjectStepProps) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", description: "", region: "us-east-1" },
    mode: "onTouched",
  });

  const submit = handleSubmit(async (values) => {
    try {
      if (!onSubmit)
        throw new Error("Project creation is not connected to a backend yet.");
      await onSubmit(values);
      onSuccess();
    } catch (error) {
      setError("root.server", {
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    }
  });

  return (
    <Box
      component="form"
      noValidate
      onSubmit={submit}
      sx={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}
    >
      <StepHeader
        step={2}
        label={COPY.label}
        title={COPY.title}
        description={COPY.description}
      />

      {errors.root?.server?.message && (
        <Alert severity="error" role="alert" sx={{ mt: -5 }}>
          {errors.root.server.message}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Field
          label={COPY.nameLabel}
          registration={register("name")}
          error={errors.name?.message}
          placeholder={COPY.namePlaceholder}
          autoComplete="off"
        />
        <Field
          label={COPY.descriptionLabel}
          registration={register("description")}
          error={errors.description?.message}
          placeholder={COPY.descriptionPlaceholder}
          multiline
        />
        <Controller
          name="region"
          control={control}
          render={({ field }) => (
            <SelectField
              label={COPY.regionLabel}
              error={errors.region?.message}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              options={PROJECT_REGIONS}
              startIcon={<IconFlag size={16} color="#3B82F6" aria-hidden />}
            />
          )}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Button
          onClick={onBack}
          variant="text"
          sx={{
            flex: "none",
            minHeight: 42,
            py: 0,
            px: 4,
            borderRadius: 1,
            color: "text.disabled",
            fontSize: 14,
            fontWeight: 500,
            "&:hover": { color: "text.primary", bgcolor: "transparent" },
          }}
        >
          {COPY.back}
        </Button>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          loading={isSubmitting}
          loadingPosition="end"
          endIcon={<IconArrowRight size={16} aria-hidden />}
          sx={{ flex: 1, minHeight: 42, py: 0, gap: 0.5 }}
        >
          {COPY.submit}
        </Button>
      </Box>
    </Box>
  );
}
