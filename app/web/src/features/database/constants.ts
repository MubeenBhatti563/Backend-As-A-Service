/**
 * Figma surface colour (#0E131F) used by the sidebar, search inputs and the
 * data grid. It has no matching token in theme.ts (background.main is #0e111a),
 * so it lives here until you add something like `background.surface`.
 */
export const SURFACE = "#0E131F";

export const projectDatabaseBase = (projectId: string) =>
  `/dashboard/projects/${projectId}/database`;

export const projectTablesBase = (projectId: string) =>
  `/dashboard/projects/${projectId}/tables`;

export const tableDetailHref = (projectId: string, tableName: string) =>
  `${projectTablesBase(projectId)}/${encodeURIComponent(tableName)}`;
