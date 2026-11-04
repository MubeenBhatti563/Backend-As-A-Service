// Shared style fragments for the account screens.
// theme.spacing = 4px, so spacing units in sx are px / 4. borderRadius units are 8px (1.5 = 12px).
export const font = {
  display: "var(--font-outfit), Outfit, sans-serif",
  mono: 'var(--font-geist-mono), "Geist Mono", monospace',
} as const;

export const HIDE_BELOW_900 = "@media (max-width: 900px)";
export const HIDE_BELOW_720 = "@media (max-width: 720px)";
export const STACK_BELOW_1100 = "@media (max-width: 1100px)";

/** Card used by projects, usage, plan and activity. */
export const panelSx = {
  bgcolor: "background.default",
  border: 1,
  borderColor: "border.default",
  borderRadius: 1.5,
} as const;

/** The small grey pill ("Developer", "Free", project count). */
export const badgeSx = {
  display: "inline-flex",
  alignItems: "center",
  px: "7px",
  py: "3px",
  bgcolor: "background.elevated",
  borderRadius: 0.5,
  color: "text.secondary",
  fontSize: 10,
  fontWeight: 500,
  lineHeight: "13px",
} as const;
