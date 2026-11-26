"use client";

import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import { Plus, ZoomIn, ZoomOut } from "lucide-react";
import { CANVAS } from "../../constants";
import { toolbarButtonSx } from "../sql-editor/toolbarStyles";

interface Props {
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onAutoArrange: () => void;
  onAddRelationship?: () => void;
}

const zoomButtonSx = { p: 0, borderRadius: "4px", color: "text.secondary" } as const;

export function RelationshipsToolbar({
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onAutoArrange,
  onAddRelationship,
}: Props) {
  return (
    <Stack sx={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Box
        role="group"
        aria-label="Zoom"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 3,
          py: "6px",
          bgcolor: CANVAS,
          border: "1px solid",
          borderColor: "border.default",
          borderRadius: "6px",
        }}
      >
        <IconButton aria-label="Zoom out" onClick={onZoomOut} sx={zoomButtonSx}>
          <ZoomOut size={14} />
        </IconButton>
        <Typography
          component="span"
          variant="code"
          sx={{ minWidth: 29, textAlign: "center", fontSize: 12, lineHeight: "16px", color: "text.secondary" }}
        >
          {zoomPercent}%
        </Typography>
        <IconButton aria-label="Zoom in" onClick={onZoomIn} sx={zoomButtonSx}>
          <ZoomIn size={14} />
        </IconButton>
      </Box>

      <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onAutoArrange}
          sx={{ ...toolbarButtonSx, bgcolor: "background.elevated", color: "text.secondary" }}
        >
          Auto Arrange
        </Button>
        <Button
          variant="contained"
          startIcon={<Plus size={14} />}
          onClick={onAddRelationship}
          sx={{
            ...toolbarButtonSx,
            fontWeight: 600,
            color: "common.white",
            bgcolor: "primary.main",
          }}
        >
          Add Relationship
        </Button>
      </Stack>
    </Stack>
  );
}
