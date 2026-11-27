import {
  Box,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  IconArrowsLeftRight,
  IconBolt,
  IconDatabase,
  IconServer,
} from "@tabler/icons-react";
import type { ProjectUsageData } from "@baas/types";
import { OverviewHeader } from "./OverviewHeader";
import { panelSx } from "../styles";

const formatCount = (value: string) => BigInt(value).toLocaleString("en-US");

function formatBytes(value: string) {
  let bytes = BigInt(value);
  if (bytes < BigInt(1024)) return `${bytes.toString()} B`;

  const units = ["KB", "MB", "GB", "TB", "PB"];
  let unitIndex = -1;
  let remainder = BigInt(0);
  while (bytes >= BigInt(1024) && unitIndex < units.length - 1) {
    remainder = bytes % BigInt(1024);
    bytes /= BigInt(1024);
    unitIndex += 1;
  }
  const tenths = (remainder * BigInt(10)) / BigInt(1024);
  return `${bytes.toString()}${tenths ? `.${tenths}` : ""} ${units[unitIndex]}`;
}

function formatPeriod(start: string, endExclusive: string) {
  const startDate = new Date(start);
  const finalDate = new Date(new Date(endExclusive).getTime() - 86_400_000);
  const month = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const day = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    timeZone: "UTC",
  });
  const year = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    timeZone: "UTC",
  });
  return `${month.format(startDate)} ${day.format(startDate)}–${day.format(finalDate)}, ${year.format(finalDate)} (UTC)`;
}

function UsageMeter({
  title,
  used,
  limit,
  icon: Icon,
  format,
  note,
}: {
  title: string;
  used: string;
  limit: string | null;
  icon: typeof IconDatabase;
  format: (value: string) => string;
  note: string;
}) {
  const usedValue = BigInt(used);
  const limitValue = limit === null ? null : BigInt(limit);
  const percent =
    limitValue && limitValue > BigInt(0)
      ? Math.min(100, Number((usedValue * BigInt(10_000)) / limitValue) / 100)
      : null;

  return (
    <Box
      component="section"
      sx={{
        ...panelSx,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: { xs: 4, sm: 5 },
        minWidth: 0,
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Box sx={{ display: "flex", color: "secondary.main" }}>
          <Icon size={18} aria-hidden />
        </Box>
        <Typography component="h2" sx={{ fontSize: 14, fontWeight: 600 }}>
          {title}
        </Typography>
      </Stack>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="p"
          sx={{
            fontSize: { xs: 21, sm: 24 },
            fontWeight: 700,
            overflowWrap: "anywhere",
          }}
        >
          {format(used)}
          <Typography
            component="span"
            sx={{ color: "text.secondary", fontSize: 13, fontWeight: 400 }}
          >
            {limitValue === null
              ? " used · no fixed plan limit"
              : ` of ${format(limit ?? "0")}`}
          </Typography>
        </Typography>
      </Box>
      {percent !== null && (
        <Stack spacing={1}>
          <LinearProgress
            variant="determinate"
            value={percent}
            aria-label={`${title} quota used`}
            aria-valuetext={`${percent}% used`}
            sx={{
              height: 7,
              borderRadius: 99,
              bgcolor: "border.default",
              "& .MuiLinearProgress-bar": { borderRadius: 99 },
            }}
          />
          <Typography
            component="p"
            sx={{ color: "text.secondary", fontSize: 11 }}
          >
            {percent}% of plan limit
          </Typography>
        </Stack>
      )}
      <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
        {note}
      </Typography>
    </Box>
  );
}

function UntrackedMetric({
  title,
  icon: Icon,
  limit,
  format,
  description,
}: {
  title: string;
  icon: typeof IconServer;
  limit: string | number | null;
  format: (value: string) => string;
  description: string;
}) {
  return (
    <Box
      component="section"
      sx={{
        ...panelSx,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: { xs: 4, sm: 5 },
        minWidth: 0,
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Box sx={{ display: "flex", color: "text.secondary" }}>
          <Icon size={18} aria-hidden />
        </Box>
        <Typography component="h2" sx={{ fontSize: 14, fontWeight: 600 }}>
          {title}
        </Typography>
      </Stack>
      <Typography component="p" sx={{ fontSize: 21, fontWeight: 700 }}>
        Not tracked
      </Typography>
      <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
        {description}
      </Typography>
      <Typography sx={{ color: "text.disabled", fontSize: 11 }}>
        Plan allowance:{" "}
        {limit === null ? "Custom" : format(String(limit))}
      </Typography>
    </Box>
  );
}

function DailyRequestsChart({
  data,
  periodStart,
}: {
  data: ProjectUsageData["daily"];
  periodStart: string;
}) {
  const dailyCounts = new Map(
    data.map((record) => [
      record.day.slice(0, 10),
      BigInt(record.apiRequests),
    ]),
  );
  const start = new Date(periodStart);
  const today = new Date();
  const lastDay = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const points: Array<{ day: string; count: bigint }> = [];
  for (const cursor = new Date(start); cursor <= lastDay; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const isoDay = cursor.toISOString().slice(0, 10);
    points.push({
      day: isoDay,
      count: dailyCounts.get(isoDay) ?? BigInt(0),
    });
  }
  const max = points.reduce(
    (largest, point) => (point.count > largest ? point.count : largest),
    BigInt(0),
  );
  const summary = points
    .map(({ day, count }) => `${day}: ${formatCount(count.toString())} requests`)
    .join("; ");

  return (
    <Box
      component="figure"
      sx={{
        ...panelSx,
        m: 0,
        p: { xs: 4, sm: 5 },
        minWidth: 0,
      }}
    >
      <Typography component="figcaption" sx={{ fontSize: 15, fontWeight: 600 }}>
        Daily API requests
      </Typography>
      <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 12 }}>
        Current billing month · missing days represent zero recorded requests
      </Typography>
      {points.length ? (
        <Box sx={{ mt: 4, overflowX: "auto", pb: 1 }}>
          <Box
            role="img"
            aria-label={`Daily API requests for this billing period. ${summary}`}
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${points.length}, minmax(16px, 1fr))`,
              gap: { xs: 1, sm: 1.5 },
              minWidth: points.length > 14 ? `${points.length * 22}px` : "100%",
              height: 180,
              alignItems: "end",
              borderBottom: 1,
              borderColor: "border.default",
            }}
          >
            {points.map(({ day, count }) => {
              const height =
                max === BigInt(0)
                  ? 2
                  : Math.max(Number((count * BigInt(100)) / max), 3);
              return (
                <Box
                  key={day}
                  title={`${day}: ${formatCount(count.toString())} requests`}
                  sx={{
                    height: `${height}%`,
                    minHeight: 2,
                    borderRadius: "4px 4px 0 0",
                    bgcolor:
                      count > BigInt(0) ? "primary.main" : "border.default",
                  }}
                />
              );
            })}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              pt: 1.5,
              color: "text.disabled",
              fontSize: 10,
            }}
          >
            <span>{points[0]?.day.slice(5)}</span>
            {points.length > 7 && (
              <span>{points[Math.floor(points.length / 2)]?.day.slice(5)}</span>
            )}
            <span>{points.at(-1)?.day.slice(5)}</span>
          </Box>
        </Box>
      ) : (
        <Typography sx={{ mt: 4, color: "text.secondary", fontSize: 13 }}>
          No daily request data is available for this period yet.
        </Typography>
      )}
    </Box>
  );
}

export function ProjectUsagePage({ data }: { data: ProjectUsageData }) {
  return (
    <Stack spacing={{ xs: 4, md: 6 }} useFlexGap sx={{ minWidth: 0 }}>
      <OverviewHeader
        title="Usage"
        description={`Resource usage for ${data.project.name}.`}
        badge={`${data.plan.name} plan`}
      />

      <Box
        component="section"
        aria-label="Usage billing period"
        sx={{
          ...panelSx,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          p: { xs: 3, sm: 4 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
            Current billing period
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
            {formatPeriod(data.period.start, data.period.end)}
          </Typography>
        </Box>
        <Typography sx={{ color: "text.secondary", fontSize: 11 }}>
          {data.updatedAt
            ? `Usage data updated ${new Date(data.updatedAt).toLocaleString("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" })} UTC`
            : "Usage data is collected periodically"}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
          gap: { xs: 3, sm: 4 },
          minWidth: 0,
        }}
      >
        <UsageMeter
          title="API requests"
          used={data.usage.apiRequests}
          limit={data.plan.apiRequestsMonthly}
          icon={IconArrowsLeftRight}
          format={formatCount}
          note="Successful project API requests recorded this month."
        />
        <UsageMeter
          title="Database storage"
          used={data.usage.dbBytes}
          limit={data.plan.dbStorageBytes}
          icon={IconDatabase}
          format={formatBytes}
          note="Latest database-size snapshot. Storage is sampled periodically."
        />
        <UntrackedMetric
          title="File storage"
          icon={IconServer}
          limit={data.plan.fileStorageBytes}
          format={formatBytes}
          description="File storage metering is not connected yet, so usage cannot be reported."
        />
        <UntrackedMetric
          title="Realtime connections"
          icon={IconBolt}
          limit={data.plan.maxRealtimeConnections}
          format={formatCount}
          description="Realtime connection telemetry is not available yet."
        />
      </Box>

      <DailyRequestsChart
        data={data.daily}
        periodStart={data.period.start}
      />
    </Stack>
  );
}
