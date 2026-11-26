"use client";

import "@xyflow/react/dist/style.css";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  useViewport,
} from "@xyflow/react";
import { Box, Stack } from "@mui/material";
import { CANVAS, SURFACE } from "../../constants";
import type { ErRelation, ErTable, RelationshipsData } from "../../er-types";
import { RelationEdge, type RelationEdgeType } from "./RelationEdge";
import { RelationshipsToolbar } from "./RelationshipsToolbar";
import { TableNodeCard, type TableNodeType } from "./TableNodeCard";

const nodeTypes = { table: TableNodeCard };
const edgeTypes = { relation: RelationEdge };

const toNodes = (tables: ErTable[]): TableNodeType[] =>
  tables.map((t) => ({
    id: t.id,
    type: "table",
    position: { x: t.x, y: t.y },
    data: { name: t.name, columns: t.columns },
  }));

const toEdges = (relations: ErRelation[]): RelationEdgeType[] =>
  relations.map((r) => ({
    id: r.id,
    type: "relation",
    source: r.from.table,
    target: r.to.table,
    sourceHandle: `${r.from.column}-r`,
    targetHandle: `${r.to.column}-l`,
    data: {
      cardinality: r.cardinality,
      tone: r.tone,
      dashed: Boolean(r.dashed),
    },
  }));

function Diagram({ data }: { data: RelationshipsData }) {
  const initialNodes = useMemo(() => toNodes(data.tables), [data.tables]);
  const edges = useMemo(() => toEdges(data.relations), [data.relations]);

  const [nodes, setNodes, onNodesChange] = useNodesState<TableNodeType>(initialNodes);
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();
  const zoomPercent = Math.round(zoom * 100);

  const autoArrange = useCallback(() => {
    setNodes(initialNodes);
    requestAnimationFrame(() => fitView({ padding: 0.15, duration: 300 }));
  }, [initialNodes, setNodes, fitView]);

  return (
    <Stack
      spacing={4}
      useFlexGap
      sx={{
        p: 5,
        bgcolor: SURFACE,
        border: "1px solid",
        borderColor: "border.default",
        borderRadius: "12px",
      }}
    >
      <RelationshipsToolbar
        zoomPercent={zoomPercent}
        onZoomIn={() => zoomIn({ duration: 150 })}
        onZoomOut={() => zoomOut({ duration: 150 })}
        onAutoArrange={autoArrange}
      />

      <Box
        role="figure"
        aria-label="Entity relationship diagram"
        sx={{
          height: 520,
          bgcolor: CANVAS,
          border: "1px solid",
          borderColor: "border.default",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.25}
          maxZoom={2}
          nodesConnectable={false}
          edgesFocusable={false}
          zoomOnScroll={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
          style={{ background: "transparent" }}
        />
      </Box>
    </Stack>
  );
}

export function RelationshipsView({ data }: { data: RelationshipsData }) {
  return (
    <ReactFlowProvider>
      <Diagram data={data} />
    </ReactFlowProvider>
  );
}
