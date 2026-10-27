import { LoginForm } from "@/features/auth/components/LoginPage";
import { TerminalPane } from "@/features/auth/components/TerminalPane";
import { Box } from "@mui/material";

const LoginPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100dvh",
        width: "100%",
        backgroundColor: "background.input",
      }}
    >
      {/* Left: Terminal */}
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
          flex: { xs: "1 1 100%", md: "3 1 0%" },
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 4, md: 4, lg: 6 },
          py: { xs: 3, md: 4 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 450 }}>
          <LoginForm />
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
