"use client";

import { useRouter } from "next/navigation";
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
}

export function SectionTabs<T extends string>({ tabs, value, ariaLabel }: Props<T>) {
  const router = useRouter();

  return (
    <Tabs
      value={value}
      onChange={(_, newValue: T) => {
        const target = tabs.find((t) => t.value === newValue);
        if (target) {
          router.push(target.href);
        }
      }}
      aria-label={ariaLabel}
      sx={{
        minHeight: 38,
        borderBottom: 1,
        borderColor: "divider",
        "& .MuiTabs-flexContainer": { gap: 2 },
        "& .MuiTabs-indicator": { height: 2, backgroundColor: "primary.main" },
      }}
    >
      {tabs.map((tab) => (
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
