"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  submitting = false,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "12px",
            bgcolor: "background.paper",
            backgroundImage: "none",
            border: "1px solid",
            borderColor: "border.default",
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, pt: 3, px: 3, pb: 1 }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 2 }}>
        <DialogContentText sx={{ color: "text.secondary", fontSize: 14 }}>
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={submitting}
          sx={{
            color: "text.primary",
            borderColor: "border.default",
            textTransform: "none",
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={submitting}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {submitting ? "Deleting…" : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
