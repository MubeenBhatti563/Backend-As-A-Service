import { SignupForm } from "@/features/auth/components/RegisterPage";
import { TerminalPane } from "@/features/auth/components/TerminalPane";
import { Box } from "@mui/material";
import React from "react";

const RegisterPage = () => (
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
        <SignupForm />
      </Box>
    </Box>
  </Box>
);

export default RegisterPage;
