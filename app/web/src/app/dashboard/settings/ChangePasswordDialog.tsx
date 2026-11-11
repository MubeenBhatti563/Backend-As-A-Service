"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  ChangePasswordValues,
} from "@/features/auth/schemas/auth.schema";

/* ── Component ─────────────────────────────────────────────────────── */

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  /** Throw an Error to display its message inside the dialog. */
  onSubmit: (values: ChangePasswordValues) => Promise<void> | void;
}

export function ChangePasswordDialog({
  open,
  onClose,
  onSubmit,
}: ChangePasswordDialogProps) {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    setServerError(null);
    setShowNew(false);
    setShowConfirm(false);
    onClose();
  };

  const submit = async (values: ChangePasswordValues) => {
    setServerError(null);
    try {
      await onSubmit(values);
      handleClose();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="change-password-title"
    >
      <Box component="form" onSubmit={handleSubmit(submit)} noValidate>
        <DialogTitle
          id="change-password-title"
          sx={{ fontSize: 16, fontWeight: 600 }}
        >
          Change password
        </DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}
        >
          <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
            Use at least 8 characters with upper and lower case letters, a
            number, and a special character.
          </Typography>

          {serverError && <Alert severity="error">{serverError}</Alert>}

          <TextField
            label="Current password"
            type="password"
            autoComplete="current-password"
            autoFocus
            size="small"
            fullWidth
            error={!!errors.currentPassword}
            helperText={errors.currentPassword?.message}
            {...register("currentPassword")}
          />

          <TextField
            label="New password"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            size="small"
            fullWidth
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
            {...register("newPassword")}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={() => setShowNew((v) => !v)}
                      aria-label={
                        showNew ? "Hide new password" : "Show new password"
                      }
                    >
                      {showNew ? (
                        <IconEyeOff size={16} />
                      ) : (
                        <IconEye size={16} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Confirm password"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            size="small"
            fullWidth
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            {...register("confirmPassword")}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={
                        showConfirm
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirm ? (
                        <IconEyeOff size={16} />
                      ) : (
                        <IconEye size={16} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ textTransform: "none" }}
          >
            {isSubmitting ? "Saving…" : "Update password"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
