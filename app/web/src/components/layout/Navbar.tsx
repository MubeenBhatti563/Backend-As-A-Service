import { Box, Link } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { IconArrowRight } from "@tabler/icons-react";
import { NAV_LINKS } from "@/constants/homePage";
import { ROUTES } from "../../config/routes";
import { mq, NAV_HEIGHT, pageGutter } from "../../theme/tokens";
import { Brand, CtaButton } from "../common";

const navLinkSx = {
  color: "text.secondary",
  fontSize: 14,
  fontWeight: 500,
  transition: "color .18s ease",
  "&:hover": { color: "common.white" },
} as const;

export function Navbar() {
  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: (t) => t.zIndex.appBar,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: NAV_HEIGHT.desktop,
        ...pageGutter,
        borderBottom: 1,
        borderColor: "border.default",
        bgcolor: (t) => alpha(t.palette.background.input, 0.94),
        backdropFilter: "blur(14px)",
        [mq.mobile]: { height: NAV_HEIGHT.mobile },
      }}
    >
      <Brand />

      <Box
        component="nav"
        aria-label="Primary"
        sx={{
          display: "flex",
          gap: 8,
          [mq.tablet]: { gap: 4.25 },
          [mq.mobile]: { display: "none" },
        }}
      >
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            underline="none"
            sx={{ ...navLinkSx, [mq.tablet]: { fontSize: 12 } }}
          >
            {label}
          </Link>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          [mq.mobile]: { gap: 2.25 },
        }}
      >
        <Link
          href={ROUTES.signIn}
          underline="none"
          sx={{
            ...navLinkSx,
            [mq.mobile]: { fontSize: 12 },
            [mq.narrow]: { display: "none" },
          }}
        >
          Sign In
        </Link>
        <CtaButton
          href={ROUTES.deployFree}
          compact
          endIcon={<IconArrowRight size={16} aria-hidden />}
        >
          Deploy Free
        </CtaButton>
      </Box>
    </Box>
  );
}
