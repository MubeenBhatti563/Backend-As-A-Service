import { Box, Typography } from "@mui/material";
import { cardTitleSx, MOBILE, panelSx } from "../styles";
import type { ChartSeries } from "../types";

const PLOT_HEIGHT = 160;
const PLOT_HEIGHT_MOBILE = 100;

/** A 7-column bar chart. Each label sits under its own bar. */
export function BarChartCard({ title, mobileTitle, unit, color, points, hideOnMobile }: ChartSeries) {
  const max = Math.max(...points.map((p) => p.value), 1);
  const summary = `${title}: ${points.map((p) => `${p.label} ${p.value}`).join(", ")} ${unit}`;

  return (
    <Box
      component="figure"
      sx={{
        ...panelSx,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        m: 0,
        p: "23px",
        minWidth: 0,
        [MOBILE]: { gap: 3, p: "15px", ...(hideOnMobile && { display: "none" }) },
      }}
    >
      <Typography
        component="figcaption"
        sx={{
          ...cardTitleSx,
          [MOBILE]: { color: "text.secondary", fontFamily: "inherit", fontSize: 12, lineHeight: "16px" },
        }}
      >
        <Box component="span" sx={{ [MOBILE]: mobileTitle ? { display: "none" } : {} }}>{title}</Box>
        {mobileTitle && <Box component="span" sx={{ display: "none", [MOBILE]: { display: "inline" } }}>{mobileTitle}</Box>}
      </Typography>

      <Box role="img" aria-label={summary} sx={{ display: "flex", flexDirection: "column", gap: 4, [MOBILE]: { gap: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "flex-end", height: PLOT_HEIGHT, [MOBILE]: { height: PLOT_HEIGHT_MOBILE } }}>
          {points.map((p) => (
            <Box key={p.label} sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-end", height: "100%" }}>
              <Box
                title={`${p.label}: ${p.value} ${unit}`}
                sx={{
                  width: 32,
                  height: `${(p.value / max) * 100}%`,
                  minHeight: 2,
                  bgcolor: `${color}.main`,
                  borderRadius: "4px 4px 0 0",
                  [MOBILE]: { width: 20, borderRadius: "3px 3px 0 0" },
                }}
              />
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "flex" }}>
          {points.map((p) => (
            <Typography key={p.label} component="span" sx={{ flex: 1, textAlign: "center", color: "text.disabled", fontSize: 12, lineHeight: "16px", [MOBILE]: { fontSize: 10, lineHeight: "13px" } }}>
              <Box component="span" sx={{ [MOBILE]: { display: "none" } }}>{p.label}</Box>
              <Box component="span" sx={{ display: "none", [MOBILE]: { display: "inline" } }}>{p.label.charAt(0)}</Box>
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
