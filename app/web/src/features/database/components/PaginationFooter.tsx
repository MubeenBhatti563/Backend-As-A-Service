"use client";

import { Box, Button, Typography } from "@mui/material";
import { SURFACE } from "../constants";

interface Props {
  from: number;
  to: number;
  total: number;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

const base = {
  minHeight: 28,
  minWidth: 0,
  py: "6px",
  borderRadius: "6px",
  fontSize: 12,
  lineHeight: "16px",
} as const;

export function PaginationFooter({ from, to, total, page, pageCount, onPageChange }: Props) {
  const start = Math.max(1, Math.min(page - 1, pageCount - 2));
  const pages = Array.from({ length: Math.min(pageCount, 3) }, (_, i) => start + i);

  return (
    <Box
      component="nav"
      aria-label="Pagination"
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", sm: "center" },
        gap: 2,
        pt: 3,
      }}
    >
      <Typography variant="body2" sx={{ fontSize: 13, color: "text.disabled" }}>
        Showing {from}-{to} of {total.toLocaleString("en-US")} rows
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "row", gap: { xs: 1, sm: 2 }, justifyContent: { xs: "space-between", sm: "flex-end" } }}>
        <Button
          variant="outlined"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          sx={{ ...base, px: "10px", bgcolor: SURFACE, color: "text.primary", fontWeight: 400 }}
        >
          Previous
        </Button>

        {pages.map((p) => {
          const active = p === page;
          return (
            <Button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={active ? "page" : undefined}
              sx={{
                ...base,
                px: 3,
                display: { xs: "none", sm: "inline-flex" },
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
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          sx={{ ...base, px: "10px", bgcolor: SURFACE, color: "text.primary", fontWeight: 400 }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}
