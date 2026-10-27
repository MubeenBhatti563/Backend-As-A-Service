"use client";
// SignupForm.tsx – right side of the sign-up screen (Next.js App Router).
// Needs: @mui/material, @tabler/icons-react, next, react-hook-form, zod, @hookform/resolvers
// and ./signup.schema.ts. Put it next to <TerminalPane /> exactly like the login page.
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useId, useState } from "react";
import {
  Controller,
  useForm,
  type UseFormRegisterReturn,
} from "react-hook-form";
import {
  signupSchema,
  type SignupFormValues,
  type SignupPayload,
} from "../schemas/auth.schema";
import { SHOW_LOGO_BELOW_900 } from "..";
import OAuthButtons from "./OAuthButtongs";

/* ----------------------------- content ----------------------------- */
const COPY = {
  title: "Create your account",
  subtitle: "Start building with production-ready servers in minutes",
  nameLabel: "Full Name",
  namePlaceholder: "Alex Rivera",
  emailLabel: "Email Address",
  emailPlaceholder: "you@example.com",
  passwordLabel: "Password",
  passwordPlaceholder: "Minimum 8 characters",
  confirmLabel: "Confirm Password",
  confirmPlaceholder: "Repeat your password",
  agreePrefix: "I agree to the",
  terms: "Terms of Service",
  and: "and",
  privacy: "Privacy Policy",
  submit: "Create Account",
  haveAccount: "Already have an account?",
  signIn: "Sign In",
} as const;

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

type FieldProps = Omit<
  OutlinedInputProps,
  "id" | "error" | "label" | "name" | "onChange" | "onBlur" | "inputRef"
> & {
  label: string;
  error?: string;
  /** spread the result of react-hook-form's register("name") */
  registration: UseFormRegisterReturn;
};

/** Label above a 42px input, wired to react-hook-form via register(). */
function Field({ label, error, registration, ...input }: FieldProps) {
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
    </FormControl>
  );
}

/** Field + show/hide eye. */
function PasswordField(props: Omit<FieldProps, "type" | "endAdornment">) {
  const [visible, setVisible] = useState(false);
  return (
    <Field
      {...props}
      type={visible ? "text" : "password"}
      endAdornment={
        <InputAdornment position="end" sx={{ m: 0 }}>
          <IconButton
            size="small"
            edge="end"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            sx={{
              p: 1,
              color: "text.disabled",
              "&:hover": { color: "common.white", bgcolor: "transparent" },
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
    />
  );
}

/* ------------------------------ component --------------------------- */
interface SignupFormProps {
  /** Resolve on success, throw an Error (message is shown) on failure. Receives only name/email/password. */
  onSubmit?: (payload: SignupPayload) => Promise<void>;
  redirectTo?: string;
  signInHref?: string;
  termsHref?: string;
  privacyHref?: string;
}

async function notConnected(): Promise<void> {
  throw new Error(
    "Sign-up is not connected to a backend yet. Pass an onSubmit to <SignupForm />.",
  );
}

export function SignupForm({
  onSubmit = notConnected,
  redirectTo = "/dashboard",
  signInHref = "/auth/login",
  termsHref = "/terms",
  privacyHref = "/privacy",
}: SignupFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    trigger,
    setError,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    mode: "onTouched", // validate a field after it is first left, then on every change
  });

  const submit = handleSubmit(async ({ fullName, email, password }) => {
    try {
      await onSubmit({ fullName, email, password });
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

        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Field
            label={COPY.nameLabel}
            registration={register("fullName")}
            error={errors.fullName?.message}
            autoComplete="name"
            placeholder={COPY.namePlaceholder}
          />
          <Field
            label={COPY.emailLabel}
            registration={register("email")}
            error={errors.email?.message}
            type="email"
            autoComplete="email"
            placeholder={COPY.emailPlaceholder}
          />
          <PasswordField
            label={COPY.passwordLabel}
            registration={passwordRegistration}
            error={errors.password?.message}
            autoComplete="new-password"
            placeholder={COPY.passwordPlaceholder}
          />
          <PasswordField
            label={COPY.confirmLabel}
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
            placeholder={COPY.confirmPlaceholder}
          />
        </Box>

        <FormControl error={Boolean(errors.acceptTerms)} sx={{ gap: 1.5 }}>
          <Controller
            name="acceptTerms"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                sx={{
                  alignItems: "center",
                  m: 0,
                  gap: 2,
                  "& .MuiFormControlLabel-label": {
                    color: "text.secondary",
                    fontSize: 13,
                    lineHeight: "17px",
                  },
                }}
                control={
                  <Checkbox
                    disableRipple
                    name={field.name}
                    slotProps={{ input: { ref: field.ref } }}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
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
                      alignSelf: "flex-start",
                      mt: "0.5px",
                      "&.Mui-focusVisible > div": {
                        outline: "2px solid",
                        outlineColor: "primary.main",
                        outlineOffset: 2,
                      },
                    }}
                  />
                }
                label={
                  <>
                    {COPY.agreePrefix}{" "}
                    <MuiLink
                      component={NextLink}
                      href={termsHref}
                      color="inherit"
                      sx={{
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {COPY.terms}
                    </MuiLink>{" "}
                    {COPY.and}{" "}
                    <MuiLink
                      component={NextLink}
                      href={privacyHref}
                      color="inherit"
                      sx={{
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {COPY.privacy}
                    </MuiLink>
                    .
                  </>
                }
              />
            )}
          />
          {errors.acceptTerms && (
            <FormHelperText sx={{ m: 0, fontSize: 12 }}>
              {errors.acceptTerms.message}
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
          {COPY.haveAccount}
          <MuiLink
            component={NextLink}
            href={signInHref}
            sx={{ ...linkSx, fontWeight: 600 }}
          >
            {COPY.signIn}
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
}
