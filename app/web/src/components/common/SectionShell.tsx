import { Box } from "@mui/material";
import type { ReactNode } from "react";
import type { SectionId } from "@/config/routes";
import {
  mq,
  NAV_HEIGHT,
  SURFACE,
  sectionGutter,
  type Surface,
} from "@/theme/tokens";
import { SectionHeader, type SectionHeaderProps } from "./SectionHeader";

interface SectionShellProps {
  id?: SectionId;
  surface: Surface;
  /** top + bottom hairline */
  bordered?: boolean;
  /** gap between header and content, in theme.spacing units (4px) */
  gap?: number;
  header?: SectionHeaderProps;
  children: ReactNode;
}

/** Full-width section: background, padding, anchor offset and optional header. */
export function SectionShell({
  id,
  surface,
  bordered,
  gap = 14,
  header,
  children,
}: SectionShellProps) {
  return (
    <Box
      component="section"
      id={id}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        gap,
        py: 24,
        ...sectionGutter,
        bgcolor: SURFACE[surface],
        scrollMarginTop: NAV_HEIGHT.desktop,
        ...(bordered && {
          borderTop: 1,
          borderBottom: 1,
          borderColor: "border.default",
        }),
        [mq.mobile]: { gap: 8.75, py: 17, scrollMarginTop: NAV_HEIGHT.mobile },
      }}
    >
      {header && <SectionHeader {...header} />}
      {children}
    </Box>
  );
}
