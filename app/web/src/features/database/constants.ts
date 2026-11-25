/**
 * Figma surface colour (#0E131F) used by the sidebar, search inputs and the
 * data grid. It has no matching token in theme.ts (background.main is #0e111a),
 * so it lives here until you add something like `background.surface`.
 */
export const SURFACE = "#0E131F";

/**
 * Figma canvas fill (#060913): the ER diagram canvas background.
 * No theme token matches (background.default is #0e111a).
 */
export const CANVAS = "#060913";

export const projectDatabaseBase = (projectId: string) =>
  `/dashboard/projects/${projectId}/database`;

export const projectTablesBase = (projectId: string) =>
  `/dashboard/projects/${projectId}/database/tables`;

export const tableDetailHref = (projectId: string, tableName: string) =>
  `${projectTablesBase(projectId)}/${encodeURIComponent(tableName)}`;

export const tableSectionHref = (
  projectId: string,
  tableName: string,
  section: "" | "structure" | "relationships" | "indexes",
) => `${tableDetailHref(projectId, tableName)}${section ? `/${section}` : ""}`;
