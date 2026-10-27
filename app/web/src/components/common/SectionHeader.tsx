import { Box, Typography } from "@mui/material";
import { mq } from "@/theme/tokens";
import { Badge } from "./Badge";

export interface SectionHeaderProps {
  label: string;
  title: string;
  text: string;
}

export function SectionHeader({ label, title, text }: SectionHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        width: "100%",
        textAlign: "center",
        [mq.mobile]: { gap: 3.25 },
      }}
    >
      <Badge label={label} />
      <Typography
        variant="h2"
        component="h2"
        sx={{
          fontSize: "clamp(30px, 3.2vw, 40px)",
          letterSpacing: "-.5px",
          [mq.mobile]: { fontSize: 30 },
        }}
      >
        {title}
      </Typography>
      <Typography
        color="text.secondary"
        sx={{
          maxWidth: 720,
          fontSize: 16,
          lineHeight: 1.6,
          [mq.mobile]: { fontSize: 14 },
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
