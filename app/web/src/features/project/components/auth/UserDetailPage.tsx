"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { IconCircleCheck, IconX } from "@tabler/icons-react";
import { Panel } from "./detail/Panel";
import type { AuthUser } from "./types";

type DetailTab = "profile" | "sessions" | "security";

const TABS: { value: DetailTab; label: string }[] = [
  { value: "profile", label: "Profile Overview" },
  { value: "sessions", label: "Active Sessions" },
  { value: "security", label: "Security Log" },
];

function DetailMetadata({ user }: { user: AuthUser }) {
  const items = [
    { label: "Sample User ID", value: user.id },
    { label: "Email Address", value: user.email },
    { label: "Full Name", value: user.name },
    { label: "Role", value: user.role },
    { label: "Email Verified", value: user.verified ? "Yes" : "No", verified: user.verified },
    { label: "Account Status", value: user.status },
    { label: "Last Login", value: user.lastLogin },
  ];

  return (
    <Panel
      component="section"
      aria-labelledby="identity-metadata-title"
      sx={{ flex: 1, minWidth: 0 }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between" }}
      >
        <Typography id="identity-metadata-title" component="h2" sx={{ fontWeight: 600 }}>
          User Identity Metadata
        </Typography>
        <Button
          variant="outlined"
          disabled
          sx={{ minHeight: 30, textTransform: "none", fontSize: 12 }}
        >
          Edit Metadata
        </Button>
      </Stack>
      <Box component="dl" sx={{ display: "flex", flexDirection: "column", gap: 3, m: 0 }}>
        {items.map((item) => (
          <Box key={item.label}>
            <Typography
              component="dt"
              sx={{ fontSize: 11, fontWeight: 600, color: "text.disabled" }}
            >
              {item.label}
            </Typography>
            <Stack
              component="dd"
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", m: 0, mt: 0.5, minWidth: 0 }}
            >
              {item.verified !== undefined &&
                (item.verified ? (
                  <IconCircleCheck size={14} color="currentColor" />
                ) : (
                  <IconX size={14} color="currentColor" />
                ))}
              <Typography
                variant={item.label === "Sample User ID" ? "code" : "body2"}
                sx={{
                  fontSize: item.label === "Sample User ID" ? 11 : 13,
                  fontWeight: 600,
                  overflowWrap: "anywhere",
                }}
              >
                {item.value}
              </Typography>
            </Stack>
          </Box>
        ))}
        <Box>
          <Typography component="dt" sx={{ fontSize: 11, fontWeight: 600, color: "text.disabled" }}>
            Account created
          </Typography>
          <Typography component="dd" sx={{ m: 0, mt: 0.5, fontSize: 13, color: "text.secondary" }}>
            Not included in sample data
          </Typography>
        </Box>
      </Box>
    </Panel>
  );
}

function SessionsPreview() {
  return (
    <Panel component="section" aria-labelledby="sessions-title">
      <Typography id="sessions-title" component="h2" sx={{ fontWeight: 600 }}>
        Active Device Sessions
      </Typography>
      <Alert severity="info">
        Session records are not included in this preview and are not available
        from the project API.
      </Alert>
    </Panel>
  );
}

function DangerZone() {
  return (
    <Panel component="section" aria-labelledby="danger-zone-title">
      <Typography
        id="danger-zone-title"
        component="h2"
        sx={{ fontWeight: 600, color: "error.main" }}
      >
        Danger Zone Actions
      </Typography>
      <Stack spacing={2}>
        {["Disable User Account", "Force Password Reset", "Permanently Delete User"].map(
          (action) => (
            <Button
              key={action}
              disabled
              variant="outlined"
              color={action.startsWith("Permanently") ? "error" : "inherit"}
              sx={{ textTransform: "none" }}
            >
              {action}
            </Button>
          ),
        )}
      </Stack>
      <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
        User actions are disabled until project authentication APIs are available.
      </Typography>
    </Panel>
  );
}

export function UserDetailPage({
  projectId,
  user,
}: {
  projectId: string;
  user: AuthUser;
}) {
  const [tab, setTab] = useState<DetailTab>("profile");
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <Stack spacing={{ xs: 4, md: 5 }} useFlexGap sx={{ minWidth: 0 }}>
      <Breadcrumbs
        separator="/"
        aria-label="Breadcrumb"
        sx={{ fontSize: 12, color: "text.disabled" }}
      >
        <Link
          href={`/dashboard/projects/${encodeURIComponent(projectId)}/auth`}
          style={{ color: "inherit", textDecoration: "none" }}
        >
          Authentication
        </Link>
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Users</Typography>
        <Typography aria-current="page" sx={{ fontSize: 12, color: "text.primary" }}>
          {user.email}
        </Typography>
      </Breadcrumbs>

      <Alert severity="info">
        Preview user details only. This record is sample data and is not stored
        in or connected to this project.
      </Alert>

      <Paper
        variant="outlined"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 3,
          p: { xs: 3, sm: 4 },
          bgcolor: "background.default",
          borderColor: "border.default",
          borderRadius: 1.5,
        }}
      >
        <Stack direction="row" spacing={3} sx={{ alignItems: "center", minWidth: 0 }}>
          <Avatar
            sx={{
              width: 52,
              height: 52,
              bgcolor: "background.elevated",
              color: "text.primary",
              border: 1,
              borderColor: "border.default",
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h1" sx={{ fontSize: 20, fontWeight: 700 }}>
              {user.name}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary", overflowWrap: "anywhere" }}>
              {user.email} · {user.role} · {user.status}
            </Typography>
          </Box>
        </Stack>
        <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
          Account creation date not available
        </Typography>
      </Paper>

      <Tabs
        value={tab}
        onChange={(_, value: string) => {
          if (value === "profile" || value === "sessions" || value === "security") {
            setTab(value);
          }
        }}
        aria-label="User detail sections"
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 38,
          borderBottom: 1,
          borderColor: "border.default",
          "& .MuiTab-root": {
            minHeight: 38,
            minWidth: 0,
            px: 3,
            fontSize: 12,
            textTransform: "none",
          },
        }}
      >
        {TABS.map((item) => (
          <Tab key={item.value} value={item.value} label={item.label} />
        ))}
      </Tabs>

      {tab === "profile" && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(320px, 420px)" },
            alignItems: "start",
            gap: { xs: 3, sm: 4 },
            minWidth: 0,
          }}
        >
          <DetailMetadata user={user} />
          <Stack spacing={3} useFlexGap>
            <SessionsPreview />
            <DangerZone />
          </Stack>
        </Box>
      )}
      {tab === "sessions" && <SessionsPreview />}
      {tab === "security" && (
        <Panel component="section" aria-labelledby="security-log-title">
          <Typography id="security-log-title" component="h2" sx={{ fontWeight: 600 }}>
            Security Log
          </Typography>
          <Alert severity="info">
            Security events are not available because project authentication is
            not connected to an API.
          </Alert>
        </Panel>
      )}
    </Stack>
  );
}
