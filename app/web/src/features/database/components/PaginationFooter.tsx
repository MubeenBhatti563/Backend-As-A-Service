"use client";

import { Box, Button, Typography } from "@mui/material";
import { SURFACE } from "../constants";

interface Props {
  from: number;
  to: number;
  total: number;
  page: number;
  pageCount: number;
}

const base = {
  minHeight: 28,
  minWidth: 0,
  py: "6px",
  borderRadius: "6px",
  fontSize: 12,
  lineHeight: "16px",
} as const;

export function PaginationFooter({ from, to, total, page, pageCount }: Props) {
  // Figma shows pages 1-3; swap for a windowed range once pagination is wired.
  const pages = Array.from({ length: Math.min(pageCount, 3) }, (_, i) => i + 1);

  return (
    <Box
      component="nav"
      aria-label="Pagination"
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        pt: 3,
      }}
    >
      <Typography variant="body2" sx={{ fontSize: 13, color: "text.disabled" }}>
        Showing {from}-{to} of {total.toLocaleString("en-US")} rows
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
        <Button
          variant="outlined"
          sx={{ ...base, px: "10px", bgcolor: SURFACE, color: "text.primary", fontWeight: 400 }}
        >
          Previous
        </Button>

        {pages.map((p) => {
          const active = p === page;
          return (
            <Button
              key={p}
              aria-current={active ? "page" : undefined}
              sx={{
                ...base,
                px: 3,
                fontWeight: active ? 600 : 400,
                color: active ? "common.white" : "text.secondary",
                bgcolor: active ? "primary.main" : SURFACE,
                "&:hover": { bgcolor: active ? "primary.main" : "background.elevated" },
              }}
            >
              {p}
            </Button>
          );
        })}

        <Button
          variant="outlined"
          sx={{ ...base, px: "10px", bgcolor: SURFACE, color: "text.primary", fontWeight: 400 }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}
