"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  IconAlertTriangle,
  IconCheck,
  IconLock,
  IconLockOpen,
  IconPlus,
  IconSearch,
  IconShield,
  IconShieldCheck,
  IconShieldLock,
  IconTrash,
} from "@tabler/icons-react";
import { SURFACE } from "../../constants";
import type { TablePoliciesResponse, TablePolicy } from "../../types";
import { AddPolicyDialog } from "./AddPolicyDialog";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";
import {
  dropDatabaseTablePolicy,
  toggleDatabaseTableRls,
} from "../../table.client-api";
import { getErrorMessage } from "@/lib/get-error-message";

function StatCard({
  label,
  value,
  icon: Icon,
  color = "secondary.main",
}: {
  label: string;
  value: string | number;
  icon: typeof IconShield;
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

const COMMAND_COLORS: Record<string, { bg: string; color: string }> = {
  ALL: { bg: "rgba(168, 85, 247, 0.12)", color: "#C084FC" },
  SELECT: { bg: "rgba(59, 130, 246, 0.12)", color: "#60A5FA" },
  INSERT: { bg: "rgba(16, 185, 129, 0.12)", color: "#34D399" },
  UPDATE: { bg: "rgba(245, 158, 11, 0.12)", color: "#FBBF24" },
  DELETE: { bg: "rgba(239, 68, 68, 0.12)", color: "#F87171" },
};

interface Props {
  projectId: string;
  policiesData: TablePoliciesResponse;
}

export function TablePoliciesView({ projectId, policiesData }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<TablePolicy | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingRls, setIsTogglingRls] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const filteredPolicies = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return policiesData.policies;
    return policiesData.policies.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.command.toLowerCase().includes(q) ||
        p.roles.some((r) => r.toLowerCase().includes(q)) ||
        (p.using && p.using.toLowerCase().includes(q)) ||
        (p.withCheck && p.withCheck.toLowerCase().includes(q)),
    );
  }, [policiesData.policies, search]);

  const readPoliciesCount = useMemo(
    () =>
      policiesData.policies.filter(
        (p) => p.command === "SELECT" || p.command === "ALL",
      ).length,
    [policiesData.policies],
  );

  const writePoliciesCount = useMemo(
    () =>
      policiesData.policies.filter(
        (p) =>
          p.command === "INSERT" ||
          p.command === "UPDATE" ||
          p.command === "DELETE" ||
          p.command === "ALL",
      ).length,
    [policiesData.policies],
  );

  const handleToggleRls = async () => {
    setIsTogglingRls(true);
    setErrorMessage("");
    try {
      const nextState = !policiesData.rlsEnabled;
      await toggleDatabaseTableRls(projectId, policiesData.table.name, nextState);
      setToastMessage(
        nextState
          ? "Row-Level Security has been enabled on this table."
          : "Row-Level Security has been disabled on this table.",
      );
      router.refresh();
    } catch (cause) {
      setErrorMessage(getErrorMessage(cause, "Failed to toggle RLS."));
    } finally {
      setIsTogglingRls(false);
    }
  };

  const handleDeletePolicy = async () => {
    if (!policyToDelete) return;
    setIsDeleting(true);
    setErrorMessage("");
    try {
      await dropDatabaseTablePolicy(
        projectId,
        policiesData.table.name,
        policyToDelete.name,
      );
      setToastMessage(`Policy "${policyToDelete.name}" dropped.`);
      setPolicyToDelete(null);
      router.refresh();
    } catch (cause) {
      setErrorMessage(getErrorMessage(cause, "Could not drop policy."));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Metric Cards */}
      <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
        <StatCard
          label="RLS Status"
          value={policiesData.rlsEnabled ? "Active" : "Disabled"}
          icon={policiesData.rlsEnabled ? IconShieldLock : IconLockOpen}
          color={policiesData.rlsEnabled ? "success.main" : "text.secondary"}
        />
        <StatCard
          label="Total Policies"
          value={policiesData.policies.length}
          icon={IconShield}
          color="secondary.main"
        />
        <StatCard
          label="Read Policies"
          value={readPoliciesCount}
          icon={IconCheck}
          color="info.main"
        />
        <StatCard
          label="Write Policies"
          value={writePoliciesCount}
          icon={IconShieldCheck}
          color="warning.main"
        />
      </Box>

      {/* Warning banner when RLS is active but 0 policies exist */}
      {policiesData.rlsEnabled && policiesData.policies.length === 0 && (
        <Alert
          severity="warning"
          icon={<IconAlertTriangle size={20} />}
          sx={{
            borderRadius: "10px",
            bgcolor: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            "& .MuiAlert-message": { fontSize: 13 },
          }}
        >
          <strong>RLS is enabled, but no policies have been created yet.</strong> In
          PostgreSQL, enabling Row-Level Security without policies denies all queries
          for non-superusers. Add at least one policy to allow legitimate access.
        </Alert>
      )}

      {/* Action / Toolbar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
        }}
      >
        <OutlinedInput
          size="small"
          placeholder="Filter policies…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <IconSearch size={16} />
            </InputAdornment>
          }
          sx={{
            width: { xs: "100%", sm: 280 },
            bgcolor: SURFACE,
            borderRadius: "8px",
            fontSize: 13,
            "& fieldset": { borderColor: "border.default" },
          }}
        />

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleToggleRls}
            disabled={isTogglingRls}
            startIcon={
              policiesData.rlsEnabled ? (
                <IconLockOpen size={16} />
              ) : (
                <IconLock size={16} />
              )
            }
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              borderColor: "border.default",
              color: policiesData.rlsEnabled ? "warning.main" : "success.main",
              "&:hover": {
                borderColor: policiesData.rlsEnabled
                  ? "warning.main"
                  : "success.main",
              },
            }}
          >
            {policiesData.rlsEnabled ? "Disable RLS" : "Enable RLS"}
          </Button>

          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<IconPlus size={16} />}
            onClick={() => setAddOpen(true)}
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            Add Policy
          </Button>
        </Box>
      </Box>

      {/* Policies Table */}
      <Box
        sx={{
          bgcolor: SURFACE,
          border: "1px solid",
          borderColor: "border.default",
          borderRadius: "12px",
          overflowX: "auto",
        }}
      >
        <Table sx={{ minWidth: 750 }} aria-label="Table security policies">
          <TableHead>
            <TableRow sx={{ bgcolor: "background.elevated" }}>
              <TableCell
                sx={{
                  color: "text.disabled",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  py: 2,
                  pl: 3,
                }}
              >
                Policy Name
              </TableCell>
              <TableCell
                sx={{
                  color: "text.disabled",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  py: 2,
                }}
              >
                Action
              </TableCell>
              <TableCell
                sx={{
                  color: "text.disabled",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  py: 2,
                }}
              >
                Roles
              </TableCell>
              <TableCell
                sx={{
                  color: "text.disabled",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  py: 2,
                }}
              >
                USING Expression
              </TableCell>
              <TableCell
                sx={{
                  color: "text.disabled",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  py: 2,
                }}
              >
                WITH CHECK Expression
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: "text.disabled",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  py: 2,
                  pr: 3,
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredPolicies.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 6, color: "text.disabled" }}
                >
                  {search.trim()
                    ? `No policies matching "${search}".`
                    : "No security policies defined on this table yet."}
                </TableCell>
              </TableRow>
            )}

            {filteredPolicies.map((policy) => {
              const cmdColor =
                COMMAND_COLORS[policy.command] ?? COMMAND_COLORS.ALL;
              return (
                <TableRow
                  key={policy.name}
                  hover
                  sx={{ "&:last-child td": { borderBottom: 0 } }}
                >
                  {/* Name */}
                  <TableCell sx={{ py: 2, pl: 3 }}>
                    <Typography
                      sx={{
                        typography: "code",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "text.primary",
                      }}
                    >
                      {policy.name}
                    </Typography>
                  </TableCell>

                  {/* Command */}
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      size="small"
                      label={policy.command}
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        bgcolor: cmdColor.bg,
                        color: cmdColor.color,
                      }}
                    />
                  </TableCell>

                  {/* Roles */}
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {policy.roles.map((r) => (
                        <Chip
                          key={r}
                          size="small"
                          label={r}
                          sx={{
                            typography: "code",
                            fontSize: 11,
                            bgcolor: "background.elevated",
                          }}
                        />
                      ))}
                    </Box>
                  </TableCell>

                  {/* USING clause */}
                  <TableCell sx={{ py: 2 }}>
                    {policy.using ? (
                      <Typography
                        sx={{
                          typography: "code",
                          fontSize: 12,
                          color: "text.secondary",
                          maxWidth: 240,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {policy.using}
                      </Typography>
                    ) : (
                      <Typography
                        sx={{ fontSize: 12, color: "text.disabled", fontStyle: "italic" }}
                      >
                        —
                      </Typography>
                    )}
                  </TableCell>

                  {/* WITH CHECK clause */}
                  <TableCell sx={{ py: 2 }}>
                    {policy.withCheck ? (
                      <Typography
                        sx={{
                          typography: "code",
                          fontSize: 12,
                          color: "text.secondary",
                          maxWidth: 240,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {policy.withCheck}
                      </Typography>
                    ) : (
                      <Typography
                        sx={{ fontSize: 12, color: "text.disabled", fontStyle: "italic" }}
                      >
                        —
                      </Typography>
                    )}
                  </TableCell>

                  {/* Delete Button */}
                  <TableCell align="right" sx={{ py: 2, pr: 3 }}>
                    <Tooltip title={`Drop policy "${policy.name}"`}>
                      <IconButton
                        size="small"
                        onClick={() => setPolicyToDelete(policy)}
                        sx={{
                          color: "text.disabled",
                          "&:hover": {
                            color: "error.main",
                            bgcolor: "rgba(239, 68, 68, 0.08)",
                          },
                        }}
                      >
                        <IconTrash size={15} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      {/* Add Policy Dialog */}
      <AddPolicyDialog
        open={addOpen}
        projectId={projectId}
        tableName={policiesData.table.name}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          setAddOpen(false);
          setToastMessage("Policy created successfully.");
          router.refresh();
        }}
      />

      {/* Confirm Delete Policy Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(policyToDelete)}
        title={`Drop policy "${policyToDelete?.name}"?`}
        description={`Are you sure you want to drop policy "${policyToDelete?.name}" from table "${policiesData.table.name}"?`}
        confirmLabel="Drop Policy"
        submitting={isDeleting}
        onClose={() => setPolicyToDelete(null)}
        onConfirm={handleDeletePolicy}
      />

      {/* Toast notifications */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage("")}
      >
        <Alert severity="success" onClose={() => setToastMessage("")}>
          {toastMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={5000}
        onClose={() => setErrorMessage("")}
      >
        <Alert severity="error" onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
