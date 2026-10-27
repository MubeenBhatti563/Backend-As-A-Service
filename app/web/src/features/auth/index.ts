import { Line } from "./types";

/* ----------------------------- TerminalPane content ----------------------------- */
export const BRAND = "DevStack";
export const HEADING = "Powering Next-Gen Backends";
export const TEXT =
  "Build serverless Postgres, deploy real-time channels, and sync schemas with type-safe clients globally.";
export const WINDOW_TITLE = "bash - devstack@cloud";
export const FEATURES = [
  "Production-grade isolated architecture",
  "Auto-generated GraphQL & REST controllers",
];

export const LINES: Line[] = [
  { kind: "command", text: "$ npm install @devstack/sdk" },
  { kind: "output", text: "+ @devstack/sdk@2.0.4 - installed in 0.8s" },
  { kind: "command", text: "$ devstack deploy --prod" },
  { kind: "step", text: "Provisioning isolated Postgres DB [US-East]" },
  { kind: "step", text: "Spinning up Redis cache & WebSockets" },
  { kind: "step", text: "Compiling type-safe TS configurations" },
  { kind: "done", text: "Deployed successfully to production in 1.4s" },
];

export const SHOW_LOGO_BELOW_900 = "@media (max-width: 900px)";
