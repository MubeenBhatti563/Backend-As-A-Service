// config/constants.ts – all copy and data for the home page.
// Components contain layout only; edit text/data here.
import { EXTERNAL_LINKS, ROUTES } from "@/config/routes";
import { SCHEMA_CODE, TYPES_CODE } from "@/config/snippets";
import {
  ArchNode,
  DashboardMenuItem,
  Faq,
  Feature,
  FooterColumn,
  LinkItem,
  PipelineStep,
  Plan,
  SecurityItem,
  SocialLink,
  SpecList,
  TrustedCompany,
  UserRow,
  WorkflowStep,
} from "@/types/homePage";

import {
  IconBolt,
  IconCheck,
  IconBrain,
  IconBrandGithub,
  IconBrandTwitter,
  IconCircleDashed,
  IconCode,
  IconCommand,
  IconCpu,
  IconDatabase,
  IconDeviceDesktop,
  IconKey,
  IconLock,
  IconPlus,
  IconRocket,
  IconSparkles,
  IconTerminal2,
  IconWorld,
  IconX,
} from "@tabler/icons-react";

const date = new Date();

/* ------------------------------ site ------------------------------ */
export const SITE = {
  name: "DevStack",
  title: "DevStack — Build Your Backend Without the Busywork",
  description:
    "A production-grade database, instant authentication, scalable storage, serverless functions, and type-safe SDKs in seconds.",
  copyright: `© ${date.getFullYear()} DevStack Inc. All rights reserved. Built for developers by developers.`,
  footerTagline:
    "Deploy production-grade database systems, auth wrappers, edge processing, and SDK compilations globally.",
} as const;

/* ------------------------------ nav ------------------------------ */
export const NAV_LINKS: readonly LinkItem[] = [
  { label: "Features", href: ROUTES.features },
  { label: "Workflow", href: ROUTES.workflow },
  { label: "Architecture", href: ROUTES.architecture },
  { label: "Docs", href: ROUTES.docs },
  { label: "Pricing", href: ROUTES.pricing },
];

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "Database", href: ROUTES.features },
      { label: "Auth", href: ROUTES.features },
      { label: "Storage", href: ROUTES.features },
      { label: "Realtime", href: ROUTES.features },
      { label: "Functions", href: ROUTES.features },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: ROUTES.docs },
      { label: "SDK Reference", href: ROUTES.sdkReference },
      { label: "API Specs", href: ROUTES.apiSpecs },
      { label: "Status Page", href: ROUTES.status },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: ROUTES.about },
      { label: "Careers", href: ROUTES.careers },
      { label: "Security", href: ROUTES.security },
      { label: "GitHub", href: EXTERNAL_LINKS.github },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms", href: ROUTES.terms },
      { label: "Privacy", href: ROUTES.privacy },
      { label: "SLA", href: ROUTES.sla },
      { label: "Compliance", href: ROUTES.compliance },
    ],
  },
];

export const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: "GitHub", href: EXTERNAL_LINKS.github, icon: IconBrandGithub },
  { label: "Twitter", href: EXTERNAL_LINKS.twitter, icon: IconBrandTwitter },
  { label: "X", href: EXTERNAL_LINKS.x, icon: IconX },
];

/* ------------------------------ hero ------------------------------ */
export const HERO = {
  badge: "Introducing DevStack BaaS v2",
  titleLine1: "Build Your Backend Without",
  titleLine2: "Building Everything From Scratch",
  text: "A production-grade database, instant authentication, scalable storage, Serverless functions, and auto-generated type-safe SDKs, deployed globally in seconds.",
} as const;

export const DASHBOARD = {
  title: "Production DB: devstack_prod",
  region: "Region: US-East-1",
  status: "Status: Active",
  syncLabel: "Syncing",
  systemStatus: "All systems operational",
  tableName: "schema: public.users",
  tableColumns: ["id", "email", "status"],
  totalRows: "Showing 5 of 1,284 rows",
  codeLabel: "SDK INITIALIZATION",
  codeSuccess: "Query executed in 24ms",
} as const;

export const DASHBOARD_MENU: readonly DashboardMenuItem[] = [
  { label: "Overview", icon: IconDeviceDesktop, href: ROUTES.features },
  {
    label: "Database",
    icon: IconDatabase,
    href: ROUTES.features,
    active: true,
  },
  { label: "Authentication", icon: IconKey, href: ROUTES.security },
  { label: "Storage", icon: IconDatabase, href: ROUTES.features },
  { label: "Edge Functions", icon: IconCode, href: ROUTES.features },
  { label: "AI Assistant", icon: IconBrain, href: ROUTES.features },
  { label: "Settings", icon: IconCircleDashed, href: ROUTES.security },
];

export const USER_ROWS: readonly UserRow[] = [
  { id: "1", email: "alice@devstack.com", status: "Verified" },
  { id: "2", email: "bob@acme.com", status: "Pending" },
  { id: "3", email: "charlie@open.org", status: "Verified" },
  { id: "4", email: "dev@stack.io", status: "Verified" },
  { id: "5", email: "sam@startup.co", status: "Pending" },
];

/* ------------------------------ trusted by ------------------------------ */
// Placeholder logos – replace with real customers (and real logos) before launch.
export const TRUSTED_LABEL = "TRUSTED BY TEAMS AT LEADING COMPANIES";
export const TRUSTED_COMPANIES: readonly TrustedCompany[] = [
  { name: "GITHUB", icon: IconBrandGithub },
  { name: "VERCEL", icon: IconX },
  { name: "DOCKER", icon: IconCircleDashed },
  { name: "REDIS", icon: IconDatabase },
  { name: "POSTGRESQL", icon: IconDatabase },
  { name: "STRIPE", icon: IconWorld },
];

/* ------------------------------ features ------------------------------ */
export const FEATURES_HEADER = {
  label: "Features",
  title: "Everything You Need, Automatically Configured",
  text: "Stop wasting hours on repetitive plumbing code. DevStack launches your database, API layer, auth, and real-time sockets seamlessly.",
} as const;

export const FEATURES: readonly Feature[] = [
  {
    icon: IconDatabase,
    title: "PostgreSQL Database",
    description:
      "Dedicated, production-grade Postgres database with full access & autoscaling resources.",
  },
  {
    icon: IconLock,
    title: "Authentication",
    description:
      "User sign-ups, standard OAuth, token management, and pre-built flow rules out of the box.",
  },
  {
    icon: IconCommand,
    title: "Auto-generated REST APIs",
    description:
      "Instantly available OpenAPI-compliant REST APIs mapped to your table schemas.",
  },
  {
    icon: IconBolt,
    title: "Realtime (WebSockets)",
    description:
      "Listen to DB updates, custom channels, and broadcast user changes globally in milliseconds.",
  },
  {
    icon: IconDatabase,
    title: "Storage",
    description:
      "Scalable asset and file storage integrated directly into access rules.",
  },
  {
    icon: IconCpu,
    title: "Server Functions",
    description:
      "Deploy serverless Node/TypeScript edge functions on DB events or schedule triggers.",
  },
  {
    icon: IconCode,
    title: "TypeScript SDK",
    description:
      "Autogenerated, type-safe SDK based on your real-time database schema structures.",
  },
  {
    icon: IconSparkles,
    title: "AI Backend Assistant",
    description:
      "Generate complex schema, validation rules, and sample seed data using simple prompts.",
  },
];

/* ------------------------------ pipeline ------------------------------ */
export const PIPELINE_HEADER = {
  label: "Compiler Pipeline",
  title: "Schema-To-Backend Architecture",
  text: "Describe your entities in simple terms. DevStack instantly parses definitions, provisions tables, sets endpoints, and generates strong TS typings.",
} as const;

export const PIPELINE_STEPS: readonly PipelineStep[] = [
  {
    step: "01",
    title: "English Prompt",
    kind: "prompt",
    text: "“Create a secure table for products with name, price, stock, and vendor id.”",
  },
  { step: "02", title: "Database Schema", kind: "code", lines: SCHEMA_CODE },
  {
    step: "03",
    title: "REST API Endpoints",
    kind: "endpoints",
    endpoints: [
      { method: "POST", path: "/api/v1/products" },
      { method: "GET", path: "/api/v1/products/:id" },
    ],
  },
  { step: "04", title: "Type-safe SDK", kind: "code", lines: TYPES_CODE },
  {
    step: "05",
    title: "Production State",
    kind: "deploy",
    label: "DEPLOYED TO EDGE",
  },
];

/* ------------------------------ workflow ------------------------------ */
export const WORKFLOW_HEADER = {
  label: "Workflow",
  title: "Zero-Configuration Setup",
  text: "From project blueprint to production-ready endpoints in five frictionless steps.",
} as const;

export const WORKFLOW_STEPS: readonly WorkflowStep[] = [
  {
    icon: IconPlus,
    title: "Create Project",
    description: "Launch with a single command via CLI or dashboard interface.",
  },
  {
    icon: IconDatabase,
    title: "Define Schema",
    description:
      "Draft tables and fields in simple visual builder or using AI prompts.",
  },
  {
    icon: IconTerminal2,
    title: "Generate API",
    description:
      "DevStack constructs endpoints, rate limits, and JSON schemas instantly.",
  },
  {
    icon: IconCode,
    title: "Connect SDK",
    description:
      "Pull updated types to your frontend repo with direct auto-complete.",
  },
  {
    icon: IconRocket,
    title: "Build App",
    description:
      "Build feature logics without managing containers, scale, or ports.",
  },
];

/* ------------------------------ AI copilot ------------------------------ */
export const AI_HEADER = {
  label: "AI Powered",
  title: "Your Co-Pilot for Schema Generation",
  text: "Write backends as fast as you can describe them. No complex configuration, no manual SQL scripts.",
} as const;

export const AI_COPILOT = {
  windowTitle: "devstack-prompt-copilot",
  badge: "GPT-4 Powered",
  promptLabel: "PROMPT INPUT",
  prompt:
    "Create a marketplace backend with users, products, orders, payments and admin roles",
  resultLabel: "GENERATED SPECIFICATION",
} as const;

export const AI_SPEC_LISTS: readonly SpecList[] = [
  {
    title: "Generated Tables",
    accent: "success",
    icon: IconCheck,
    items: [
      "users (id, email, name, role)",
      "products (id, title, price, stock)",
      "orders (id, user_id, status, total)",
      "payments (id, order_id, amount, method)",
    ],
  },
  {
    title: "API Endpoints Created",
    accent: "secondary",
    icon: IconBolt,
    items: [
      "GET /api/products",
      "POST /api/orders (authorized)",
      "PUT /api/orders/:id/pay",
      "GET /api/admin/metrics (admin only)",
    ],
  },
];

/* ------------------------------ architecture ------------------------------ */
export const ARCHITECTURE_HEADER = {
  label: "Architecture",
  title: "Modern, Enterprise-Grade Stack",
  text: "No proprietary lock-in. DevStack runs on battle-tested software designed to auto-scale on Kubernetes and Docker orchestration.",
} as const;

export const ARCH_CLIENTS: readonly ArchNode[] = [
  { title: "Next.js Client", description: "Web Application" },
  { title: "React Native", description: "iOS & Android App" },
  { title: "CLI / Scripts", description: "Admin Operations" },
];

export const ARCH_GATEWAY = {
  title: "DevStack API Gateway",
  note: "(NestJS)",
} as const;

export const ARCH_SERVICES: readonly ArchNode[] = [
  { title: "PostgreSQL", description: "Primary Storage" },
  { title: "Redis", description: "Caching & Sockets" },
  { title: "S3-Compatible", description: "Asset Storage" },
  { title: "Docker Edge", description: "Serverless Runs" },
];

export const ARCH_CTA = "Start Building for Free";

/* ------------------------------ SDK examples ------------------------------ */
export const EXAMPLES_HEADER = {
  label: "SDK Reference",
  title: "Write Elegant, Predictable Queries",
  text: "Instantly integrate authentication, standard database operations, edge function triggers, and real-time streams in just a few lines of code.",
} as const;

/* titles only – the code lives in config/snippets.ts */
export const EXAMPLE_TITLES = {
  auth: "Authentication & Profile",
  realtime: "Realtime Subscription",
} as const;

/* ------------------------------ security ------------------------------ */
export const SECURITY_HEADER = {
  label: "Security",
  title: "Enterprise-Grade Compliance by Default",
  text: "Rest easy knowing your backend services run on secured, compliant infrastructure with deep isolation standards.",
} as const;

export const SECURITY_ITEMS: readonly SecurityItem[] = [
  {
    title: "End-to-End Encryption",
    description:
      "Data is encrypted in transit (TLS 1.3) and at rest (AES-256) autonomously.",
  },
  {
    title: "Row-Level Security (RLS)",
    description:
      "Write native Postgres SQL policies for complex user constraints directly in tables.",
  },
  {
    title: "Role-Based Access",
    description:
      "Preconfigured permissions for administrators, workers, public users, and guests.",
  },
  {
    title: "API Key Management",
    description:
      "Instantly create, revoke, or set scopes for developer and client keys.",
  },
  {
    title: "Rate Limiting",
    description:
      "DDoS and over-use defense enabled by default on all API gateways.",
  },
  {
    title: "Audit Logs",
    description:
      "Full tracking compliance. View who created, edited, or modified records instantly.",
  },
];

/* ------------------------------ pricing ------------------------------ */
export const PRICING_HEADER = {
  label: "Pricing",
  title: "Honest, Proportional Pricing",
  text: "Start free for personal projects and prototypes. Upgrade to Pro when you scale to production loads.",
} as const;

export const PLANS: readonly Plan[] = [
  {
    name: "Hobby",
    description:
      "Perfect for personal test environments, hobbyists, and validation.",
    price: "$0",
    showPeriod: true,
    features: [
      "Dedicated Postgres (500MB)",
      "10,000 Monthly Active Users",
      "Storage (1GB)",
      "100k API Requests/mo",
      "Community Support",
    ],
    cta: "Get Started",
    href: ROUTES.signUp,
    featured: false,
  },
  {
    name: "Pro",
    description:
      "Optimized for growing applications, production startups, and teams.",
    price: "$29",
    showPeriod: true,
    features: [
      "Auto-scaling Postgres (8GB Included)",
      "100,000 Monthly Active Users",
      "Storage (50GB)",
      "Unlimited API Requests",
      "Auto Edge-Backups",
      "Priority Email Support",
    ],
    cta: "Start Pro Trial",
    href: ROUTES.signUp,
    featured: true,
  },
  {
    name: "Enterprise",
    description:
      "For high-load infrastructures, financial services, and full isolation compliance.",
    price: "Custom",
    showPeriod: false,
    features: [
      "Isolated VPC Hosting",
      "Unlimited Scale & MAUs",
      "Custom SLA & Support contracts",
      "SAML SSO Auth integration",
      "Dedicated Technical Account Manager",
    ],
    cta: "Contact Sales",
    href: ROUTES.contactSales,
    featured: false,
  },
];

/* ------------------------------ FAQ ------------------------------ */
export const FAQ_HEADER = {
  label: "Support",
  title: "Frequently Asked Questions",
  text: "Answers to common questions about our infrastructure, limits, and scaling.",
} as const;

export const FAQS: readonly Faq[] = [
  {
    question: "Is my database secure and isolated?",
    answer:
      "Yes, every DevStack database operates in its own isolated docker network container. We configure rigorous access controls, row-level policies, and daily off-site state saves.",
  },
  {
    question: "Can I migrate my existing Postgres database to DevStack?",
    answer:
      "Easily. Since we provide full Postgres connection strings, you can use any standard dump tool (pg_dump / pg_restore) to shift schemas and datasets instantly.",
  },
  {
    question: "How does auto-generated API rate limiting work?",
    answer:
      "We enforce intelligent global token bucket rate-limiting on our gateway nodes. You can customize limits per table, role, or user endpoint inside dashboard settings.",
  },
  {
    question: "Am I locked into DevStack's host framework?",
    answer:
      "Absolutely not. Because we run on standard open-source platforms like Postgres, Redis, and standard Node edge runs, you can take your schemas, SQL, and functions and host them anywhere.",
  },
];
