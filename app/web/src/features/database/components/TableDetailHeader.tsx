"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Snackbar, Typography } from "@mui/material";
import { IconTrash } from "@tabler/icons-react";
import { projectTablesBase } from "../constants";
import type { DatabaseTable } from "../types";
import { HeaderStat, HeaderStatDivider } from "./HeaderStat";
import { dropDatabaseTable } from "../table.client-api";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

function RlsPill({ status }: { status: DatabaseTable["rls"] }) {
  const active = status === "active";
  const color = active ? "success.main" : "secondary.main";

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        px: "10px",
        py: 1,
        border: "1px solid",
        borderColor: color,
        borderRadius: "99px",
        bgcolor: active ? "statusBackground.success" : "statusBackground.primary",
        color,
        typography: "code",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: "14px",
        textTransform: "uppercase",
      }}
    >
      RLS {active ? "Active" : "Disabled"}
    </Box>
  );
}

interface Props {
  projectId: string;
  table: DatabaseTable;
}

export function TableDetailHeader({ projectId, table }: Props) {
  const base = projectTablesBase(projectId);
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteTable = async () => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      await dropDatabaseTable(projectId, table.name);
      router.push(base);
    } catch {
      setIsDeleting(false);
      setDeleteError("Could not drop table. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", lg: "center" },
        gap: { xs: 3, lg: 2 },
        minWidth: 0,
      }}
    >
      {/* Left: breadcrumb + title */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box
          component="nav"
          aria-label="Breadcrumb"
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1.5,
            minWidth: 0,
            flexWrap: "wrap",
          }}
        >
          <NextLink href={base} style={{ textDecoration: "none" }}>
            <Typography
              variant="body2"
              sx={{
                color: "text.disabled",
                "&:hover": { textDecoration: "underline", color: "text.primary" },
              }}
            >
              Database
            </Typography>
          </NextLink>
          <Typography variant="body2" sx={{ color: "text.disabled" }} aria-hidden>
            /
          </Typography>
          <NextLink href={base} style={{ textDecoration: "none" }}>
            <Typography
              variant="body2"
              sx={{
                color: "text.disabled",
                "&:hover": { textDecoration: "underline", color: "text.primary" },
              }}
            >
              Tables
            </Typography>
          </NextLink>
          <Typography variant="body2" sx={{ color: "text.disabled" }} aria-hidden>
            /
          </Typography>
          <Typography
            variant="body2"
            aria-current="page"
            sx={{ color: "text.primary", fontWeight: 500 }}
          >
            {table.name}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: { xs: 1.5, sm: 3 },
            minWidth: 0,
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontSize: { xs: 24, sm: 32 }, overflowWrap: "anywhere" }}
          >
            {table.name}
          </Typography>
          <RlsPill status={table.rls} />
        </Box>
      </Box>

      {/* Right: stats + drop table button */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: { xs: 2, sm: 4 },
          flexWrap: "wrap",
        }}
      >
        <HeaderStat
          label="Rows"
          value={table.rows.toLocaleString("en-US")}
          color="text.primary"
        />
        <HeaderStatDivider />
        <HeaderStat label="Total size" value={table.size} color="secondary.main" />

        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<IconTrash size={16} />}
          onClick={() => setDeleteOpen(true)}
          sx={{
            fontSize: 12,
            textTransform: "none",
            borderRadius: "6px",
            borderColor: "border.default",
            color: "text.secondary",
            "&:hover": {
              color: "error.main",
              borderColor: "error.main",
              bgcolor: "rgba(239, 68, 68, 0.08)",
            },
          }}
        >
          Drop table
        </Button>
      </Box>

      <ConfirmDeleteDialog
        open={deleteOpen}
        title={`Drop table "${table.name}"?`}
        description={`Are you sure you want to drop table "${table.name}"? All rows, schema definitions, and associated constraints will be permanently deleted.`}
        confirmLabel="Drop table"
        submitting={isDeleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteTable}
      />

      <Snackbar
        open={Boolean(deleteError)}
        autoHideDuration={5000}
        onClose={() => setDeleteError("")}
      >
        <Alert severity="error" onClose={() => setDeleteError("")}>
          {deleteError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
