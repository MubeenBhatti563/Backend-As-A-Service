"use client";
// LoginForm.tsx – right side of the login screen (Next.js App Router).
// Needs only: @mui/material, @tabler/icons-react, next and your theme.ts.
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  IconButton,
  InputAdornment,
  Link as MuiLink,
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
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { LoginErrors, LoginValues } from "../types";
import { SHOW_LOGO_BELOW_900 } from "..";
import OAuthButtons from "./OAuthButtongs";

/* ----------------------------- content ----------------------------- */
const COPY = {
  title: "Welcome back",
  subtitle: "Enter your credentials to access your console",
  emailLabel: "Email Address",
  emailPlaceholder: "you@company.com",
  passwordLabel: "Password",
  passwordPlaceholder: "Enter your password",
  remember: "Remember me",
  forgot: "Forgot password?",
  submit: "Sign In",
  noAccount: "Don't have an account?",
  signUp: "Sign Up",
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validate({ email, password }: LoginValues): LoginErrors {
  const e: LoginErrors = {};
  if (!email.trim()) e.email = "Email is required";
  else if (!EMAIL_RE.test(email.trim()))
    e.email = "Enter a valid email address";
  if (!password) e.password = "Password is required";
  return e;
}

/* ------------------------------ helpers ----------------------------- */
// theme.spacing = 4px, so spacing units below are px / 4
const linkSx = {
  color: "info.main",
  textDecoration: "none",
  "&:hover": { textDecoration: "underline" },
} as const;
const checkBox = {
  display: "grid",
  placeItems: "center",
  width: 16,
  height: 16,
  border: 1,
  borderColor: "border.default",
  borderRadius: 0.5,
  bgcolor: "background.input",
} as const;

/** Label above a 42px input. */
function Field({
  label,
  error,
  ...input
}: Omit<OutlinedInputProps, "id" | "error" | "label"> & {
  label: string;
  error?: string;
}) {
  const id = useId();
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
    </FormControl>
  );
}

/* ------------------------------ component --------------------------- */
interface LoginFormProps {
  /** Resolve on success, throw an Error (message is shown) on failure. */
  onSubmit?: (values: LoginValues) => Promise<void>;
  redirectTo?: string;
  forgotPasswordHref?: string;
  signUpHref?: string;
}

async function notConnected(): Promise<void> {
  throw new Error(
    "Sign-in is not connected to a backend yet. Pass an onSubmit to <LoginForm />.",
  );
}

export function LoginForm({
  onSubmit = notConnected,
  redirectTo = "/dashboard",
  forgotPasswordHref = "/auth/forgot-password",
  signUpHref = "/auth/register",
}: LoginFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
    remember: true,
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = <K extends keyof LoginValues>(
    key: K,
    value: LoginValues[K],
  ) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (key !== "remember") setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    setSubmitError(null);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await onSubmit({ ...values, email: values.email.trim() });
      router.push(redirectTo);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // Wrap this in a centered flex container, e.g. <Box sx={{ flexGrow: 1, display: "grid", placeItems: "center", p: 20 }}>
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
        onSubmit={handleSubmit}
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

        {submitError && (
          <Alert severity="error" role="alert" sx={{ mt: -3 }}>
            {submitError}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <Field
            label={COPY.emailLabel}
            name="email"
            type="email"
            autoComplete="email"
            placeholder={COPY.emailPlaceholder}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            error={errors.email}
          />
          <Field
            label={COPY.passwordLabel}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder={COPY.passwordPlaceholder}
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            error={errors.password}
            endAdornment={
              <InputAdornment position="end" sx={{ m: 0 }}>
                <IconButton
                  size="small"
                  edge="end"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  sx={{
                    p: 1,
                    color: "text.disabled",
                    "&:hover": {
                      color: "common.white",
                      bgcolor: "transparent",
                    },
                  }}
                >
                  {!showPassword ? (
                    <IconEyeOff size={16} aria-hidden />
                  ) : (
                    <IconEye size={16} aria-hidden />
                  )}
                </IconButton>
              </InputAdornment>
            }
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <FormControlLabel
            sx={{
              m: 0,
              gap: 2,
              "& .MuiFormControlLabel-label": {
                color: "text.secondary",
                fontSize: 13,
                lineHeight: "17px",
              },
            }}
            label={COPY.remember}
            control={
              <Checkbox
                disableRipple
                checked={values.remember}
                onChange={(e) => update("remember", e.target.checked)}
                icon={<Box sx={checkBox} />}
                checkedIcon={
                  <Box sx={checkBox}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "2px",
                        bgcolor: "primary.main",
                      }}
                    />
                  </Box>
                }
                sx={{
                  p: 0,
                  "&.Mui-focusVisible > div": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: 2,
                  },
                }}
              />
            }
          />
          <MuiLink
            component={NextLink}
            href={forgotPasswordHref}
            sx={{
              ...linkSx,
              fontSize: 13,
              fontWeight: 500,
              lineHeight: "17px",
            }}
          >
            {COPY.forgot}
          </MuiLink>
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          loading={submitting}
          loadingPosition="end"
          endIcon={<IconArrowRight size={16} aria-hidden />}
          sx={{ minHeight: 42, py: 0, gap: 0.5 }}
        >
          {COPY.submit}
        </Button>

        {/* OAuth UI only */}
        <OAuthButtons />

        <Typography
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            color: "text.secondary",
            fontSize: 14,
            lineHeight: "18px",
          }}
        >
          {COPY.noAccount}
          <MuiLink
            component={NextLink}
            href={signUpHref}
            sx={{ ...linkSx, fontWeight: 600 }}
          >
            {COPY.signUp}
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
}
