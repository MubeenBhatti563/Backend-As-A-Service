"use client";

import { Tab, Tabs } from "@mui/material";

interface Props<T extends string> {
  items: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: "md" | "sm";
}

export function UnderlineTabs<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  size = "md",
}: Props<T>) {
  const small = size === "sm";
  return (
    <Tabs
      value={value}
      onChange={(_, next: T) => onChange(next)}
      aria-label={ariaLabel}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        minHeight: small ? 28 : 38,
        borderBottom: 1,
        borderColor: "border.default",
        "& .MuiTabs-flexContainer": { gap: small ? 1 : 2 },
        "& .MuiTab-root": {
          minHeight: small ? 28 : 38,
          minWidth: 0,
          px: small ? 3 : 4,
          py: small ? 1.5 : 2.5,
          fontSize: small ? 12 : 14,
          lineHeight: small ? "16px" : "18px",
          fontWeight: 400,
          color: "text.secondary",
          whiteSpace: "nowrap",
        },
        "& .MuiTab-root.Mui-selected": {
          color: "text.primary",
          fontWeight: 600,
        },
      }}
    >
      {items.map((item) => (
        <Tab
          key={item.value}
          value={item.value}
          label={item.label}
          disableRipple
        />
      ))}
    </Tabs>
  );
}
