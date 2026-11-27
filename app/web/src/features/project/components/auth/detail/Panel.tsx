import { Box } from "@mui/material";
import type { BoxProps } from "@mui/material";

export function Panel({ sx, children, ...rest }: BoxProps) {
  return (
    <Box
      {...rest}
      sx={[
        {
          display: "flex",
          flexDirection: "column",
          gap: 3,
          minWidth: 0,
          p: { xs: 3, sm: 4 },
          bgcolor: "background.default",
          border: 1,
          borderColor: "border.default",
          borderRadius: 1.5,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}
