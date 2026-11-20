import { Box } from "@mui/material";
import { BELOW_1100, MOBILE } from "../styles";
import type { ChartSeries } from "../types";
import { BarChartCard } from "./BarChartCard";

export function ChartsRow({ charts }: { charts: ChartSeries[] }) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 5,
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        [BELOW_1100]: { gridTemplateColumns: "minmax(0, 1fr)" },
        [MOBILE]: { gap: 4 },
      }}
    >
      {charts.map((c) => (
        <BarChartCard key={c.title} {...c} />
      ))}
    </Box>
  );
}
