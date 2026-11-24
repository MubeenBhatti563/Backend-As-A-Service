"use client";
import { Box, Typography } from "@mui/material";
import { cardTitleSx, MOBILE, panelSx } from "../styles";
import type { HealthStatus, ServiceHealth } from "../types";

const STATUS: Record<
  HealthStatus,
  { label: string; color: "success" | "warning" | "error" }
> = {
  operational: { label: "Operational", color: "success" },
  degraded: { label: "Degraded", color: "warning" },
  down: { label: "Down", color: "error" },
};

export function SystemHealthCard({ services }: { services: ServiceHealth[] }) {
  return (
    <Box
      component="section"
      aria-labelledby="system-health-title"
      sx={{
        ...panelSx,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        p: "23px",
        minWidth: 0,
        [MOBILE]: { display: "none" },
      }}
    >
      <Typography id="system-health-title" component="h2" sx={cardTitleSx}>
        System Operational Health
      </Typography>
      <Box
        component="ul"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          m: 0,
          p: 0,
          listStyle: "none",
        }}
      >
        {services.length === 0 ? <Typography sx={{ color: "text.secondary", fontSize: 12 }}>Service health telemetry is not available.</Typography> : services.map((s) => {
          const st = STATUS[s.status];
          return (
            <Box
              key={s.id}
              component="li"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                p: 3,
                bgcolor: "background.elevated",
                borderRadius: 1,
              }}
            >
              <Typography
                sx={{ fontSize: 14, fontWeight: 600, lineHeight: "18px" }}
              >
                {s.name}
              </Typography>
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 1,
                  bgcolor: (t) => t.palette.statusBackground[st.color],
                  borderRadius: 0.5,
                  color: `${st.color}.main`,
                  fontSize: 12,
                  fontWeight: 700,
                  lineHeight: "16px",
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "99px",
                    bgcolor: "currentColor",
                  }}
                />
                {st.label}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
