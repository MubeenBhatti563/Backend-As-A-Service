// types/index.ts
import type { Icon } from "@tabler/icons-react";
import type { TokenKind } from "../theme/tokens";

/* ---------- code rendering ---------- */
export type CodeSegment = string | readonly [kind: TokenKind, text: string];
export type CodeLine = readonly CodeSegment[];

/* ---------- navigation ---------- */
export interface LinkItem {
  label: string;
  href: string;
}

export interface FooterColumn {
  heading: string;
  links: readonly LinkItem[];
}

export interface SocialLink {
  label: string;
  href: string;
  icon: Icon;
}

/* ---------- content ---------- */
export interface Feature {
  icon: Icon;
  title: string;
  description: string;
}

export interface WorkflowStep {
  icon: Icon;
  title: string;
  description: string;
}

export interface SecurityItem {
  title: string;
  description: string;
}

export interface Plan {
  name: string;
  description: string;
  price: string;
  /** Show "/month" after the price (false for "Custom"). */
  showPeriod: boolean;
  features: readonly string[];
  cta: string;
  href: string;
  featured: boolean;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface TrustedCompany {
  name: string;
  icon: Icon;
}

export interface DashboardMenuItem {
  label: string;
  icon: Icon;
  href: string;
  active?: boolean;
}

export type UserStatus = "Verified" | "Pending";

export interface UserRow {
  id: string;
  email: string;
  status: UserStatus;
}

export interface ArchNode {
  title: string;
  description: string;
}

export interface SpecList {
  title: string;
  accent: "success" | "secondary";
  icon: Icon;
  items: readonly string[];
}

export type PipelineStep =
  | { step: string; title: string; kind: "prompt"; text: string }
  | { step: string; title: string; kind: "code"; lines: readonly CodeLine[] }
  | {
      step: string;
      title: string;
      kind: "endpoints";
      endpoints: readonly { method: string; path: string }[];
    }
  | { step: string; title: string; kind: "deploy"; label: string };
