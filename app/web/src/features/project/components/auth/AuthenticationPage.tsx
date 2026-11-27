"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  IconAdjustmentsHorizontal,
  IconCircleCheck,
  IconPlus,
  IconSearch,
  IconUsers,
} from "@tabler/icons-react";
import { UnderlineTabs } from "../shared/UnderlineTabs";
import { TagChip } from "../shared/TagChip";
import { SAMPLE_USERS } from "./mockData";
import type { AuthUser } from "./types";

type AuthTab = "users" | "roles" | "settings";
type RoleFilter = "all" | AuthUser["role"];

const TABS: { value: AuthTab; label: string }[] = [
  { value: "users", label: "Users" },
  { value: "roles", label: "Roles" },
  { value: "settings", label: "Auth Settings" },
];

function SampleStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        flex: 1,
        minWidth: { xs: "100%", sm: 180 },
        p: 4,
        bgcolor: "background.default",
        borderColor: "border.default",
        borderRadius: 1.5,
      }}
    >
      <Box
        sx={(theme) => ({
          display: "grid",
          placeItems: "center",
          width: 36,
          height: 36,
          borderRadius: 1,
          color: "secondary.main",
          bgcolor: theme.palette.statusBackground.info,
        })}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{label}</Typography>
        <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{value}</Typography>
      </Box>
    </Paper>
  );
}

function UsersTable({
  users,
  projectId,
}: {
  users: AuthUser[];
  projectId: string;
}) {
  if (users.length === 0) {
    return (
      <Box sx={{ p: 6, textAlign: "center", color: "text.secondary" }}>
        No sample users match those filters.
      </Box>
    );
  }

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Table
        size="small"
        aria-label="Sample authentication users"
        sx={{
          minWidth: 700,
          "& .MuiTableCell-root": {
            borderColor: "border.default",
            py: 2.5,
            px: 3,
          },
        }}
      >
        <TableHead>
          <TableRow>
            {["User", "Role", "Email verification", "Last login", "Status"].map((item) => (
              <TableCell
                key={item}
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "text.disabled",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {item}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <Box
                    aria-hidden="true"
                    sx={{
                      display: "grid",
                      placeItems: "center",
                      width: 30,
                      height: 30,
                      flexShrink: 0,
                      borderRadius: "50%",
                      bgcolor: "background.input",
                      color: "text.secondary",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {user.name.split(" ").map((name) => name[0]).join("")}
                  </Box>
                  <Box>
                    <Typography
                      component={Link}
                      href={`/dashboard/projects/${encodeURIComponent(projectId)}/auth/${encodeURIComponent(user.id)}`}
                      sx={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        color: "text.primary",
                        textDecoration: "none",
                        "&:hover": { color: "secondary.main" },
                      }}
                    >
                      {user.name}
                    </Typography>
                    <Typography variant="code" sx={{ fontSize: 10, color: "text.disabled" }}>
                      {user.id}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>
              <TableCell>
                <TagChip
                  label={user.role}
                  tint={user.role === "Admin" ? "info" : "neutral"}
                  color={user.role === "Admin" ? "secondary.main" : "text.secondary"}
                />
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Typography sx={{ fontSize: 12 }}>{user.email}</Typography>
                  {user.verified && <IconCircleCheck size={14} color="currentColor" />}
                </Stack>
              </TableCell>
              <TableCell sx={{ fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}>
                {user.lastLogin}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={user.status}
                  sx={(theme) => ({
                    height: 22,
                    fontSize: 10,
                    fontWeight: 600,
                    bgcolor:
                      theme.palette.statusBackground[
                        user.status === "Active" ? "success" : "neutral"
                      ],
                    color: user.status === "Active" ? "success.main" : "text.secondary",
                  })}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export function AuthenticationPage({ projectId }: { projectId: string }) {
  const [tab, setTab] = useState<AuthTab>("users");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return SAMPLE_USERS.filter((user) => {
      const matchesQuery =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      return matchesQuery && (role === "all" || user.role === role);
    });
  }, [role, search]);

  return (
    <Stack spacing={{ xs: 4, md: 5 }} useFlexGap sx={{ minWidth: 0 }}>
      <Box>
        <Typography component="h1" sx={{ fontSize: { xs: 23, md: 28 }, fontWeight: 700 }}>
          Authentication
        </Typography>
        <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 13 }}>
          Explore the planned user identity and access management interface.
        </Typography>
      </Box>

      <Alert severity="info">
        Preview only. User records and counts below are sample data, not connected
        to this project. User management, roles, and provider settings are not
        available yet.
      </Alert>

      <UnderlineTabs
        ariaLabel="Authentication sections"
        items={TABS}
        value={tab}
        onChange={setTab}
      />

      {tab === "users" && (
        <Stack spacing={4} useFlexGap sx={{ minWidth: 0 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            useFlexGap
            sx={{ flexWrap: "wrap" }}
          >
            <SampleStat label="Sample users" value={SAMPLE_USERS.length} icon={<IconUsers size={18} />} />
            <SampleStat
              label="Active in sample"
              value={SAMPLE_USERS.filter((user) => user.status === "Active").length}
              icon={<IconCircleCheck size={18} />}
            />
            <SampleStat
              label="Verified in sample"
              value={SAMPLE_USERS.filter((user) => user.verified).length}
              icon={<IconCircleCheck size={18} />}
            />
          </Stack>

          <Paper
            variant="outlined"
            sx={{
              overflow: "hidden",
              bgcolor: "background.default",
              borderColor: "border.default",
              borderRadius: 1.5,
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              useFlexGap
              sx={{
                p: 3,
                alignItems: { xs: "stretch", md: "center" },
                justifyContent: "space-between",
                borderBottom: 1,
                borderColor: "border.default",
              }}
            >
              <TextField
                size="small"
                placeholder="Search sample users..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size={16} />
                      </InputAdornment>
                    ),
                  },
                  htmlInput: { "aria-label": "Search sample users" },
                }}
                sx={{ width: { xs: "100%", md: 280 } }}
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl size="small" sx={{ minWidth: 145 }}>
                  <Select
                    value={role}
                    onChange={(event) => {
                      const nextRole = event.target.value;
                      setRole(
                        nextRole === "Admin" || nextRole === "User"
                          ? nextRole
                          : "all",
                      );
                    }}
                    inputProps={{ "aria-label": "Filter sample users by role" }}
                    startAdornment={
                      <InputAdornment position="start">
                        <IconAdjustmentsHorizontal size={15} />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="all">All roles</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="User">User</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  disabled
                  variant="contained"
                  startIcon={<IconPlus size={16} />}
                  sx={{ textTransform: "none", whiteSpace: "nowrap" }}
                >
                  Add user unavailable
                </Button>
              </Stack>
            </Stack>
            <UsersTable users={filteredUsers} projectId={projectId} />
            <Typography
              sx={{
                px: 3,
                py: 2.5,
                borderTop: 1,
                borderColor: "border.default",
                fontSize: 11,
                color: "text.secondary",
              }}
            >
              Showing {filteredUsers.length} of {SAMPLE_USERS.length} sample users
            </Typography>
          </Paper>
        </Stack>
      )}

      {tab === "roles" && (
        <Paper
          variant="outlined"
          sx={{ p: { xs: 4, sm: 5 }, bgcolor: "background.default", borderColor: "border.default" }}
        >
          <Typography component="h2" sx={{ fontWeight: 600 }}>
            Project roles are not available yet
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 13, color: "text.secondary" }}>
            Role definitions and permission management will appear here when the
            project authentication service is implemented.
          </Typography>
        </Paper>
      )}

      {tab === "settings" && (
        <Paper
          variant="outlined"
          sx={{ p: { xs: 4, sm: 5 }, bgcolor: "background.default", borderColor: "border.default" }}
        >
          <Typography component="h2" sx={{ fontWeight: 600 }}>
            Authentication settings are not available yet
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 13, color: "text.secondary" }}>
            Provider configuration, sign-in policies, and project auth settings
            are not connected to a project API.
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}
