import { Chip } from "@mui/material";

export function Badge({ label }: { label: string }) {
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 22,
        bgcolor: "statusBackground.primary",
        color: "secondary.main",
        border: 1,
        borderColor: "primary.main",
        typography: "overline",
        letterSpacing: ".03em",
        "& .MuiChip-label": { px: 2.5 },
      }}
    />
  );
}
