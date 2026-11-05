"use client";
// OnboardingField.tsx – label-above-input and label-above-select used by the onboarding forms (react-hook-form ready).
import {
  FormControl,
  FormHelperText,
  FormLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import type { OutlinedInputProps } from "@mui/material";
import { IconChevronDown } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useId } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

const labelSx = {
  color: "common.white",
  fontSize: 13,
  fontWeight: 500,
  lineHeight: "17px",
  "&.Mui-focused, &.Mui-error": { color: "common.white" },
} as const;

const helperSx = { m: 0, fontSize: 12 } as const;

type FieldProps = Omit<
  OutlinedInputProps,
  "id" | "error" | "label" | "name" | "onChange" | "onBlur" | "inputRef"
> & {
  label: string;
  error?: string;
  /** spread the result of react-hook-form's register("name") */
  registration: UseFormRegisterReturn;
};

/** Text input (42px) or, with `multiline`, a textarea (100px min). */
export function Field({
  label,
  error,
  registration,
  multiline,
  ...input
}: FieldProps) {
  const id = useId();
  const { ref, ...rhf } = registration;
  const textStyles = {
    p: "12px 16px",
    fontSize: 14,
    lineHeight: "18px",
    "&::placeholder": { color: "text.disabled", opacity: 1 },
  };
  return (
    <FormControl fullWidth error={Boolean(error)} sx={{ gap: 2 }}>
      <FormLabel htmlFor={id} sx={labelSx}>
        {label}
      </FormLabel>
      <OutlinedInput
        id={id}
        fullWidth
        multiline={multiline}
        minRows={multiline ? 4 : undefined}
        maxRows={multiline ? 8 : undefined}
        inputRef={ref}
        {...rhf}
        slotProps={{
          input: {
            "aria-describedby": error ? `${id}-error` : undefined,
            "aria-invalid": Boolean(error) || undefined,
          },
        }}
        sx={{
          p: 0,
          minHeight: multiline ? 100 : undefined,
          alignItems: "flex-start",
          "& input": { ...textStyles, height: 18 },
          "& textarea": textStyles,
        }}
        {...input}
      />
      {error && (
        <FormHelperText id={`${id}-error`} sx={helperSx}>
          {error}
        </FormHelperText>
      )}
    </FormControl>
  );
}

interface SelectFieldProps {
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  inputRef?: React.Ref<unknown>;
  options: readonly { value: string; label: string }[];
  startIcon?: ReactNode;
}

/** Dropdown styled like the inputs (42px, chevron on the right). */
export function SelectField({
  label,
  error,
  value,
  onChange,
  onBlur,
  name,
  inputRef,
  options,
  startIcon,
}: SelectFieldProps) {
  const id = useId();
  return (
    <FormControl fullWidth error={Boolean(error)} sx={{ gap: 2 }}>
      <FormLabel id={`${id}-label`} sx={labelSx}>
        {label}
      </FormLabel>
      <Select
        id={id}
        labelId={`${id}-label`}
        name={name}
        value={value}
        inputRef={inputRef}
        onChange={(e) => onChange(e.target.value as string)}
        onBlur={onBlur}
        startAdornment={startIcon}
        IconComponent={(props) => (
          <IconChevronDown size={16} aria-hidden {...props} />
        )}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                mt: 1,
                bgcolor: "background.default",
                border: 1,
                borderColor: "border.default",
                borderRadius: 1,
              },
            },
          },
        }}
        sx={{
          pl: 4,
          gap: 2,
          // doubled class: MUI sets min-height on .MuiSelect-select.MuiSelect-select
          "& .MuiSelect-select.MuiSelect-select": {
            py: "12px",
            pl: 0,
            minHeight: 0,
            height: 18,
            lineHeight: "18px",
            fontSize: 14,
          },
          "& .MuiSelect-icon": { right: 16, color: "text.disabled" },
        }}
      >
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value} sx={{ fontSize: 14 }}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText sx={helperSx}>{error}</FormHelperText>}
    </FormControl>
  );
}
