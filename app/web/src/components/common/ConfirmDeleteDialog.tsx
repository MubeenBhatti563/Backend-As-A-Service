// ConfirmDeleteDialog.tsx
"use client";
import { Box, Button, Dialog, InputBase, Typography } from "@mui/material";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useId, useState, type FormEvent, type ReactNode } from "react";

const display = "var(--font-outfit), Outfit, sans-serif";
const mono = 'var(--font-geist-mono), "Geist Mono", monospace';

interface ConfirmDeleteDialogProps {
  open: boolean;
  /** Name the user must type to confirm, e.g. "my-saas-app". */
  projectName: string;
  onClose: () => void;
  /** Called when the name matches and the user confirms. May be async. */
  onConfirm: () => void | Promise<void>;
  title?: string;
  eyebrow?: string;
  confirmLabel?: string;
  description?: ReactNode;
  confirmationLabel?: ReactNode;
}

export function ConfirmDeleteDialog({
  open,
  projectName,
  onClose,
  onConfirm,
  title = "Delete Project?",
  eyebrow = "Action requires validation",
  confirmLabel = "Delete Project",
  description,
  confirmationLabel,
}: ConfirmDeleteDialogProps) {
  const uid = useId();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matches = value === projectName;

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!matches || loading) return;
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby={`${uid}-title`}
      aria-describedby={`${uid}-desc`}
      // reset the form after the closing animation, so the text doesn't flash empty
      slotProps={{
        transition: {
          onExited: () => {
            setValue("");
            setError(null);
          },
        },
        backdrop: { sx: { bgcolor: "rgba(6, 9, 19, 0.85)" } },
        paper: {
          sx: {
            width: 480,
            maxWidth: "calc(100% - 32px)",
            m: 4,
            bgcolor: "background.default",
            backgroundImage: "none",
            border: 1,
            borderColor: "border.default",
            borderRadius: 2, // 16px
            boxShadow: "0px 16px 32px rgba(0, 0, 0, 0.5)",
          },
        },
      }}
    >
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit}
        sx={{
          p: "31px", // 32px in Figma, minus the 1px border
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {/* header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Box
            aria-hidden
            sx={{
              display: "grid",
              placeItems: "center",
              flex: "none",
              width: 40,
              height: 40,
              bgcolor: "rgba(239, 68, 68, 0.082)",
              border: 1,
              borderColor: "error.main",
              borderRadius: 1.5, // 12px
              color: "error.main",
            }}
          >
            <IconAlertTriangle size={20} />
          </Box>
          <Box
            sx={{
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography
              id={`${uid}-title`}
              component="h2"
              sx={{
                fontFamily: display,
                fontSize: 20,
                fontWeight: 800,
                lineHeight: "25px",
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 12,
                lineHeight: "16px",
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </Typography>
          </Box>
        </Box>

        {/* description */}
        <Typography
          id={`${uid}-desc`}
          sx={{ color: "text.secondary", fontSize: 14, lineHeight: "150%" }}
        >
          {description ?? (
            <>
              This will permanently delete the project{" "}
              <Box
                component="strong"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                &quot;{projectName}&quot;
              </Box>{" "}
              and all associated data including database tables, stored files,
              API endpoints, and user accounts. This action cannot be undone.
            </>
          )}
        </Typography>

        {/* confirm input */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography
            component="label"
            htmlFor={`${uid}-input`}
            sx={{
              color: "text.secondary",
              fontSize: 13,
              fontWeight: 500,
              lineHeight: "17px",
            }}
          >
            {confirmationLabel ?? <>Type &quot;{projectName}&quot; to confirm</>}
          </Typography>
          <InputBase
            id={`${uid}-input`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={projectName}
            autoFocus
            autoComplete="off"
            disabled={loading}
            error={Boolean(error)}
            inputProps={{
              spellCheck: false,
              autoCapitalize: "off",
              autoCorrect: "off",
            }}
            sx={{
              height: 37,
              px: "13px", // 14px minus border
              bgcolor: "background.input",
              border: 1,
              borderColor: "border.default",
              borderRadius: 1, // 8px
              fontFamily: mono,
              fontSize: 13,
              lineHeight: "17px",
              transition: "border-color 120ms",
              "&.Mui-focused": { borderColor: "error.main" },
              "& input": { p: 0, height: "17px" },
              "& input::placeholder": { color: "#64748B", opacity: 1 },
            }}
          />
          {error && (
            <Typography
              role="alert"
              sx={{ color: "error.main", fontSize: 12, lineHeight: "16px" }}
            >
              {error}
            </Typography>
          )}
        </Box>

        {/* actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 3 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={handleClose}
            disabled={loading}
            sx={{
              height: 38,
              px: 4,
              borderColor: "border.default",
              borderRadius: 1,
              color: "text.secondary",
              fontSize: 14,
              fontWeight: 600,
              lineHeight: "18px",
              "&:hover": {
                borderColor: "border.strong",
                bgcolor: "background.elevated",
                color: "text.primary",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={loading}
            disabled={!matches}
            sx={{
              height: 38,
              px: 4,
              bgcolor: "error.main",
              borderRadius: 1,
              boxShadow: "none",
              color: "#F8FAFC",
              fontSize: 14,
              fontWeight: 600,
              lineHeight: "18px",
              "&:hover": { bgcolor: "error.dark", boxShadow: "none" },
              // Figma: the disabled state is the same red at 50% opacity
              "&.Mui-disabled": {
                bgcolor: "error.main",
                color: "#F8FAFC",
                opacity: 0.5,
              },
            }}
          >
            {confirmLabel}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
