import { Box } from "@mui/material";
import type { BoxProps } from "@mui/material";
import { SURFACE, type Surface } from "@/theme/tokens";

interface PanelProps extends Omit<BoxProps, "bgcolor"> {
  surface?: Surface;
  /** multiples of theme.shape.borderRadius (8px): 1 = 8px, 1.5 = 12px */
  radius?: number;
  outline?: "default" | "primary";
}

/** Bordered, rounded surface – the building block of every card on the page. */
export function Panel({
  surface = "panel",
  radius = 1,
  outline = "default",
  sx,
  ...rest
}: PanelProps) {
  return (
    <Box
      {...rest}
      sx={[
        {
          border: 1,
          borderColor:
            outline === "primary" ? "primary.main" : "border.default",
          borderRadius: radius,
          bgcolor: SURFACE[surface],
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}
