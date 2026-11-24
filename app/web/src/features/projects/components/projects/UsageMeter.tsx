"use client";
import { font } from "@/features/projects/components/projectStyle";
import { UsageIconKey, UsageMetric } from "@/types/projectPage";
import { Box, Typography } from "@mui/material";
import {
  IconArrowsLeftRight,
  IconBolt,
  IconDatabase,
  IconServer,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

const ICONS: Record<UsageIconKey, Icon> = {
  database: IconDatabase,
  files: IconServer,
  api: IconArrowsLeftRight,
  realtime: IconBolt,
};

// fixed locale so server and client render the same text
const num = (n: number) => n.toLocaleString("en-US");
const compact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
const withUnit = (n: number, unit?: string) =>
  unit ? `${num(n)} ${unit}` : num(n);

export function UsageMeter({ metric }: { metric: UsageMetric }) {
  const { label, icon, used, limit, unit, basis } = metric;
  const formatValue = (value: number) =>
    metric.key === "api" && value >= 1_000_000 ? compact(value) : withUnit(value, unit);
  const MetricIcon = ICONS[icon];
  const percent =
    limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <MetricIcon size={14} color="#94A3B8" aria-hidden />
          <Typography
            component="span"
            sx={{ fontSize: 12, fontWeight: 500, lineHeight: "16px" }}
          >
            {label}
          </Typography>
        </Box>
        <Typography
          component="span"
          sx={{
            color: "secondary.main",
            fontFamily: font.mono,
            fontSize: 11,
            lineHeight: "14px",
          }}
        >
          {percent}%
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "baseline", gap: "5px" }}>
        <Typography
          component="span"
          sx={{
            fontFamily: font.mono,
            fontSize: 17,
            fontWeight: 600,
            lineHeight: "22px",
          }}
        >
          {formatValue(used)}
        </Typography>
        <Typography
          component="span"
          sx={{
            color: "text.secondary",
            fontFamily: font.mono,
            fontSize: 11,
            lineHeight: "14px",
          }}
        >
          used / {formatValue(limit)}
        </Typography>
      </Box>

      <Box
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        sx={{
          height: 5,
          bgcolor: "border.default",
          borderRadius: "99px",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${percent}%`,
            height: "100%",
            bgcolor: "primary.main",
            borderRadius: "99px",
          }}
        />
      </Box>

      <Typography
        sx={{ color: "text.secondary", fontSize: 11, lineHeight: "14px" }}
      >
        {formatValue(Math.max(limit - used, 0))} remaining
      </Typography>
      {basis && (
        <Typography
          sx={{ color: "text.disabled", fontSize: 10, lineHeight: "13px" }}
        >
          {basis}
        </Typography>
      )}
    </Box>
  );
}
