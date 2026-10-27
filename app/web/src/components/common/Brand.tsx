import { ROUTES } from "@/config/routes";
import { SITE } from "@/constants/homePage";
import { mq } from "@/theme/tokens";
import { Box, Link, Typography } from "@mui/material";
import { IconDatabase } from "@tabler/icons-react";

export function Brand({ size = "md" }: { size?: "lg" | "md" | "sm" }) {
  const sm = size === "sm";
  const lg = size === "lg";

  return (
    <Link
      href={ROUTES.home}
      underline="none"
      aria-label={`${SITE.name} home`}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2.5,
        color: "common.white",
      }}
    >
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          width: sm ? 25 : lg ? 40 : 32,
          height: sm ? 25 : lg ? 40 : 32,
          borderRadius: sm ? 0.625 : 0.75,
          bgcolor: "primary.main",
          [mq.mobile]: sm
            ? {}
            : lg
              ? { width: 40, height: 40 }
              : { width: 29, height: 29 },
        }}
      >
        <IconDatabase size={lg ? 20 : 16} aria-hidden />
      </Box>

      <Typography
        component="span"
        variant="h6"
        sx={{
          fontSize: sm ? 18 : lg ? 24 : 20,
          fontWeight: 800,
          lineHeight: 1,
          [mq.mobile]: {
            fontSize: sm ? 18 : lg ? 24 : 18,
          },
        }}
      >
        {SITE.name}
      </Typography>
    </Link>
  );
}
