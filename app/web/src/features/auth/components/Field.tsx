"use client";
// AuthField.tsx – the shared label-above-input used by the auth forms (same as the one inside SignupForm).
// Put it in features/auth/components/. You can also import it in SignupForm / LoginForm instead of keeping a local copy.
import {
  FormControl,
  FormHelperText,
  FormLabel,
  OutlinedInput,
} from "@mui/material";
import type { OutlinedInputProps } from "@mui/material";
import { useId } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

export type AuthFieldProps = Omit<
  OutlinedInputProps,
  "id" | "error" | "label" | "name" | "onChange" | "onBlur" | "inputRef"
> & {
  label: string;
  error?: string;
  /** spread the result of react-hook-form's register("name") */
  registration: UseFormRegisterReturn;
};

/** Label above a 42px input, wired to react-hook-form via register(). */
export function Field({
  label,
  error,
  registration,
  ...input
}: AuthFieldProps) {
  const id = useId();
  const { ref, ...rhf } = registration;
  return (
    <FormControl
      fullWidth
      error={Boolean(error)}
      sx={{ gap: 2, textAlign: "left" }}
    >
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
