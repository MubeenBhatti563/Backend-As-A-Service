"use client";

import {
  Box,
  Button,
  ButtonBase,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { IconTrash } from "@tabler/icons-react";
import { SURFACE } from "../../constants";
import type { QueryHistoryItem } from "./types";

interface Props {
  items: QueryHistoryItem[];
  activeId: string | null;
  onSelect: (item: QueryHistoryItem) => void;
  onDelete: (item: QueryHistoryItem) => void;
  onClear: () => void;
}

export function QueryHistoryPanel({
  items,
  activeId,
  onSelect,
  onDelete,
  onClear,
}: Props) {
  return (
    <Box
      component="aside"
      aria-label="Query history"
      sx={{
        width: { xs: "100%", md: 250 },
        flexShrink: 0,
        p: 4,
        bgcolor: SURFACE,
        border: "1px solid",
        borderColor: "border.default",
        borderRadius: "12px",
      }}
    >
      <Stack spacing={3} useFlexGap>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography variant="subtitle2" component="h2">
            Query History
          </Typography>
          <Button
            size="small"
            color="error"
            onClick={onClear}
            disabled={items.length === 0}
            sx={{ minWidth: 0, textTransform: "none" }}
          >
            Clear all
          </Button>
        </Stack>
        <Stack spacing={2} useFlexGap>
          {items.length ? (
            items.map((item) => {
              const active = item.id === activeId;
              return (
                <Stack
                  key={item.id}
                  direction="row"
                  spacing={0.5}
                  sx={{
                    alignItems: "center",
                    borderRadius: "6px",
                    border: "1px solid",
                    borderColor: active ? "border.default" : "transparent",
                    bgcolor: active ? "background.elevated" : "transparent",
                    "&:hover": { bgcolor: "background.elevated" },
                  }}
                >
                  <ButtonBase
                    onClick={() => onSelect(item)}
                    aria-current={active ? "true" : undefined}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 1,
                      flex: 1,
                      minWidth: 0,
                      p: "10px",
                      textAlign: "left",
                      borderRadius: "6px",
                    }}
                  >
                    <Typography
                      noWrap
                      component="div"
                      variant="code"
                      sx={{
                        width: "100%",
                        fontSize: 12,
                        lineHeight: "16px",
                        color: "text.primary",
                      }}
                    >
                      {item.preview}
                    </Typography>
                    <Typography
                      component="div"
                      variant="caption"
                      sx={{
                        fontSize: 10,
                        lineHeight: "13px",
                        color: "text.disabled",
                      }}
                    >
                      {item.ranAt}
                    </Typography>
                  </ButtonBase>
                  <IconButton
                    aria-label={`Delete query from history: ${item.preview}`}
                    title="Delete query from history"
                    size="small"
                    color="error"
                    onClick={() => onDelete(item)}
                    sx={{ mr: 1 }}
                  >
                    <IconTrash size={16} />
                  </IconButton>
                </Stack>
              );
            })
          ) : (
            <Typography variant="body2" sx={{ py: 1, color: "text.disabled" }}>
              Query history will appear here.
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
