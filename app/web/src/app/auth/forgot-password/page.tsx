import { ForgotPasswordForm } from "@/features/auth/components/ForgotPassword";
import { TerminalPane } from "@/features/auth/components/TerminalPane";
import { Box } from "@mui/material";
import React from "react";

const ForgotPasswordPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        minHeight: "100dvh",
        width: "100%",
        backgroundColor: "background.input",
      }}
    >
      {/* Left: Terminal pane */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: "2 1 0%",
          minWidth: 0,
        }}
      >
        <TerminalPane />
      </Box>

      {/* Right: Login form */}
      <Box
        sx={{
          flex: { xs: 1, md: 3 },
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          py: { xs: 3, md: 4 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 450 }}>
          <ForgotPasswordForm />
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
