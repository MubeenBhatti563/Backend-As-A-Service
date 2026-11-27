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
      apiEndpoints: `${base}/api-endpoints`,
      storage: `${base}/storage`,
      realtime: `${base}/realtime`,
      functions: `${base}/functions`,
      ai: `${base}/ai`,
      logs: `${base}/logs`,
      usage: `${base}/usage`,
      settings: `${base}/settings`,
      // quick-start shortcuts
      createTable: `${base}/database`,
      addUser: `${base}/auth/users/new`,
      uploadFile: `${base}/storage/upload`,
      createFunction: `${base}/functions/new`,
      sqlEditor: `${base}/database/sql-editor`,
      generateWithAi: `${base}/ai`,
    } as const;
  },
} as const;

export const PROJECT_COMING_SOON_SECTIONS = [
  {
    slug: "realtime",
    key: "realtime",
    title: "Realtime",
    description:
      "Monitor live database changes and configure realtime subscriptions.",
    highlights: [
      "Inspect active channels and connections",
      "Configure table change subscriptions",
      "Review realtime connection usage",
    ],
  },
  {
    slug: "functions",
    key: "functions",
    title: "Edge Functions",
    description:
      "Build, deploy, and observe server-side functions for your project.",
    highlights: [
      "Create and deploy TypeScript functions",
      "Manage environment variables and secrets",
      "Inspect invocation logs and status",
    ],
  },
  {
    slug: "ai",
    key: "ai",
    title: "AI Assistant",
    description:
      "Use guided AI tools to design schemas and accelerate backend setup.",
    highlights: [
      "Generate database schemas from prompts",
      "Review suggested tables and relationships",
      "Apply changes after reviewing a plan",
    ],
  },
  {
    slug: "logs",
    key: "logs",
    title: "Logs",
    description:
      "Search project activity and troubleshoot API and service events.",
    highlights: [
      "Filter events by time and severity",
      "Inspect API request outcomes",
      "Trace project changes and activity",
    ],
  },
] as const;

/** Called by the user menu. Replace with your own auth call. */
export const LOGOUT_ENDPOINT = "/api/v1/auth/logout";
