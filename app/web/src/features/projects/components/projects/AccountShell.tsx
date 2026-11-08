"use client";
import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { AccountSidebar, type AccountNavKey } from "./AccountSidebar";
import { AccountTopBar } from "./AccountTopBar";
import { SafeUser } from "@baas/types";

interface AccountShellProps {
  user: SafeUser;
  projectCount: number;
  activeNav?: AccountNavKey;
  plan?: string;
  tier?: string;
  children: ReactNode;
}

/** Top bar + left navigation are fixed; only the content area scrolls. */
export function AccountShell({
  user,
  projectCount,
  activeNav = "projects",
  plan = "Developer",
  tier = "Free",
  children,
}: AccountShellProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        bgcolor: "background.input",
      }}
    >
      <AccountTopBar
        fullName={user?.fullName || "Admin"}
        email={user?.email || "admin@devstack.com"}
      />
      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        <AccountSidebar
          accountName={user?.fullName}
          plan={plan}
          tier={tier}
          activeKey={activeNav}
          projectCount={projectCount}
        />
        <Box
          component="main"
          sx={{ flex: 1, minWidth: 0, overflowY: "auto", p: { xs: 4, md: 8 } }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 7,
              width: "100%",
              maxWidth: 1280,
              mx: "auto",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
