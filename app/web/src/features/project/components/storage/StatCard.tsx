import { Box, Typography } from "@mui/material";
import { TagChip } from "../shared/TagChip";
import type { StorageStat } from "./types";

export function StatCard({ stat }: { stat: StorageStat }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        flex: 1,
        minWidth: { xs: "100%", sm: 180 },
        p: 4,
        bgcolor: "background.default",
        border: 1,
        borderColor: "border.default",
        borderRadius: 1.5,
      }}
    >
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 600,
          color: "text.secondary",
          textTransform: "uppercase",
        }}
      >
        {stat.label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Typography component="p" sx={{ fontSize: 23, fontWeight: 700 }}>
          {stat.value}
        </Typography>
        {stat.indicator && (
          <TagChip label={stat.indicator} tint="warning" color="warning.main" px={1.5} />
        )}
      </Box>
    </Box>
  );
}
