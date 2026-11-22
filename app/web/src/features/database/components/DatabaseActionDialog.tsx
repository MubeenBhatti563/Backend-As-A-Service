"use client";

import type { ReactNode, FormEvent } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Typography, useMediaQuery, useTheme,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";

interface Props {
  open: boolean;
  title: string;
  description: string;
  submitLabel: string;
  submittingLabel: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  maxWidth?: "sm" | "md";
  submitDisabled?: boolean;
}

export function DatabaseActionDialog({
  open, title, description, submitLabel, submittingLabel, saving,
  onClose, onSubmit, children, maxWidth = "sm", submitDisabled = false,
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth={maxWidth}
      scroll="paper"
      aria-labelledby="database-action-title"
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: fullScreen ? "100dvh" : "min(780px, calc(100dvh - 64px))",
          minHeight: 0,
          bgcolor: "background.paper",
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 3, sm: 4 },
            pt: { xs: 3, sm: 4 },
            pb: 3,
            borderBottom: "1px solid",
            borderColor: "border.default",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography id="database-action-title" variant="h5" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 540, lineHeight: 1.6 }}>
                {description}
              </Typography>
            </Box>
            <IconButton aria-label="Close" onClick={onClose} disabled={saving} sx={{ mt: -0.5, mr: -1 }}>
              <IconX size={20} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 3, sm: 4 }, py: { xs: 3, sm: 4 }, flex: "1 1 auto", minHeight: 0 }}>
          {children}
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 3, sm: 4 },
            py: 2,
            borderTop: "1px solid",
            borderColor: "border.default",
            bgcolor: "background.paper",
          }}
        >
          <Button onClick={onClose} disabled={saving} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving || submitDisabled} sx={{ minWidth: 132 }}>
            {saving ? submittingLabel : submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
