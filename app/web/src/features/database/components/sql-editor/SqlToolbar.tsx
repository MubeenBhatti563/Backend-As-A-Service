"use client";

import { Button, CircularProgress, Stack } from "@mui/material";
import { IconPlayerPlay } from "@tabler/icons-react";
import { toolbarButtonSx } from "./toolbarStyles";

interface Props {
  onRun: () => void;
  onClear: () => void;
  onFormat?: () => void;
  onSave?: () => void;
  runDisabled?: boolean;
  running?: boolean;
}

export function SqlToolbar({
  onRun,
  onClear,
  onFormat,
  onSave,
  runDisabled = false,
  running = false,
}: Props) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      useFlexGap
      sx={{
        justifyContent: "space-between",
        alignItems: { xs: "stretch", sm: "center" },
        pb: 2,
      }}
    >
      <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap" }}>
        <Button
          variant="contained"
          color="success"
          startIcon={
            running ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <IconPlayerPlay size={14} />
            )
          }
          onClick={onRun}
          disabled={runDisabled || running}
          sx={{
            ...toolbarButtonSx,
            px: 4,
            fontWeight: 600,
            color: "text.primary",
            bgcolor: "success.main",
            "&:hover": { bgcolor: "success.dark" },
          }}
        >
          {running ? "Running…" : "Run Query"}
        </Button>
        {onFormat && (
          <Button variant="outlined" onClick={onFormat} sx={toolbarButtonSx}>
            Format SQL
          </Button>
        )}
      </Stack>
      <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap" }}>
        {onSave && (
          <Button variant="outlined" onClick={onSave} sx={toolbarButtonSx}>
            Save Query
          </Button>
        )}
        <Button
          variant="outlined"
          onClick={onClear}
          sx={{ ...toolbarButtonSx, color: "error.main" }}
        >
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}

