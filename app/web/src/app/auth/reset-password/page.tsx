import { ResetPasswordForm } from "@/features/auth/components/ResetPassword";
import { TerminalPane } from "@/features/auth/components/TerminalPane";
import { Box, CircularProgress } from "@mui/material";
import React, { Suspense } from "react";

const ResetPasswordPage = () => {
  return (
    <Box
      component="main"
      sx={{
        display: "flex",
        height: "100dvh",
        overflow: "hidden",
        width: "100%",
        bgcolor: "background.input",
      }}
    >
      {/* Left: stays put */}
      <TerminalPane />

      {/* Right: the only scrolling area */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          py: { xs: 3, md: 4 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 480, m: "auto" }}>
          <Suspense
            fallback={
              <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;
