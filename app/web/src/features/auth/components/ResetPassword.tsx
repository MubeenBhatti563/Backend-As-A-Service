"use client";
// ResetPasswordForm.tsx – right side of the "Set New Password" screen (Next.js App Router).
// Needs: @mui/material, @tabler/icons-react, next, react-hook-form, zod, @hookform/resolvers
// and ./reset-password.schema.ts. Put it next to <TerminalPane /> exactly like the login page.
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography,
} from "@mui/material";
import type { OutlinedInputProps } from "@mui/material";
import {
  IconArrowRight,
  IconDatabaseSearch,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import {
  getPasswordStrength,
  resetPasswordSchema,
  type PasswordStrength,
  type ResetPasswordFormValues,
  type ResetPasswordPayload,
} from "../schemas/auth.schema";

/* ----------------------------- content ----------------------------- */
const COPY = {
  title: "Set New Password",
  subtitle:
    "Enter your new password below to regain server console privileges.",
  passwordLabel: "New Password",
  confirmLabel: "Confirm New Password",
  strengthLabel: "Password strength",
  submit: "Reset Password",
} as const;

const STRENGTH: Record<
  Exclude<PasswordStrength, 0>,
  { label: string; color: string }
> = {
  1: { label: "Weak", color: "error.main" },
  2: { label: "Fair", color: "warning.main" },
  3: { label: "Strong", color: "secondary.main" }, // the cyan from the design
  4: { label: "Excellent", color: "success.main" },
};

/* ------------------------------ helpers ----------------------------- */
// theme.spacing = 4px, so spacing units below are px / 4
const SHOW_LOGO_BELOW_900 = "@media (max-width: 900px)";

type FieldProps = Omit<
  OutlinedInputProps,
  "id" | "error" | "label" | "name" | "onChange" | "onBlur" | "inputRef"
> & {
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
  children?: React.ReactNode;
};

function Field({ label, error, registration, children, ...input }: FieldProps) {
  const id = useId();
  const { ref, ...rhf } = registration;
  return (
    <FormControl fullWidth error={Boolean(error)} sx={{ gap: 2 }}>
      <FormLabel
        htmlFor={id}
        sx={{
          color: "common.white",
          fontSize: 13,
          fontWeight: 500,
          lineHeight: "17px",
          "&.Mui-focused, &.Mui-error": { color: "common.white" },
        }}
      >
        {label}
      </FormLabel>
      <OutlinedInput
        id={id}
        fullWidth
        inputRef={ref}
        {...rhf}
        slotProps={{
          input: {
            "aria-describedby": error ? `${id}-error` : undefined,
            "aria-invalid": Boolean(error) || undefined,
          },
        }}
        sx={{
          gap: 2,
          pr: 4,
          "& input": {
            height: 18,
            p: "12px 0 12px 16px",
            lineHeight: "18px",
            "&::placeholder": { color: "text.disabled", opacity: 1 },
          },
        }}
        {...input}
      />
      {error && (
        <FormHelperText id={`${id}-error`} sx={{ m: 0, fontSize: 12 }}>
          {error}
        </FormHelperText>
      )}
      {children}
    </FormControl>
  );
}

/** Four-segment bar + label, as in the design. */
function StrengthMeter({ level }: { level: PasswordStrength }) {
  const info = level ? STRENGTH[level] : null;
  return (
    <Box
      role="meter"
      aria-label={COPY.strengthLabel}
      aria-valuemin={0}
      aria-valuemax={4}
      aria-valuenow={level}
      aria-valuetext={info?.label ?? "Not entered"}
      sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}
    >
      <Box sx={{ display: "flex", gap: 1 }}>
        {[1, 2, 3, 4].map((segment) => (
          <Box
            key={segment}
            sx={{
              flex: 1,
              height: 4,
              borderRadius: 0.25,
              bgcolor: info && segment <= level ? info.color : "border.default",
              transition: "background-color .2s ease",
            }}
          />
        ))}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          lineHeight: "16px",
        }}
      >
        <Box component="span" sx={{ color: "text.secondary" }}>
          {COPY.strengthLabel}
        </Box>
        {info && (
          <Box component="span" sx={{ color: info.color, fontWeight: 600 }}>
            {info.label}
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ------------------------------ component --------------------------- */
interface ResetPasswordFormProps {
  onSubmit?: (payload: ResetPasswordPayload) => Promise<void>;
  redirectTo?: string;
}

async function notConnected(): Promise<void> {
  throw new Error(
    "Password reset is not connected to a backend yet. Pass an onSubmit to <ResetPasswordForm />.",
  );
}

export function ResetPasswordForm({
  onSubmit = notConnected,
  redirectTo = "/login",
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onTouched", // validate a field after it is first left, then on every change
  });

  const strength = getPasswordStrength(watch("password"));

  const submit = handleSubmit(async ({ password }) => {
    clearErrors("root.server");
    try {
      await onSubmit({ password });
      router.push(redirectTo);
    } catch (error) {
      setError("root.server", {
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    }
  });

  // keep "Passwords do not match" in sync while the user edits the first password
  const passwordRegistration = register("password", {
    onChange: () => {
      if (touchedFields.confirmPassword) void trigger("confirmPassword");
    },
  });

  const type = visible ? "text" : "password";

  return (
    <Box sx={{ width: "100%", maxWidth: 420 }}>
      {/* the left pane is hidden on small screens, so the logo moves here */}
      <Box
        sx={{
          display: "none",
          alignItems: "center",
          gap: 2.5,
          mb: 8,
          [SHOW_LOGO_BELOW_900]: { display: "inline-flex" },
        }}
      >
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            width: 40,
            height: 40,
            borderRadius: 0.75,
            bgcolor: "primary.main",
            color: "common.white",
          }}
        >
          <IconDatabaseSearch size={22} aria-hidden />
        </Box>
        <Typography
          component="span"
          variant="h6"
          sx={{ fontSize: 25, fontWeight: 800, lineHeight: "32px" }}
        >
          DevStack
        </Typography>
      </Box>

      <Box
        component="form"
        noValidate
        onSubmit={submit}
        sx={{ display: "flex", flexDirection: "column", gap: 8 }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h3" component="h1" sx={{ lineHeight: "40px" }}>
            {COPY.title}
          </Typography>
          <Typography
            sx={{ color: "text.secondary", fontSize: 14, lineHeight: "18px" }}
          >
            {COPY.subtitle}
          </Typography>
        </Box>

        {errors.root?.server?.message && (
          <Alert severity="error" role="alert" sx={{ mt: -3 }}>
            {errors.root.server.message}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <Field
            label={COPY.passwordLabel}
            registration={passwordRegistration}
            error={errors.password?.message}
            type={type}
            placeholder="********"
            autoComplete="new-password"
            endAdornment={
              <InputAdornment position="end" sx={{ m: 0 }}>
                <IconButton
                  size="small"
                  edge="end"
                  onClick={() => setVisible((v) => !v)}
                  aria-label={visible ? "Hide passwords" : "Show passwords"}
                  aria-pressed={visible}
                  sx={{
                    p: 1,
                    color: "text.disabled",
                    "&:hover": {
                      color: "common.white",
                      bgcolor: "transparent",
                    },
                  }}
                >
                  {!visible ? (
                    <IconEyeOff size={16} aria-hidden />
                  ) : (
                    <IconEye size={16} aria-hidden />
                  )}
                </IconButton>
              </InputAdornment>
            }
          >
            <StrengthMeter level={strength} />
          </Field>

          <Field
            label={COPY.confirmLabel}
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
            type={type}
            autoComplete="new-password"
            placeholder="********"
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          loading={isSubmitting}
          loadingPosition="end"
          endIcon={<IconArrowRight size={16} aria-hidden />}
          sx={{ minHeight: 42, py: 0, gap: 0.5 }}
        >
          {COPY.submit}
        </Button>
      </Box>
    </Box>
  );
}
