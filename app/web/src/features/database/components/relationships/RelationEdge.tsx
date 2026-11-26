"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";
import { Box, useTheme } from "@mui/material";
import { SURFACE } from "../../constants";
import type { ErRelation, RelationTone } from "../../er-types";

export type RelationEdgeData = {
  cardinality: ErRelation["cardinality"];
  tone: RelationTone;
  dashed: boolean;
};
export type RelationEdgeType = Edge<RelationEdgeData, "relation">;

export function RelationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<RelationEdgeType>) {
  const theme = useTheme();
  const color = theme.palette[data?.tone ?? "info"].main;

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 6,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: color,
          strokeWidth: 1.5,
          strokeDasharray: data?.dashed ? "6 4" : undefined,
        }}
      />
      <EdgeLabelRenderer>
        <Box
          className="nodrag nopan"
          sx={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            px: "6px",
            py: "2px",
            bgcolor: SURFACE,
            border: "1px solid",
            borderColor: "border.default",
            borderRadius: "4px",
            typography: "code",
            fontSize: 10,
            lineHeight: "13px",
            color,
            pointerEvents: "none",
          }}
        >
          {data?.cardinality}
        </Box>
      </EdgeLabelRenderer>
    </>
  );
}
