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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 3,
        }}
      >
        <OutlinedInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter tables…"
          inputProps={{ "aria-label": "Filter tables" }}
          startAdornment={
            <InputAdornment
              position="start"
              sx={{ mr: 2, color: "text.secondary" }}
            >
              <IconSearch size={16} />
            </InputAdornment>
          }
          sx={{
            width: { xs: "100%", sm: 320 },
            px: 3,
            bgcolor: SURFACE,
            borderRadius: "6px",
            "& .MuiOutlinedInput-input": {
              p: "8px 0",
              fontSize: 13,
              lineHeight: "17px",
            },
          }}
        />

        <Button
          variant="contained"
          startIcon={<IconPlus size={16} />}
          sx={{
            minHeight: 37,
            px: 4,
            py: "10px",
            borderRadius: "6px",
            fontSize: 13,
            lineHeight: "17px",
          }}
        >
          Create Table
        </Button>
      </Box>

      <TablesGrid projectId={projectId} tables={filtered} query={query} />
    </Box>
  );
}
