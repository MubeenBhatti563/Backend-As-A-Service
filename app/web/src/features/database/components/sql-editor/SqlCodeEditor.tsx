"use client";

import type { ChangeEvent } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { highlightSql } from "./sql-syntax";

interface Props { value: string; onChange: (value: string) => void; schema: string }

const codeSx = { m: 0, p: 0, typography: "code", fontSize: 14, lineHeight: "22px", whiteSpace: "pre-wrap", wordBreak: "break-word" } as const;

export function SqlCodeEditor({ value, onChange, schema }: Props) {
  const lineCount = value.split("\n").length;
  return (
    <Stack spacing={3} useFlexGap sx={{ minHeight: 220, p: { xs: 2.5, sm: 5 }, bgcolor: "background.input", border: "1px solid", borderColor: "border.default", borderRadius: "12px" }}>
      <Stack direction="row" spacing={2} useFlexGap sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <Typography component="div" variant="code" sx={{ fontSize: 11, lineHeight: "14px", color: "text.disabled", textTransform: "uppercase" }}>SQL Workspace</Typography>
        <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center" }}>
          <Box aria-hidden sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "success.main" }} />
          <Typography component="div" variant="code" sx={{ fontSize: 11, lineHeight: "14px", color: "text.secondary" }}>{schema} schema</Typography>
        </Stack>
      </Stack>
      <Box sx={{ position: "relative", flex: 1, minHeight: 120, overflow: "auto" }}>
        <Box component="pre" aria-hidden sx={{ ...codeSx, color: "text.primary", pointerEvents: "none", minHeight: "100%" }}>{highlightSql(value)}{"\n"}</Box>
        <Box component="textarea" value={value} rows={lineCount} spellCheck={false} aria-label="SQL query" onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)} sx={{ ...codeSx, position: "absolute", inset: 0, width: "100%", height: "100%", minHeight: "100%", resize: "none", overflow: "hidden", border: 0, outline: 0, bgcolor: "transparent", color: "transparent", caretColor: (theme) => theme.palette.text.primary }} />
      </Box>
    </Stack>
  );
}
