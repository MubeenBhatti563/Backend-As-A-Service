import { Box, Link, Typography } from "@mui/material";
import { FOOTER_COLUMNS, SITE, SOCIAL_LINKS } from "@/constants/homePage";
import { SECTION_IDS } from "@/config/routes";
import { fontFamily, mq, pageGutter, SURFACE } from "@/theme/tokens";
import { Brand } from "../common";

export function Footer() {
  return (
    <Box
      component="footer"
      id={SECTION_IDS.footer}
      sx={{
        pt: 17.5,
        pb: 7,
        ...pageGutter,
        bgcolor: SURFACE.panel,
        borderTop: 1,
        borderColor: "border.default",
        [mq.mobile]: { pt: 12, pb: 6 },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "2fr repeat(4, 1fr)",
          gap: 8.5,
          maxWidth: 1280,
          mx: "auto",
          mb: 12.5,
          [mq.tablet]: { gridTemplateColumns: "1.5fr repeat(4, 1fr)", gap: 5 },
          [mq.mobile]: {
            gridTemplateColumns: "repeat(2, 1fr)",
            rowGap: 7.5,
            columnGap: 5,
            mb: 8,
          },
        }}
      >
        <Box sx={{ maxWidth: 285, [mq.mobile]: { gridColumn: "1 / -1" } }}>
          <Brand size="sm" />
          <Typography
            color="textSecondary"
            sx={{ mt: 3.5, fontSize: 12, lineHeight: 1.65 }}
          >
            {SITE.footerTagline}
          </Typography>
        </Box>

        {FOOTER_COLUMNS.map(({ heading, links }) => (
          <Box
            component="nav"
            key={heading}
            aria-label={heading}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 2.75,
              [mq.mobile]: { gap: 2.25 },
            }}
          >
            <Typography
              variant="overline"
              component="h3"
              sx={{
                mb: 0.75,
                color: "common.white",
                fontSize: 10,
                letterSpacing: ".06em",
                lineHeight: 1.4,
              }}
            >
              {heading}
            </Typography>
            {links.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                underline="none"
                sx={{
                  color: "text.secondary",
                  fontSize: 12,
                  transition: "color .18s ease",
                  "&:hover": { color: "common.white" },
                }}
              >
                {label}
              </Link>
            ))}
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 5,
          maxWidth: 1280,
          mx: "auto",
          pt: 5.5,
          borderTop: 1,
          borderColor: "border.default",
          [mq.mobile]: {
            flexDirection: "column",
            alignItems: "flex-start",
            pt: 4.5,
          },
        }}
      >
        <Typography
          color="textDisabled"
          variant="body2"
          sx={{ lineHeight: 1.6, fontFamily: fontFamily.body }}
        >
          {SITE.copyright}
        </Typography>
        <Box sx={{ display: "flex", gap: 3.75 }}>
          {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              aria-label={label}
              sx={{
                display: "inline-flex",
                color: "text.disabled",
                "&:hover": { color: "common.white" },
              }}
            >
              <Icon size={17} aria-hidden />
            </Link>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
