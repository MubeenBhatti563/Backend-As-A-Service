// config/routes.ts
// ONE place for every link on the page. Change a value here and every
// nav item, button and footer link that uses it updates.

/** ids of the on-page sections (used both as `id=` and as `#hash` links) */
export const SECTION_IDS = {
  top: "top",
  features: "features",
  workflow: "workflow",
  architecture: "architecture",
  examples: "examples",
  security: "security",
  pricing: "pricing",
  faq: "faq",
  footer: "footer",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

export const anchor = (id: SectionId) => `#${id}` as const;

/**
 * Pages that do not exist yet point at the footer, exactly like the original
 * design. When a page ships, replace its value with the real path,
 * e.g.  about: "/about"  — nothing else needs to change.
 */
const NOT_BUILT_YET = anchor(SECTION_IDS.footer);

export const ROUTES = {
  /* on-page sections */
  home: "/",
  features: anchor(SECTION_IDS.features),
  workflow: anchor(SECTION_IDS.workflow),
  architecture: anchor(SECTION_IDS.architecture),
  security: anchor(SECTION_IDS.security),
  pricing: anchor(SECTION_IDS.pricing),

  /* docs */
  docs: anchor(SECTION_IDS.examples), // → "/docs"
  sdkReference: anchor(SECTION_IDS.examples), // → "/docs/sdk"
  apiSpecs: NOT_BUILT_YET, // → "/docs/api"
  status: NOT_BUILT_YET, // → "/status"

  /* auth / conversion */
  signIn: "/auth/login", // → "/sign-in"
  deployFree: "/auth/register", // → "/signup"
  signUp: "/auth/register", // → "/signup"
  contactSales: anchor(SECTION_IDS.top), // → "/contact"

  /* company + legal */
  about: NOT_BUILT_YET, // → "/about"
  careers: NOT_BUILT_YET, // → "/careers"
  terms: NOT_BUILT_YET, // → "/terms"
  privacy: NOT_BUILT_YET, // → "/privacy"
  sla: NOT_BUILT_YET, // → "/sla"
  compliance: NOT_BUILT_YET, // → "/compliance"

  /* Dashboard related */
  dashboard: "/dashboard",
} as const;

/** Third-party links. Replace the placeholders with the real URLs. */
export const EXTERNAL_LINKS = {
  github: NOT_BUILT_YET, // → "https://github.com/<org>"
  twitter: NOT_BUILT_YET, // → "https://twitter.com/<handle>"
  x: NOT_BUILT_YET, // → "https://x.com/<handle>"
} as const;
