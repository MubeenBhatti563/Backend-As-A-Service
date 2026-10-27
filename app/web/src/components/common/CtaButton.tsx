import { Button } from "@mui/material";
import type { ReactNode } from "react";
import { mq } from "@/theme/tokens";

type Kind = "primary" | "secondary" | "ghost";

interface CtaButtonProps {
  href: string;
  kind?: Kind;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  compact?: boolean;
  children: ReactNode;
}

const KIND_STYLES = {
  primary: { variant: "contained", sx: {} },
  secondary: {
    variant: "outlined",
    sx: {
      color: "text.primary",
      bgcolor: "background.elevated",
      borderColor: "border.default",
      "&:hover": { borderColor: "border.strong", bgcolor: "border.default" },
    },
  },
  ghost: {
    variant: "text",
    sx: {
      color: "text.secondary",
      "&:hover": { color: "common.white", bgcolor: "transparent" },
    },
  },
} as const;

export function CtaButton({
  href,
  kind = "primary",
  compact,
  children,
  ...rest
}: CtaButtonProps) {
  const { variant, sx } = KIND_STYLES[kind];
  return (
    <Button
      href={href}
      variant={variant}
      {...rest}
      sx={{
        minHeight: compact ? 38 : 42,
        px: compact ? 3 : 5,
        py: 0,
        gap: 0.5,
        transition:
          "transform .18s ease, background .18s ease, border-color .18s ease",
        "&:hover": { transform: "translateY(-1px)" },
        [mq.mobile]: {
          minHeight: compact ? 38 : 40,
          px: compact ? 3 : 3.5,
          fontSize: 12,
        },
        [mq.reducedMotion]: {
          transition: "none",
          "&:hover": { transform: "none" },
        },
        ...sx,
        ...(kind === "ghost" && {
          [mq.mobile]: { minHeight: 40, px: 2.25, fontSize: 12 },
        }),
      }}
    >
      {children}
    </Button>
  );
}
