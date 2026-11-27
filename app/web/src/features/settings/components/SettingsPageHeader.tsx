import { Stack, Typography } from "@mui/material";

interface Props {
  title: string;
  description: string;
}

export function SettingsPageHeader({ title, description }: Props) {
  return (
    <Stack spacing={1} useFlexGap sx={{ minWidth: 0 }}>
      <Typography
        variant="h5"
        component="h1"
        sx={{ lineHeight: { xs: 1.2, sm: "30px" }, overflowWrap: "anywhere" }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          lineHeight: 1.5,
          color: "text.secondary",
          overflowWrap: "anywhere",
        }}
      >
        {description}
      </Typography>
    </Stack>
  );
}
