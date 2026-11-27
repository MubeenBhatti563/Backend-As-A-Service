import { Box, Typography } from "@mui/material";

type Tint = "primary" | "info" | "success" | "warning" | "error" | "neutral";

interface Props {
  label: string;
  tint: Tint;
  color: string;
  px?: number;
}

export function TagChip({ label, tint, color, px = 2 }: Props) {
  return (
    <Box
      component="span"
      sx={(theme) => ({
        display: "inline-flex",
        alignItems: "center",
        px,
        py: 0.5,
        borderRadius: "4px",
        bgcolor: theme.palette.statusBackground[tint],
        color,
      })}
    >
      <Typography
        variant="code"
        component="span"
        sx={{ fontSize: 11, fontWeight: 600, lineHeight: "14px" }}
      >
        {label}
      </Typography>
    </Box>
  );
}
