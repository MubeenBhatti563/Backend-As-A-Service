export const PROJECT_SETTINGS_SECTIONS = [
  { label: "General", slug: "", danger: false },
  { label: "API Credentials", slug: "api-credentials", danger: false },
  { label: "Database Auth", slug: "database-auth", danger: false },
  { label: "Storage Rules", slug: "storage-rules", danger: false },
  { label: "Team Settings", slug: "team", danger: false },
  { label: "Security", slug: "security", danger: false },
  { label: "Danger Zone", slug: "danger-zone", danger: true },
] as const;

export const settingsBase = (projectId: string) =>
  `/dashboard/projects/${projectId}/settings`;
