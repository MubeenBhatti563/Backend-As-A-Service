import { Box } from "@mui/material";
import { BELOW_1280, MOBILE } from "../styles";
import type { StatMetric } from "../types";
import { StatCard } from "./StatCard";

export function StatsRow({ stats }: { stats: StatMetric[] }) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 4,
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        [BELOW_1280]: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
        [MOBILE]: { gridTemplateColumns: "minmax(0, 1fr)", gap: "10px" },
      }}
    >
      {stats.map(({ key, ...metric }) => (
        <StatCard key={key} {...metric} />
      ))}
    </Box>
  );
}
