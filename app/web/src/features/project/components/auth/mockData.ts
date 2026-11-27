import type { AuthUser } from "./types";

export const SAMPLE_USERS: AuthUser[] = [
  { id: "sample-001", name: "Alice Vance", email: "alice@example.test", role: "Admin", verified: true, lastLogin: "2m ago", status: "Active" },
  { id: "sample-002", name: "Bob Miller", email: "bob@example.test", role: "User", verified: false, lastLogin: "1d ago", status: "Inactive" },
  { id: "sample-003", name: "Charlie Stone", email: "charlie@example.test", role: "User", verified: true, lastLogin: "3h ago", status: "Active" },
  { id: "sample-004", name: "Diana Prince", email: "diana@example.test", role: "Admin", verified: true, lastLogin: "1h ago", status: "Active" },
  { id: "sample-005", name: "Ethan Hunt", email: "ethan@example.test", role: "User", verified: true, lastLogin: "8h ago", status: "Active" },
  { id: "sample-006", name: "Fiona Gallagher", email: "fiona@example.test", role: "User", verified: false, lastLogin: "5d ago", status: "Inactive" },
  { id: "sample-007", name: "George Clark", email: "george@example.test", role: "User", verified: true, lastLogin: "10m ago", status: "Active" },
  { id: "sample-008", name: "Hannah Abbott", email: "hannah@example.test", role: "User", verified: true, lastLogin: "2d ago", status: "Active" },
];

export function findSampleUser(identifier: string) {
  const normalized = identifier.toLowerCase();
  return SAMPLE_USERS.find(
    (user) => user.id === identifier || user.email.toLowerCase() === normalized,
  );
}
