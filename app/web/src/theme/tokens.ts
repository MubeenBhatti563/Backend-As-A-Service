// theme/tokens.ts
// Design tokens that sit *next to* the MUI theme (things the theme has no slot for).
// Nothing in here is hard-coded inside a component, so a design change is a one-file edit.
import { theme } from "./theme";

/* ------------------------------------------------------------------ */
/* Breakpoints                                                         */
/* The original stylesheet used 1050 / 720 / 390 rather than MUI's     */
/* defaults, so they are kept as media-query keys for sx.              */
/* ------------------------------------------------------------------ */
export const mq = {
  tablet: "@media (max-width: 1050px)",
  mobile: "@media (max-width: 720px)",
  narrow: "@media (max-width: 390px)",
  reducedMotion: "@media (prefers-reduced-motion: reduce)",
} as const;

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* The landing page uses three stacked surfaces. They map onto the     */
/* theme's background tokens by VALUE (input ≈ #060913, default ≈      */
/* #0e131f, elevated = #171f30). Re-map here to restyle the whole page.*/
/* ------------------------------------------------------------------ */
export const SURFACE = {
  base: "background.input",
  panel: "background.default",
  raised: "background.elevated",
} as const;
export type Surface = keyof typeof SURFACE;

/* ------------------------------------------------------------------ */
/* Fonts – read from the theme so there is a single source of truth.   */
/* ------------------------------------------------------------------ */
export const fontFamily = {
  display: theme.typography.h1.fontFamily as string,
  body: theme.typography.fontFamily as string,
  mono: theme.typography.code.fontFamily as string,
} as const;

/* ------------------------------------------------------------------ */
/* Syntax highlighting (used by <CodeBlock />)                         */
/* ------------------------------------------------------------------ */
export const SYNTAX_COLOR = {
  keyword: "#ff7b72",
  literal: "#c4b5fd",
  string: "#a5d6a7",
  comment: "text.disabled",
} as const;
export type TokenKind = keyof typeof SYNTAX_COLOR;

/* ------------------------------------------------------------------ */
/* Shared sx fragments                                                 */
/* NOTE: theme.spacing is 4px, so 1 unit = 4px. Radii are multiples    */
/* of theme.shape.borderRadius (8px), so 1.5 = 12px.                   */
/* ------------------------------------------------------------------ */
export const pageGutter = {
  px: "5.55%",
  [mq.tablet]: { px: "4%" },
  [mq.mobile]: { px: 5 },
} as const;

/** Content never grows wider than 1280px; the gutter absorbs the rest. */
export const sectionGutter = {
  px: "max(5.55%, calc((100% - 1280px) / 2))",
  [mq.tablet]: { px: "4%" },
  [mq.mobile]: { px: 5 },
} as const;

export const monoLabel = {
  fontFamily: fontFamily.mono,
  letterSpacing: ".04em",
} as const;

export const hoverLift = {
  transition: "transform .2s ease, border-color .2s ease",
  "&:hover": { transform: "translateY(-3px)", borderColor: "border.strong" },
  [mq.reducedMotion]: { transition: "none", "&:hover": { transform: "none" } },
} as const;

/** Height of the sticky navbar – also used as scroll-margin for anchors. */
export const NAV_HEIGHT = { desktop: 80, mobile: 68 } as const;
