"use client";

import { Alert, Box, Button, Paper, Typography } from "@mui/material";
import { IconDatabaseOff, IconRefresh } from "@tabler/icons-react";

export default function DatabaseIndexesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: 360, px: 2 }}>
      <Paper sx={{ width: "100%", maxWidth: 520, p: { xs: 3, sm: 4 }, border: "1px solid", borderColor: "border.default", bgcolor: "background.paper" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <IconDatabaseOff size={22} color="#94A3B8" aria-hidden />
          <Typography variant="h6" component="h1" sx={{ fontWeight: 700 }}>Could not load indexes</Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 2.5 }}>
          The index request failed. Retry, and check the API logs if the problem continues.
        </Alert>
        <Button onClick={reset} variant="contained" startIcon={<IconRefresh size={17} />}>Try again</Button>
      </Paper>
    </Box>
  );
}
