// Shared style fragments for the project dashboard. theme.spacing = 4px, so sx spacing units are px / 4.
export const font = {
  display: 'var(--font-outfit), Outfit, sans-serif',
  mono: 'var(--font-geist-mono), "Geist Mono", monospace',
} as const;

/** Below this width the sidebar and top bar are replaced by the mobile header, drawer and bottom tabs. */
export const MOBILE = "@media (max-width: 900px)";
export const BELOW_1100 = "@media (max-width: 1100px)";
export const BELOW_1280 = "@media (max-width: 1280px)";

/** The dark card used everywhere on this page. */
export const panelSx = {
  bgcolor: "background.default",
  border: 1,
  borderColor: "border.default",
  borderRadius: 1.5,
} as const;

/** "Recent Activity", "System Operational Health", chart titles… */
export const cardTitleSx = {
  fontFamily: font.display,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: "20px",
} as const;
