"use client";
// ForgotPasswordForm.tsx – right side of the "Reset password" screen (Next.js App Router).
// Needs: @mui/material, @tabler/icons-react, next, react-hook-form, zod, @hookform/resolvers
// and ./forgot-password.schema.ts. Put it next to <TerminalPane /> exactly like the login page.
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Link as MuiLink,
  OutlinedInput,
  Typography,
} from "@mui/material";
import {
  IconArrowLeft,
  IconArrowRight,
  IconDatabaseSearch,
} from "@tabler/icons-react";
import NextLink from "next/link";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "../schemas/auth.schema";
import { SHOW_LOGO_BELOW_900 } from "..";
import { useForgotPassword } from "../hooks/use-auth";

/* ----------------------------- content ----------------------------- */
const COPY = {
  title: "Reset password",
  subtitle:
    "Enter your registered email and we will dispatch a secure validation code to restore database controls.",
  emailLabel: "Registered Email",
  emailPlaceholder: "you@example.com",
  submit: "Send Reset Link",
  back: "Back to login",
  // Shown after a successful request. Keep it generic so it never reveals whether an account exists.
  success: (email: string) =>
    `If an account exists for ${email}, a reset link is on its way. Check your inbox.`,
} as const;

/* ------------------------------ component --------------------------- */
interface ForgotPasswordFormProps {
  /** Resolve on success, throw an Error (message is shown) on failure. */
  onSubmit?: (values: ForgotPasswordValues) => Promise<void>;
  backToLoginHref?: string;
}

export function ForgotPasswordForm({
  onSubmit,
  backToLoginHref = "/auth/login",
}: ForgotPasswordFormProps) {
  const emailId = useId();
  const forgotMutation = useForgotPassword();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const submit = handleSubmit(async (values) => {
    setSentTo(null);
    clearErrors("root.server");
    try {
      if (onSubmit) {
        await onSubmit(values);
      } else {
        await forgotMutation.mutateAsync({ email: values.email.trim() });
      }
      setSentTo(values.email);
    } catch (error) {
      setError("root.server", {
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    }
  });

  const { ref, ...emailField } = register("email");
  const emailError = errors.email?.message;
  const serverError = errors.root?.server?.message;

  return (
    // Wrap in a centered flex container, e.g. <Box sx={{ flexGrow: 1, display: "grid", placeItems: "center", p: 20 }}>
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
            sx={{ color: "text.secondary", fontSize: 14, lineHeight: 1.5 }}
          >
            {COPY.subtitle}
          </Typography>
        </Box>

        {serverError && (
          <Alert severity="error" role="alert" sx={{ mt: -3 }}>
            {serverError}
          </Alert>
        )}
        {sentTo && (
          <Alert severity="success" role="status" sx={{ mt: -3 }}>
            {COPY.success(sentTo)}
          </Alert>
        )}

        <FormControl fullWidth error={Boolean(emailError)} sx={{ gap: 2 }}>
          <FormLabel
            htmlFor={emailId}
            sx={{
              color: "common.white",
              fontSize: 13,
              fontWeight: 500,
              lineHeight: "17px",
              "&.Mui-focused, &.Mui-error": { color: "common.white" },
            }}
          >
            {COPY.emailLabel}
          </FormLabel>
          <OutlinedInput
            id={emailId}
            fullWidth
            type="email"
            autoComplete="email"
            placeholder={COPY.emailPlaceholder}
            inputRef={ref}
            {...emailField}
            slotProps={{
              input: {
                "aria-describedby": emailError ? `${emailId}-error` : undefined,
                "aria-invalid": Boolean(emailError) || undefined,
              },
            }}
            sx={{
              "& input": {
                height: 18,
                p: "12px 16px",
                lineHeight: "18px",
                "&::placeholder": { color: "text.disabled", opacity: 1 },
              },
            }}
          />
          {emailError && (
            <FormHelperText id={`${emailId}-error`} sx={{ m: 0, fontSize: 12 }}>
              {emailError}
            </FormHelperText>
          )}
        </FormControl>

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

        <MuiLink
          component={NextLink}
          href={backToLoginHref}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            color: "info.main",
            fontSize: 14,
            fontWeight: 600,
            lineHeight: "18px",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          <IconArrowLeft size={16} aria-hidden />
          {COPY.back}
        </MuiLink>
      </Box>
    </Box>
  );
}
