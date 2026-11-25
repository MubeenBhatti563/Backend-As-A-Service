"use client";

import type { ReactNode } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  CircleAlert,
  CircleCheck,
  CircleX,
  Info,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { NOTIFICATION_SURFACE } from "./constants";

export type NotificationVariant = "success" | "error" | "warning" | "info";

export interface NotificationAction {
  label: string;
  onClick?: () => void;
}

export interface NotificationProps {
  variant: NotificationVariant;
  message: ReactNode;
  /** Shows the dismiss (x) button when provided. */
  onClose?: () => void;
  /** Shows a button on the right, e.g. "Upgrade" or "Update". */
  action?: NotificationAction;
}

interface VariantConfig {
  /** Palette path for the accent / icon / border colour. */
  color: string;
  /** Key in theme.palette.statusBackground used for tints. */
  status: keyof Theme["palette"]["statusBackground"];
  Icon: LucideIcon;
  /** toast = accent bar + icon tile (success/error). banner = tinted card with border (warning/info). */
  layout: "toast" | "banner";
}

const VARIANTS: Record<NotificationVariant, VariantConfig> = {
  success: { color: "success.main", status: "success", Icon: CircleCheck, layout: "toast" },
  error: { color: "error.main", status: "error", Icon: CircleAlert, layout: "toast" },
  warning: { color: "warning.main", status: "warning", Icon: TriangleAlert, layout: "banner" },
  info: { color: "primary.main", status: "primary", Icon: Info, layout: "banner" },
};

export function Notification({ variant, message, onClose, action }: NotificationProps) {
  const { color, status, Icon, layout } = VARIANTS[variant];
  const isToast = layout === "toast";

  return (
    <Box
      role={variant === "error" || variant === "warning" ? "alert" : "status"}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        width: "100%",
        minHeight: 72,
        px: 4,
        py: isToast ? 0 : 4,
        bgcolor: NOTIFICATION_SURFACE,
        // Banners get a translucent status tint layered over the surface colour.
        backgroundImage: isToast
          ? undefined
          : (theme: Theme) => {
              const tint = theme.palette.statusBackground[status];
              return `linear-gradient(${tint}, ${tint})`;
            },
        border: "1px solid",
        borderColor: isToast ? "border.default" : color,
        borderRadius: "12px",
      }}
    >
      {isToast ? (
        <>
          <Box aria-hidden sx={{ width: 4, height: 40, flexShrink: 0, borderRadius: "2px", bgcolor: color }} />
          <Box
            aria-hidden
            sx={{
              display: "grid",
              placeItems: "center",
              width: 28,
              height: 28,
              flexShrink: 0,
              borderRadius: "6px",
              color,
              bgcolor: (theme: Theme) => theme.palette.statusBackground[status],
            }}
          >
            <Icon size={16} />
          </Box>
        </>
      ) : (
        <Box aria-hidden sx={{ display: "flex", flexShrink: 0, color }}>
          <Icon size={16} />
        </Box>
      )}

      <Typography sx={{ flex: 1, minWidth: 0, fontSize: 14, lineHeight: "18px", color: "text.primary" }}>
        {message}
      </Typography>

      {action && (
        <Button
          variant={variant === "warning" ? "contained" : "outlined"}
          onClick={action.onClick}
          sx={{
            flexShrink: 0,
            minHeight: 28,
            px: 3,
            py: "5px",
            borderRadius: "6px",
            fontSize: 13,
            lineHeight: "17px",
            fontWeight: 600,
            ...(variant === "warning"
              ? { bgcolor: color, color: "warning.contrastText", "&:hover": { bgcolor: "warning.dark" } }
              : {
                  color: "text.primary",
                  borderColor: color,
                  "&:hover": { borderColor: color, bgcolor: (theme: Theme) => theme.palette.statusBackground[status] },
                }),
          }}
        >
          {action.label}
        </Button>
      )}

      {onClose && (
        <IconButton
          size="small"
          aria-label="Dismiss notification"
          onClick={onClose}
          sx={{ flexShrink: 0, p: 1, color: "text.secondary", "&:hover": { color: "text.primary" } }}
        >
          <CircleX size={14} />
        </IconButton>
      )}
    </Box>
  );
}
