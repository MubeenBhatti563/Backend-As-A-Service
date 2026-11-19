import { ACCOUNT_ROUTES, ROUTES } from "@/config/routes";

export const PROJECT_ROUTES = {
  accountHome: ACCOUNT_ROUTES.projects,
  docs: ROUTES.docs,
  support: ACCOUNT_ROUTES.help,
  profile: ACCOUNT_ROUTES.settings,
  login: ROUTES.signIn,
  /** Everything under /dashboard/projects/[id]. */
  forProject: (id: string) => {
    const base = `/dashboard/projects/${id}`;
    return {
      overview: base,
      database: `${base}/database`,
      auth: `${base}/auth`,
      storage: `${base}/storage`,
      realtime: `${base}/realtime`,
      functions: `${base}/functions`,
      ai: `${base}/ai`,
      logs: `${base}/logs`,
      usage: `${base}/usage`,
      settings: `${base}/settings`,
      // quick-start shortcuts
      createTable: `${base}/database/new`,
      addUser: `${base}/auth/users/new`,
      uploadFile: `${base}/storage/upload`,
      createFunction: `${base}/functions/new`,
      sqlEditor: `${base}/database/sql`,
      generateWithAi: `${base}/ai`,
    } as const;
  },
} as const;

/** Called by the user menu. Replace with your own auth call. */
export const LOGOUT_ENDPOINT = "/api/v1/auth/logout";
