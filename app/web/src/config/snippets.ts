// config/snippets.ts – code samples shown on the page (data, not markup)

import { CodeLine } from "@/types/homePage";

export const SDK_INIT_CODE: readonly CodeLine[] = [
  [["keyword", "import"], " { DevStack }"],
  [["keyword", "from"], " ", ["string", "'@devstack/sdk'"]],
  [],
  [["literal", "const"], " client = ", ["literal", "new"], " DevStack({"],
  ["  apiKey: ", ["string", "'ds_live_k82f...'"]],
  ["})"],
  [],
  [["literal", "await"], " client.db.table(", ["string", "'users'"], ")"],
  ["  .insert({"],
  ["    email: ", ["string", "'new@dev.com'"], ","],
  ["    verified: ", ["literal", "true"]],
  ["  })"],
];

export const SCHEMA_CODE: readonly CodeLine[] = [
  [["keyword", "CREATE TABLE"], " products ("],
  [" id UUID PRIMARY KEY,"],
  [" name VARCHAR(255), price NUMERIC,"],
  [" vendor_id REFERENCES users"],
  [");"],
];

export const TYPES_CODE: readonly CodeLine[] = [
  [["keyword", "interface"], " Product {"],
  [" id: string; name: string;"],
  [" price: number; vendor_id: string;"],
  ["}"],
];

export const AUTH_EXAMPLE_CODE: readonly CodeLine[] = [
  [
    ["literal", "const"],
    " { user, error } = ",
    ["literal", "await"],
    " client.auth.signUp({",
  ],
  ["  email: ", ["string", '"dev@stack.com"'], ","],
  ["  password: ", ["string", '"secure123!"']],
  ["});"],
  [],
  [["comment", "// Automatically queries using the user auth context"]],
  [["literal", "const"], " profiles = ", ["literal", "await"], " client.db"],
  ["  .table(", ["string", "'profiles'"], ").select()"],
];

export const REALTIME_EXAMPLE_CODE: readonly CodeLine[] = [
  [["literal", "const"], " subscription = client.db"],
  ["  .table(", ["string", "'orders'"], ")"],
  ["  .on(", ["string", "'INSERT'"], ", (payload) => {"],
  ["    console.log(", ["string", "'New order:'"], ", payload.new);"],
  ["  })"],
  ["  .subscribe();"],
  [],
  [["comment", "// Unsubscribe on component unmount"]],
  ["subscription.unsubscribe();"],
];
