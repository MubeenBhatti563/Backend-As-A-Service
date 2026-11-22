"use client";

import { Alert, Box, Button, Paper, Typography } from "@mui/material";
import { IconDatabaseOff, IconRefresh } from "@tabler/icons-react";

export default function DatabaseTablesError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const apiUnavailable = /could not be reached|failed to fetch|fetch failed/i.test(error.message);
  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: 360, px: 2 }}>
      <Paper
        sx={{
          width: "100%",
          maxWidth: 520,
          p: { xs: 3, sm: 4 },
          border: "1px solid",
          borderColor: "border.default",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <IconDatabaseOff size={22} color="#94A3B8" aria-hidden />
          <Typography variant="h6" component="h1" sx={{ fontWeight: 700 }}>
            {apiUnavailable ? "Database API unavailable" : "Could not load database data"}
          </Typography>
        </Box>
        <Alert severity={apiUnavailable ? "warning" : "error"} sx={{ mb: 2.5 }}>
          {apiUnavailable
            ? "The dashboard could not reach the database API. Make sure the API server is running, then try again."
            : "The database request failed. Retry the request; if the problem continues, check the API server logs."}
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
          In local development, start it with <Box component="code" sx={{ color: "text.primary" }}>pnpm dev:api</Box>. If it is already running, check its terminal for startup errors.
        </Typography>
        <Button onClick={reset} variant="contained" startIcon={<IconRefresh size={17} />}>
          Try again
        </Button>
      </Paper>
    </Box>
  );
}
