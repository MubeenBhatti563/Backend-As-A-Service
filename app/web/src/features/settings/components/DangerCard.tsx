"use client";

import { useId } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";

interface Props {
  title: string;
  description: string;
  actionLabel: string;
  emphasis?: "outlined" | "filled";
  onAction?: () => void;
}

export function DangerCard({
  title,
  description,
  actionLabel,
  emphasis = "outlined",
  onAction,
}: Props) {
  const headingId = useId();
  const filled = emphasis === "filled";

  return (
    <Box
      component="section"
      aria-labelledby={headingId}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: { xs: 3, sm: 4 },
        p: { xs: 4, sm: 5, md: 6 },
        bgcolor: "background.default",
        border: "1px solid",
        borderColor: "error.main",
        borderRadius: "12px",
      }}
    >
      <Stack sx={{ gap: "6px" }}>
        <Typography
          id={headingId}
          variant="subtitle1"
          component="h2"
          sx={{ lineHeight: "20px" }}
        >
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          {description}
        </Typography>
      </Stack>

      <Button
        variant={filled ? "contained" : "outlined"}
        onClick={onAction}
        disabled={!onAction}
        sx={{
          alignSelf: "flex-start",
          maxWidth: "100%",
          minHeight: 33,
          px: 4,
          py: 2,
          borderRadius: "6px",
          fontSize: 13,
          lineHeight: "17px",
          fontWeight: 600,
          color: "text.primary",
          ...(filled
            ? { bgcolor: "error.main", "&:hover": { bgcolor: "error.dark" } }
            : {
                borderColor: "error.main",
                "&:hover": {
                  borderColor: "error.main",
                  bgcolor: "statusBackground.error",
                },
              }),
        }}
      >
        {actionLabel}
      </Button>
    </Box>
  );
}
