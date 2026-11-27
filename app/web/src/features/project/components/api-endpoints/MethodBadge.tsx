import { Box, Typography } from "@mui/material";
import type { HttpMethod } from "./types";

const PALETTE = {
  GET: "success",
  POST: "primary",
  PUT: "warning",
  PATCH: "warning",
  DELETE: "error",
} as const satisfies Record<HttpMethod, "success" | "primary" | "warning" | "error">;

export function MethodBadge({ method }: { method: HttpMethod }) {
  const tone = PALETTE[method];
  return (
    <Box
      component="span"
      sx={(theme) => ({
        display: "inline-flex",
        flexShrink: 0,
        px: 2,
        py: 0.5,
        borderRadius: "4px",
        bgcolor: theme.palette.statusBackground[tone],
        color: theme.palette[tone].main,
      })}
    >
      <Typography
        variant="code"
        component="span"
        sx={{ fontSize: 11, fontWeight: 700, lineHeight: "14px" }}
      >
        {method}
      </Typography>
    </Box>
  );
}
