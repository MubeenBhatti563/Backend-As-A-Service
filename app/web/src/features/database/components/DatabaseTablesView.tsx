"use client";

import { useMemo, useState } from "react";
import { Box, Button, InputAdornment, OutlinedInput } from "@mui/material";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { SURFACE } from "../constants";
import type { DatabaseTable } from "../types";
import { TablesGrid } from "./TablesGrid";

interface Props {
  projectId: string;
  tables: DatabaseTable[];
}

export function DatabaseTablesView({ projectId, tables }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? tables.filter((t) => t.name.toLowerCase().includes(q)) : tables;
  }, [tables, query]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
        }}
      >
        <OutlinedInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter tables…"
          size="small"
          inputProps={{ "aria-label": "Filter tables" }}
          startAdornment={
            <InputAdornment
              position="start"
              sx={{ color: "text.secondary", ml: 0.5, mr: 1 }}
            >
              <IconSearch size={16} />
            </InputAdornment>
          }
          sx={{
            width: { xs: "100%", sm: 320 },
            height: 38,
            bgcolor: SURFACE,
            borderRadius: "6px",
            fontSize: 13,
            "& fieldset": { borderColor: "border.default" },
            "&:hover fieldset": { borderColor: "border.strong" },
            "&.Mui-focused fieldset": { borderColor: "primary.main" },
          }}
        />

        <Button
          variant="contained"
          startIcon={<IconPlus size={16} />}
          sx={{
            height: 38,
            px: 3,
            borderRadius: "6px",
            fontSize: 13,
            fontWeight: 600,
            textTransform: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Create Table
        </Button>
      </Box>

      <TablesGrid projectId={projectId} tables={filtered} query={query} />
    </Box>
  );
}
