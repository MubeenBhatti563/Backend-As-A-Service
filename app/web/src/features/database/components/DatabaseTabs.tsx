"use client";

import { useRouter } from "next/navigation";
import { Tab, Tabs } from "@mui/material";
import { projectDatabaseBase } from "../constants";
import type { DatabaseTabValue } from "../types";

const TABS: { value: DatabaseTabValue; label: string; path: string }[] = [
  { value: "tables", label: "Tables", path: "" },
  { value: "sql-editor", label: "SQL Editor", path: "/sql-editor" },
  { value: "relationships", label: "Relationships", path: "/relationships" },
  { value: "indexes", label: "Indexes", path: "/indexes" },
];

interface Props {
  projectId: string;
  value: DatabaseTabValue;
}

export function DatabaseTabs({ projectId, value }: Props) {
  const router = useRouter();

  return (
    <Tabs
      value={value}
      onChange={(_, newValue) => {
        const target = TABS.find((t) => t.value === newValue);
        if (target) {
          router.push(`${projectDatabaseBase(projectId)}${target.path}`);
        }
      }}
      aria-label="Database sections"
      sx={{
        minHeight: 38,
        borderBottom: 1,
        borderColor: "divider",
        "& .MuiTabs-flexContainer": { gap: 2 },
        "& .MuiTabs-indicator": { height: 2, backgroundColor: "primary.main" },
      }}
    >
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={tab.label}
          disableRipple
          sx={{
            minHeight: 38,
            minWidth: 0,
            px: 4,
            py: "10px",
            fontSize: 14,
            lineHeight: "18px",
            fontWeight: 400,
            color: "text.secondary",
            "&.Mui-selected": { color: "text.primary", fontWeight: 600 },
          }}
        />
      ))}
    </Tabs>
  );
}
