"use client";

import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { SURFACE } from "../../constants";
import type { QueryHistoryItem } from "./types";

interface Props { items: QueryHistoryItem[]; activeId: string | null; onSelect: (item: QueryHistoryItem) => void }

export function QueryHistoryPanel({ items, activeId, onSelect }: Props) {
  return (
    <Box component="aside" aria-label="Query history" sx={{ width: { xs: "100%", md: 250 }, flexShrink: 0, p: 4, bgcolor: SURFACE, border: "1px solid", borderColor: "border.default", borderRadius: "12px" }}>
      <Stack spacing={3} useFlexGap>
        <Typography variant="subtitle2" component="h2">Query History</Typography>
        <Stack spacing={2} useFlexGap>
          {items.length ? items.map((item) => {
            const active = item.id === activeId;
            return (
              <ButtonBase key={item.id} onClick={() => onSelect(item)} aria-current={active ? "true" : undefined} sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1, width: "100%", p: "10px", textAlign: "left", borderRadius: "6px", border: "1px solid", borderColor: active ? "border.default" : "transparent", bgcolor: active ? "background.elevated" : "transparent", "&:hover": { bgcolor: "background.elevated" } }}>
                <Typography noWrap component="div" variant="code" sx={{ width: "100%", fontSize: 12, lineHeight: "16px", color: "text.primary" }}>{item.preview}</Typography>
                <Typography component="div" variant="caption" sx={{ fontSize: 10, lineHeight: "13px", color: "text.disabled" }}>{item.ranAt}</Typography>
              </ButtonBase>
            );
          }) : <Typography variant="body2" sx={{ py: 1, color: "text.disabled" }}>Query history will appear here.</Typography>}
        </Stack>
      </Stack>
    </Box>
  );
}
