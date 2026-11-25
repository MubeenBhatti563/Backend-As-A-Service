"use client";

import NextLink from "next/link";
import { Tab, Tabs } from "@mui/material";

export interface SectionTab<T extends string> {
  value: T;
  label: string;
  href: string;
}

interface Props<T extends string> {
  tabs: SectionTab<T>[];
  value: T;
  ariaLabel: string;
  /** Compact style used on the Relationships screen: no side padding, 24px gaps, 500/600 weights. */
  dense?: boolean;
}

export function SectionTabs<T extends string>({ tabs, value, ariaLabel, dense = false }: Props<T>) {
  return (
    <Tabs
      value={value}
      aria-label={ariaLabel}
      sx={{
        minHeight: dense ? 31 : 38,
        borderBottom: 1,
        borderColor: "divider",
        "& .MuiTabs-flexContainer": { gap: dense ? 6 : 2 },
        "& .MuiTabs-indicator": { height: 2, backgroundColor: "primary.main" },
      }}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.value}
          component={NextLink}
          href={tab.href}
          value={tab.value}
          label={tab.label}
          disableRipple
          sx={{
            minHeight: dense ? 30 : 38,
            minWidth: 0,
            px: dense ? 0 : 4,
            pt: dense ? 0 : "10px",
            pb: dense ? "12px" : "10px",
            fontSize: 14,
            lineHeight: "18px",
            fontWeight: dense ? 500 : 400,
            color: "text.secondary",
            textDecoration: "none",
            "&:hover": { color: "text.primary" },
            "&.Mui-selected": { color: "text.primary", fontWeight: 600 },
          }}
        />
      ))}
    </Tabs>
  );
}
