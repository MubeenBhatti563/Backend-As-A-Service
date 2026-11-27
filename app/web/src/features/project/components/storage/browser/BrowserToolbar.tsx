"use client";

import { Box, ButtonBase, InputBase } from "@mui/material";
import { IconLayoutGrid, IconList, IconSearch } from "@tabler/icons-react";
import type { BrowserViewMode } from "./types";

export function BrowserToolbar({
  bucketName,
  search,
  onSearchChange,
  view,
  onViewChange,
}: {
  bucketName: string;
  search: string;
  onSearchChange: (value: string) => void;
  view: BrowserViewMode;
  onViewChange: (view: BrowserViewMode) => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        gap: 2,
        p: 2,
        bgcolor: "background.default",
        border: 1,
        borderColor: "border.default",
        borderRadius: 1.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          width: { xs: "100%", sm: 320 },
          minWidth: 0,
          px: 2,
          py: 1,
          bgcolor: "background.input",
          border: 1,
          borderColor: "border.default",
          borderRadius: 1,
          "&:focus-within": { borderColor: "primary.main" },
        }}
      >
        <IconSearch size={15} aria-hidden="true" />
        <InputBase
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={`Search files in ${bucketName}`}
          inputProps={{ "aria-label": `Search sample files in ${bucketName}` }}
          sx={{ flex: 1, minWidth: 0, fontSize: 12 }}
        />
      </Box>
      <Box role="group" aria-label="File view mode" sx={{ display: "flex", gap: 1 }}>
        {(
          [
            { value: "list", label: "List view", Icon: IconList },
            { value: "grid", label: "Grid view", Icon: IconLayoutGrid },
          ] as const
        ).map(({ value, label, Icon }) => (
          <ButtonBase
            key={value}
            aria-label={label}
            aria-pressed={view === value}
            onClick={() => onViewChange(value)}
            sx={{
              display: "grid",
              placeItems: "center",
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: view === value ? "background.elevated" : "transparent",
              color: view === value ? "text.primary" : "text.secondary",
              "&:hover": { color: "text.primary" },
              "&.Mui-focusVisible": { outline: "2px solid", outlineColor: "primary.main" },
            }}
          >
            <Icon size={16} />
          </ButtonBase>
        ))}
      </Box>
    </Box>
  );
}
