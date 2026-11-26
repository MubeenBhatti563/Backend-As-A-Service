"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  IconArrowNarrowRight,
  IconArrowNarrowLeft,
  IconColumns,
  IconEye,
  IconLink,
  IconRefresh,
} from "@tabler/icons-react";
import { SURFACE } from "../../constants";
import type { TableRelationshipsResponse } from "../../types";
import { RelationshipsView } from "./RelationshipsView";
import { AddRelationshipDialog } from "./AddRelationshipDialog";

function StatCard({
  label,
  value,
  icon: Icon,
  color = "secondary.main",
}: {
  label: string;
  value: string | number;
  icon: typeof IconLink;
  color?: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        minWidth: 160,
        p: 2.5,
        display: "flex",
        alignItems: "center",
        gap: 2,
        bgcolor: SURFACE,
        borderColor: "border.default",
        borderRadius: "10px",
      }}
    >
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 1,
          bgcolor: "background.elevated",
          color,
        }}
      >
        <Icon size={18} aria-hidden />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            color: "text.disabled",
            fontSize: 11,
            lineHeight: "14px",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            mt: 0.5,
            fontSize: 18,
            lineHeight: "22px",
            fontWeight: 700,
            color: "text.primary",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

interface Props {
  projectId: string;
  relationshipsData: TableRelationshipsResponse;
}

export function TableRelationshipsView({
  projectId,
  relationshipsData,
}: Props) {
  const router = useRouter();
  const [showCanvas, setShowCanvas] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const availableColumns = useMemo(() => {
    const sourceTable = relationshipsData.erData.tables.find(
      (t) => t.name === relationshipsData.table.name,
    );
    return sourceTable?.columns.map((c) => c.name) ?? [];
  }, [relationshipsData]);

  const outgoing = useMemo(
    () => relationshipsData.relationships.filter((r) => r.direction === "outgoing"),
    [relationshipsData.relationships],
  );

  const incoming = useMemo(
    () => relationshipsData.relationships.filter((r) => r.direction === "incoming"),
    [relationshipsData.relationships],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Metric Cards */}
      <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
        <StatCard
          label="Total Relations"
          value={relationshipsData.relationships.length}
          icon={IconLink}
          color="text.primary"
        />
        <StatCard
          label="Outgoing (References)"
          value={outgoing.length}
          icon={IconArrowNarrowRight}
          color="info.main"
        />
        <StatCard
          label="Incoming (Referenced By)"
          value={incoming.length}
          icon={IconArrowNarrowLeft}
          color="secondary.main"
        />
      </Box>

      {/* Header bar for Diagram */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 700 }}>
          Entity Relationship Diagram
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<IconEye size={15} />}
          onClick={() => setShowCanvas((prev) => !prev)}
          sx={{
            textTransform: "none",
            borderRadius: "6px",
            borderColor: "border.default",
            color: "text.primary",
          }}
        >
          {showCanvas ? "Hide ER Canvas" : "Show ER Canvas"}
        </Button>
      </Box>

      {/* ER Diagram Canvas */}
      {showCanvas && (
        relationshipsData.erData.tables.length > 0 ? (
          <RelationshipsView
            data={relationshipsData.erData}
            onAddRelationship={() => setShowAddDialog(true)}
          />
        ) : (
          <Box
            sx={{
              p: 5,
              bgcolor: SURFACE,
              border: "1px solid",
              borderColor: "border.default",
              borderRadius: "12px",
              display: "grid",
              placeItems: "center",
              minHeight: 240,
              color: "text.disabled",
              typography: "body2",
            }}
          >
            No relationships defined for this table yet.
          </Box>
        )
      )}

      {/* Structured Relationships Table */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 700 }}>
          Foreign Key Constraints
        </Typography>

        <Box
          sx={{
            bgcolor: SURFACE,
            border: "1px solid",
            borderColor: "border.default",
            borderRadius: "12px",
            overflowX: "auto",
          }}
        >
          <Table sx={{ minWidth: 700 }} aria-label="Table relationships">
            <TableHead>
              <TableRow sx={{ bgcolor: "background.elevated" }}>
                <TableCell sx={{ color: "text.disabled", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", py: 2, pl: 3 }}>
                  Direction
                </TableCell>
                <TableCell sx={{ color: "text.disabled", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", py: 2 }}>
                  Source Field
                </TableCell>
                <TableCell sx={{ color: "text.disabled", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", py: 2 }}>
                  Target Reference
                </TableCell>
                <TableCell sx={{ color: "text.disabled", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", py: 2 }}>
                  Cardinality
                </TableCell>
                <TableCell sx={{ color: "text.disabled", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", py: 2 }}>
                  On Delete
                </TableCell>
                <TableCell sx={{ color: "text.disabled", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", py: 2, pr: 3 }}>
                  Constraint Name
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {relationshipsData.relationships.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.disabled" }}>
                    No foreign key relationships found for this table.
                  </TableCell>
                </TableRow>
              )}

              {relationshipsData.relationships.map((rel) => {
                const isOut = rel.direction === "outgoing";
                return (
                  <TableRow key={rel.id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                    {/* Direction */}
                    <TableCell sx={{ py: 2, pl: 3 }}>
                      <Chip
                        size="small"
                        icon={isOut ? <IconArrowNarrowRight size={13} /> : <IconArrowNarrowLeft size={13} />}
                        label={isOut ? "Outgoing" : "Incoming"}
                        sx={{
                          fontSize: 11,
                          fontWeight: 600,
                          bgcolor: isOut ? "rgba(59, 130, 246, 0.12)" : "rgba(6, 182, 212, 0.12)",
                          color: isOut ? "#60A5FA" : "#22D3EE",
                        }}
                      />
                    </TableCell>

                    {/* Source */}
                    <TableCell sx={{ py: 2 }}>
                      <Typography sx={{ typography: "code", fontSize: 13, fontWeight: 600, color: "text.primary" }}>
                        {rel.sourceTable}.{rel.sourceColumn}
                      </Typography>
                    </TableCell>

                    {/* Target */}
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconLink size={14} color="#60A5FA" />
                        <Typography sx={{ typography: "code", fontSize: 13, fontWeight: 600, color: "info.main" }}>
                          {rel.targetTable}.{rel.targetColumn}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Cardinality */}
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        size="small"
                        label={rel.cardinality}
                        sx={{ typography: "code", fontSize: 11, fontWeight: 700, bgcolor: "background.elevated" }}
                      />
                    </TableCell>

                    {/* On Delete */}
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        size="small"
                        label={rel.onDelete ?? "NO ACTION"}
                        sx={{
                          fontSize: 10,
                          fontWeight: 700,
                          bgcolor: rel.onDelete === "CASCADE" ? "rgba(239, 68, 68, 0.12)" : "background.elevated",
                          color: rel.onDelete === "CASCADE" ? "#F87171" : "text.secondary",
                        }}
                      />
                    </TableCell>

                    {/* Constraint Name */}
                    <TableCell sx={{ py: 2, pr: 3 }}>
                      <Typography sx={{ typography: "code", fontSize: 11, color: "text.disabled" }}>
                        {rel.constraintName}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Box>

      {/* Add Relationship Dialog */}
      <AddRelationshipDialog
        open={showAddDialog}
        projectId={projectId}
        tableName={relationshipsData.table.name}
        availableColumns={availableColumns}
        onClose={() => setShowAddDialog(false)}
        onCreated={() => {
          setShowAddDialog(false);
          router.refresh();
        }}
      />
    </Box>
  );
}
