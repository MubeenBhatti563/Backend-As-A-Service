"use client";

import { Box, Divider, Typography } from "@mui/material";

interface StatProps {
  label: string;
  value: string;
  color: string;
}

export function HeaderStat({ label, value, color }: StatProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <Typography
        component="div"
        variant="caption"
        sx={{
          fontSize: 11,
          lineHeight: "14px",
          color: "text.disabled",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      <Typography
        component="div"
        variant="code"
        sx={{ fontSize: "0.875rem", fontWeight: 600, lineHeight: "18px", color }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export const HeaderStatDivider = () => (
  <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: "center" }} />
);
