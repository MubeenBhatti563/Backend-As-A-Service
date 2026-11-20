"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { ProjectOption } from "../types";
import type { ProjectNavKey } from "./ProjectNav";
import { ProjectShell } from "./ProjectShell";

interface ProjectLayoutShellProps {
  projectId: string;
  projects: ProjectOption[];
  email: string;
  onLogout?: () => void | Promise<void>;
  children: ReactNode;
}

/**
 * Thin client wrapper used by the [id]/layout.tsx RSC.
 *
 * Derives the correct sidebar `activeKey` from the current pathname so every
 * child route (/database, /database/sql-editor, /auth, …) automatically
 * highlights the right nav item — without each page having to pass it manually.
 */
export function ProjectLayoutShell({
  projectId,
  projects,
  email,
  onLogout,
  children,
}: ProjectLayoutShellProps) {
  const pathname = usePathname();
  const activeKey = deriveActiveKey(pathname, projectId);

  return (
    <ProjectShell
      projectId={projectId}
      projects={projects}
      email={email}
      activeKey={activeKey}
      onLogout={onLogout}
    >
      {children}
    </ProjectShell>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────

const SEGMENT_TO_KEY: Record<string, ProjectNavKey> = {
  database: "database",
  tables: "database",
  auth: "auth",
  storage: "storage",
  realtime: "realtime",
  functions: "functions",
  ai: "ai",
  logs: "logs",
  usage: "usage",
  settings: "settings",
};

/**
 * Looks at the path segment immediately after /dashboard/projects/[id] and
 * maps it to a ProjectNavKey. Falls back to "overview" for the index page.
 */
function deriveActiveKey(pathname: string, projectId: string): ProjectNavKey {
  const base = `/dashboard/projects/${projectId}`;
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : "";
  // rest is either "" (index) or "/database/sql-editor" etc.
  const segment = rest.split("/").filter(Boolean)[0] ?? "";
  return SEGMENT_TO_KEY[segment] ?? "overview";
}
