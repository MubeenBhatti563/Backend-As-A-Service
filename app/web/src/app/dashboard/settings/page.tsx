"use client";

import { useState } from "react";
import { AccountShell } from "@/features/projects/components/projects/AccountShell";
import { useAuthStore } from "@/stores";
import Loading from "@/app/loading";
import { useAllProjects } from "@/features/projects/hooks/use-project";
import { useMyPlan } from "@/features/projects/hooks/use-plan";
import {
  badgeSx,
  font,
  panelSx,
} from "@/features/projects/components/projectStyle";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  IconAlertTriangle,
  IconBell,
  IconCheck,
  IconClock,
  IconCopy,
  IconDeviceDesktop,
  IconDevices,
  IconKey,
  IconLock,
  IconMail,
  IconShieldCheck,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import {
  useGetAllSessions,
  useRevokeOtherSessions,
  useRevokeSession,
} from "@/features/auth";

export default function AccountSettingsPage() {
  const { user } = useAuthStore();
  const { data: projects } = useAllProjects();
  const { data: myPlan } = useMyPlan();
  const {
    data: sessions,
    isLoading: isSessionsLoading,
    isError: isSessionsError,
  } = useGetAllSessions();
  const revokeSession = useRevokeSession();
  const revokeOtherSessions = useRevokeOtherSessions();

  const [copiedId, setCopiedId] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "Admin");
  const [email] = useState(user?.email || "admin@devstack.com");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  if (!user) return <Loading />;

  const planName = myPlan?.plan.name ?? "Hobby";
  const planTier =
    myPlan?.plan.priceCents === 0 ? "Free" : (myPlan?.plan.name ?? "Free");

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "November 2026";

  return (
    <AccountShell
      user={user}
      projectCount={projects?.length ?? 0}
      activeNav="settings"
      plan={planName}
      tier={planTier}
    >
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography
          sx={{
            color: "secondary.main",
            fontFamily: font.mono,
            fontSize: 11,
            letterSpacing: "1px",
          }}
        >
          SETTINGS
        </Typography>
        <Typography
          component="h1"
          variant="h4"
          sx={{ fontSize: 28, fontWeight: 800, lineHeight: "35px" }}
        >
          Account settings
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
          Manage your personal profile, authentication, active sessions, and
          security preferences.
        </Typography>
      </Box>

      {/* ── Main Settings Grid ──────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          maxWidth: 960,
        }}
      >
        {/* ── 1. Profile Section ──────────────────────────────────────── */}
        <Box
          component="section"
          aria-labelledby="profile-heading"
          sx={{
            ...panelSx,
            p: { xs: 5, md: 6 },
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  width: 36,
                  height: 36,
                  bgcolor: "background.elevated",
                  borderRadius: 1,
                  color: "secondary.main",
                }}
              >
                <IconUser size={18} aria-hidden />
              </Box>
              <Box>
                <Typography
                  id="profile-heading"
                  component="h2"
                  sx={{ fontSize: 16, fontWeight: 600, lineHeight: "20px" }}
                >
                  Personal profile
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                  Your basic account details and identity
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconClock size={13} color="#94A3B8" aria-hidden />
              <Typography
                sx={{
                  color: "text.disabled",
                  fontFamily: font.mono,
                  fontSize: 11,
                }}
              >
                Joined {memberSince}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "border.default" }} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 4,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography
                sx={{ fontSize: 12, fontWeight: 500, color: "text.secondary" }}
              >
                Full name
              </Typography>
              <TextField
                size="small"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.elevated",
                    fontSize: 13,
                  },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "text.secondary",
                  }}
                >
                  Email address
                </Typography>
                {user.isVerified ? (
                  <Box
                    component="span"
                    sx={{
                      ...badgeSx,
                      bgcolor: "rgba(6, 182, 212, 0.12)",
                      color: "secondary.main",
                      gap: 0.5,
                    }}
                  >
                    <IconCheck size={11} aria-hidden /> Verified
                  </Box>
                ) : (
                  <Box component="span" sx={badgeSx}>
                    Unverified
                  </Box>
                )}
              </Box>
              <TextField
                size="small"
                disabled
                value={email}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.elevated",
                    fontSize: 13,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Account ID row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 3,
              bgcolor: "background.elevated",
              borderRadius: 1,
              border: 1,
              borderColor: "border.default",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography
                sx={{
                  color: "text.disabled",
                  fontSize: 10,
                  letterSpacing: "0.5px",
                }}
              >
                ACCOUNT ID
              </Typography>
              <Typography
                sx={{
                  fontFamily: font.mono,
                  fontSize: 12,
                  color: "text.primary",
                }}
              >
                {user.id}
              </Typography>
            </Box>
            <Tooltip title={copiedId ? "Copied!" : "Copy Account ID"}>
              <IconButton
                size="small"
                onClick={handleCopyId}
                sx={{ color: "text.secondary" }}
              >
                {copiedId ? (
                  <IconCheck size={15} color="#06B6D4" />
                ) : (
                  <IconCopy size={15} />
                )}
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              size="small"
              sx={{
                height: 34,
                px: 3,
                fontSize: 12,
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Save changes
            </Button>
          </Box>
        </Box>

        {/* ── 2. Security & Authentication ────────────────────────────── */}
        <Box
          component="section"
          aria-labelledby="security-heading"
          sx={{
            ...panelSx,
            p: { xs: 5, md: 6 },
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: 36,
                height: 36,
                bgcolor: "background.elevated",
                borderRadius: 1,
                color: "secondary.main",
              }}
            >
              <IconShieldCheck size={18} aria-hidden />
            </Box>
            <Box>
              <Typography
                id="security-heading"
                component="h2"
                sx={{ fontSize: 16, fontWeight: 600, lineHeight: "20px" }}
              >
                Security & password
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                Authentication credentials and login protection
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "border.default" }} />

          {/* Password Item */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconLock size={16} color="#94A3B8" aria-hidden />
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                  Password
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: 11 }}>
                  Set a secure password using argon2id hashing
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              sx={{
                height: 32,
                fontSize: 12,
                textTransform: "none",
                borderColor: "border.strong",
                color: "text.primary",
                "&:hover": {
                  borderColor: "text.secondary",
                  bgcolor: "background.elevated",
                },
              }}
            >
              Change password
            </Button>
          </Box>

          <Divider sx={{ borderColor: "border.default" }} />

          {/* Two-factor authentication Item */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconKey size={16} color="#94A3B8" aria-hidden />
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                    Two-factor authentication (2FA)
                  </Typography>
                  <Chip
                    label="Not enabled"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: 10,
                      bgcolor: "background.elevated",
                      color: "text.disabled",
                    }}
                  />
                </Box>
                <Typography
                  sx={{ color: "text.secondary", fontSize: 11, mt: 0.5 }}
                >
                  Add an extra layer of security using Google Authenticator or
                  1Password
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              sx={{
                height: 32,
                fontSize: 12,
                textTransform: "none",
                borderColor: "border.strong",
                color: "text.primary",
                "&:hover": {
                  borderColor: "text.secondary",
                  bgcolor: "background.elevated",
                },
              }}
            >
              Configure 2FA
            </Button>
          </Box>
        </Box>

        {/* ── 3. Active Sessions ───────────────────────────────────────── */}
        <Box
          component="section"
          aria-labelledby="sessions-heading"
          sx={{
            ...panelSx,
            p: { xs: 5, md: 6 },
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: 36,
                height: 36,
                bgcolor: "background.elevated",
                borderRadius: 1,
                color: "secondary.main",
              }}
            >
              <IconDevices size={18} aria-hidden />
            </Box>
            <Box>
              <Typography
                id="sessions-heading"
                component="h2"
                sx={{ fontSize: 16, fontWeight: 600, lineHeight: "20px" }}
              >
                Active sessions
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                Devices and browsers currently logged into this account
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "border.default" }} />

          {isSessionsLoading && (
            <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
              Loading active sessions…
            </Typography>
          )}
          {isSessionsError && (
            <Alert severity="error">Unable to load active sessions.</Alert>
          )}
          {sessions?.map((session) => (
            <Box
              key={session.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                p: 3,
                bgcolor: "background.elevated",
                borderRadius: 1,
                border: 1,
                borderColor: "border.default",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                <IconDeviceDesktop size={20} color="#06B6D4" aria-hidden />
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                      {session.deviceName ||
                        session.clientType ||
                        "Unknown device"}
                    </Typography>
                    {session.isCurrent && (
                      <Box
                        component="span"
                        sx={{
                          ...badgeSx,
                          bgcolor: "rgba(6, 182, 212, 0.12)",
                          color: "secondary.main",
                        }}
                      >
                        This device
                      </Box>
                    )}
                  </Box>
                  <Typography
                    sx={{
                      color: "text.secondary",
                      fontFamily: font.mono,
                      fontSize: 11,
                      mt: 0.5,
                    }}
                  >
                    {[session.clientType, session.ipAddress]
                      .filter(Boolean)
                      .join(" · ") || "Device details unavailable"}
                    {" · "}Last active{" "}
                    {new Date(session.lastActiveAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              {!session.isCurrent && (
                <Button
                  size="small"
                  color="error"
                  startIcon={<IconTrash size={14} />}
                  disabled={revokeSession.isPending}
                  onClick={() => revokeSession.mutate(session.id)}
                  sx={{ flexShrink: 0, textTransform: "none" }}
                >
                  Revoke
                </Button>
              )}
            </Box>
          ))}
          {sessions?.length === 0 && !isSessionsLoading && !isSessionsError && (
            <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
              No active sessions found.
            </Typography>
          )}
          {(revokeSession.isError || revokeOtherSessions.isError) && (
            <Alert severity="error">
              {revokeSession.error?.message ??
                revokeOtherSessions.error?.message ??
                "Unable to update sessions."}
            </Alert>
          )}
          {sessions && sessions.some((session) => !session.isCurrent) && (
            <Button
              variant="outlined"
              color="error"
              disabled={revokeOtherSessions.isPending}
              onClick={() => revokeOtherSessions.mutate()}
              sx={{ alignSelf: "flex-start", textTransform: "none" }}
            >
              {revokeOtherSessions.isPending
                ? "Revoking sessions…"
                : "Sign out all other sessions"}
            </Button>
          )}
        </Box>

        {/* ── 4. Notifications & Alerts ───────────────────────────────── */}
        <Box
          component="section"
          aria-labelledby="notifications-heading"
          sx={{
            ...panelSx,
            p: { xs: 5, md: 6 },
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: 36,
                height: 36,
                bgcolor: "background.elevated",
                borderRadius: 1,
                color: "secondary.main",
              }}
            >
              <IconBell size={18} aria-hidden />
            </Box>
            <Box>
              <Typography
                id="notifications-heading"
                component="h2"
                sx={{ fontSize: 16, fontWeight: 600, lineHeight: "20px" }}
              >
                Notifications & preferences
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                Control which email communications you receive
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "border.default" }} />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconMail size={16} color="#94A3B8" aria-hidden />
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                  Usage & quota warning emails
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: 11 }}>
                  Receive an alert when approaching 80% and 100% of plan limits
                </Typography>
              </Box>
            </Box>
            <Switch
              size="small"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              color="secondary"
            />
          </Box>

          <Divider sx={{ borderColor: "border.default" }} />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconShieldCheck size={16} color="#94A3B8" aria-hidden />
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                  Security & login alerts
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: 11 }}>
                  Get notified when a new device or IP logs into your account
                </Typography>
              </Box>
            </Box>
            <Switch
              size="small"
              checked={securityAlerts}
              onChange={(e) => setSecurityAlerts(e.target.checked)}
              color="secondary"
            />
          </Box>
        </Box>

        {/* ── 5. Danger Zone ──────────────────────────────────────────── */}
        <Box
          component="section"
          aria-labelledby="danger-heading"
          sx={{
            p: { xs: 5, md: 6 },
            bgcolor: "background.default",
            border: 1,
            borderColor: "rgba(239, 68, 68, 0.35)",
            borderRadius: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: 36,
                height: 36,
                bgcolor: "rgba(239, 68, 68, 0.12)",
                borderRadius: 1,
                color: "error.main",
              }}
            >
              <IconAlertTriangle size={18} aria-hidden />
            </Box>
            <Box>
              <Typography
                id="danger-heading"
                component="h2"
                sx={{ fontSize: 16, fontWeight: 600, color: "error.main" }}
              >
                Danger zone
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                Irreversible actions for your personal account
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "rgba(239, 68, 68, 0.15)" }} />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 3,
            }}
          >
            <Box sx={{ maxWidth: 520 }}>
              <Typography
                sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}
              >
                Delete this account
              </Typography>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: 12,
                  mt: 0.5,
                  lineHeight: 1.6,
                }}
              >
                Permanently remove your account, active subscriptions, and all
                associated projects, databases, storage buckets, and API keys.
                This cannot be undone.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<IconTrash size={14} />}
              sx={{
                height: 34,
                fontSize: 12,
                fontWeight: 600,
                textTransform: "none",
                borderColor: "error.main",
                "&:hover": { bgcolor: "rgba(239, 68, 68, 0.08)" },
              }}
            >
              Delete account
            </Button>
          </Box>
        </Box>
      </Box>
    </AccountShell>
  );
}
