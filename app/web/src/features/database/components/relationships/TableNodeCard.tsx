"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Box, Stack, Typography } from "@mui/material";
import { Key, Link2, Table as TableIcon, EllipsisVertical } from "lucide-react";
import { SURFACE } from "../../constants";
import type { ErColumn } from "../../er-types";

export type TableNodeData = { name: string; columns: ErColumn[] };
export type TableNodeType = Node<TableNodeData, "table">;

/** Invisible anchors: edges attach to the exact key/FK row, not just the card edge. */
const anchor = {
  width: 1,
  height: 1,
  minWidth: 0,
  minHeight: 0,
  opacity: 0,
  border: 0,
  background: "transparent",
} as const;

function KeyIcon({ kind }: { kind: "pk" | "fk" }) {
  return (
    <Box
      aria-hidden
      sx={{ display: "flex", width: 10, height: 10, color: kind === "pk" ? "warning.main" : "info.main" }}
    >
      {kind === "pk" ? <Key size={10} /> : <Link2 size={10} />}
    </Box>
  );
}

export function TableNodeCard({ data }: NodeProps<TableNodeType>) {
  return (
    <Box
      sx={{
        width: 200,
        bgcolor: SURFACE,
        border: "1px solid",
        borderColor: "border.default",
        borderRadius: "8px",
      }}
    >
      <Stack
        sx={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          p: 3,
          bgcolor: "background.elevated",
          borderBottom: "1px solid",
          borderColor: "border.default",
          borderRadius: "7px 7px 0 0",
        }}
      >
        <Stack sx={{ flexDirection: "row", alignItems: "center", gap: "6px" }}>
          <Box aria-hidden sx={{ display: "flex", color: "secondary.main" }}>
            <TableIcon size={14} />
          </Box>
          <Typography component="span" sx={{ fontSize: 13, fontWeight: 600, lineHeight: "17px" }}>
            {data.name}
          </Typography>
        </Stack>
        <Box aria-hidden sx={{ display: "flex", color: "text.disabled" }}>
          <EllipsisVertical size={14} />
        </Box>
      </Stack>

      <Stack sx={{ gap: 2, p: "10px" }}>
        {data.columns.map((col) => (
          <Stack
            key={col.name}
            sx={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
              height: 16,
            }}
          >
            <Stack sx={{ flexDirection: "row", alignItems: "center", gap: "6px" }}>
              {col.key ? <KeyIcon kind={col.key} /> : <Box aria-hidden sx={{ width: 10, height: 10 }} />}
              <Typography component="span" sx={{ fontSize: 12, lineHeight: "16px" }}>
                {col.name}
              </Typography>
            </Stack>

            <Typography
              component="span"
              variant="code"
              sx={{ fontSize: 11, lineHeight: "14px", color: "text.secondary" }}
            >
              {col.type}
            </Typography>

            {col.key && (
              <>
                <Handle id={`${col.name}-l`} type="target" position={Position.Left} style={{ ...anchor, left: -11 }} />
                <Handle id={`${col.name}-r`} type="source" position={Position.Right} style={{ ...anchor, right: -11 }} />
              </>
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
