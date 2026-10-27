import { Box, Typography } from "@mui/material";
import { TRUSTED_COMPANIES, TRUSTED_LABEL } from "@/constants/homePage";
import { fontFamily, monoLabel, mq, pageGutter, SURFACE } from "@/theme/tokens";

export function TrustedBy() {
  return (
    <Box
      component="section"
      aria-label="Customers"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6.5,
        minHeight: 154,
        py: 7,
        ...pageGutter,
        bgcolor: SURFACE.panel,
        borderTop: 1,
        borderBottom: 1,
        borderColor: "border.default",
        [mq.mobile]: { minHeight: "auto", gap: 4.75, py: 6.25 },
      }}
    >
      <Typography
        component="p"
        color="text.disabled"
        sx={{
          fontSize: 11,
          ...monoLabel,
          fontFamily: fontFamily.mono,
          [mq.mobile]: { fontSize: 9, textAlign: "center" },
        }}
      >
        {TRUSTED_LABEL}
      </Typography>

      <Box
        component="ul"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          width: "min(1280px, 100%)",
          m: 0,
          p: 0,
          listStyle: "none",
          [mq.mobile]: {
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "15px 21px",
          },
        }}
      >
        {TRUSTED_COMPANIES.map(({ name, icon: Icon }) => (
          <Box
            component="li"
            key={name}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              color: "text.disabled",
              fontFamily: fontFamily.display,
              fontSize: 17,
              fontWeight: 700,
              whiteSpace: "nowrap",
              [mq.mobile]: { fontSize: 13, "& svg": { width: 15, height: 15 } },
            }}
          >
            <Icon aria-hidden size={19} />
            {name}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
