import type {
  DatabaseOverview,
  GridColumn,
  GridRow,
  TableDetail,
} from "./types";

export async function getDatabaseOverview(
  projectId: string,
): Promise<DatabaseOverview | null> {
  void projectId;

  return {
    stats: { size: "3.2 GB", totalTables: 12, activeConnections: 8 },
    tables: [
      {
        name: "users",
        rows: 2450,
        size: "12 MB",
        lastModified: "2m ago",
        rls: "active",
      },
      {
        name: "posts",
        rows: 8932,
        size: "45 MB",
        lastModified: "10m ago",
        rls: "active",
      },
      {
        name: "comments",
        rows: 15201,
        size: "28 MB",
        lastModified: "1h ago",
        rls: "disabled",
      },
      {
        name: "categories",
        rows: 24,
        size: "1 KB",
        lastModified: "1d ago",
        rls: "disabled",
      },
      {
        name: "orders",
        rows: 5678,
        size: "34 MB",
        lastModified: "2d ago",
        rls: "active",
      },
    ],
  };
}

const USER_COLUMNS: GridColumn[] = [
  { key: "id", label: "ID (UUID)", kind: "uuid" },
  { key: "name", label: "Name", kind: "primary" },
  { key: "email", label: "Email", kind: "secondary" },
  { key: "role", label: "Role", kind: "role" },
  { key: "status", label: "Status", kind: "status" },
  { key: "createdAt", label: "Created at", kind: "timestamp" },
];

const u = (
  id: string,
  name: string,
  email: string,
  role: string,
  status: string,
  createdAt: string,
): GridRow => ({ id, name, email, role, status, createdAt });

const USER_ROWS: GridRow[] = [
  u(
    "e82fa90a-11bc",
    "Alice Vance",
    "alice@devstack.com",
    "Admin",
    "Active",
    "2025-10-24 14:22",
  ),
  u(
    "3a92fd3c-8902",
    "Bob Miller",
    "bob@acme.com",
    "User",
    "Inactive",
    "2025-10-25 09:12",
  ),
  u(
    "90da1b82-cf89",
    "Charlie Stone",
    "charlie@open.org",
    "User",
    "Active",
    "2025-10-25 11:45",
  ),
  u(
    "fd8a02bc-3341",
    "Diana Prince",
    "diana@justice.co",
    "Admin",
    "Active",
    "2025-10-26 16:30",
  ),
  u(
    "7a2fa901-b8cc",
    "Ethan Hunt",
    "ethan@impossible.io",
    "User",
    "Active",
    "2025-10-27 08:05",
  ),
  u(
    "b2da3c90-998f",
    "Fiona Gallagher",
    "fiona@gallagher.net",
    "User",
    "Inactive",
    "2025-10-27 12:15",
  ),
  u(
    "0da8b3c2-fa11",
    "George Clark",
    "george@clarktech.dev",
    "User",
    "Active",
    "2025-10-28 10:40",
  ),
  u(
    "88da2b3c-ef02",
    "Hannah Abbott",
    "hannah@hogwarts.edu",
    "User",
    "Active",
    "2025-10-28 15:55",
  ),
  u(
    "cc2fa88a-11bc",
    "Ian Malcolm",
    "ian@jurassic.com",
    "User",
    "Active",
    "2025-10-29 09:22",
  ),
  u(
    "55fa90da-89ff",
    "Julia Roberts",
    "julia@cinema.org",
    "User",
    "Inactive",
    "2025-10-29 17:10",
  ),
];

// Placeholder shape for every table other than `users` until real schemas exist.
const GENERIC_COLUMNS: GridColumn[] = [
  { key: "id", label: "ID (UUID)", kind: "uuid" },
  { key: "name", label: "Name", kind: "primary" },
  { key: "status", label: "Status", kind: "status" },
  { key: "createdAt", label: "Created at", kind: "timestamp" },
];

const genericRows = (tableName: string): GridRow[] =>
  Array.from({ length: 10 }, (_, i) => ({
    id: `${(i + 1).toString(16).padStart(4, "0")}b3c2-9f${i}1`,
    name: `${tableName} record ${i + 1}`,
    status: i % 3 === 2 ? "Inactive" : "Active",
    createdAt: `2025-10-2${i} 09:1${i}`,
  }));

export async function getTableDetail(
  projectId: string,
  tableName: string,
): Promise<TableDetail | null> {
  const overview = await getDatabaseOverview(projectId);
  const table = overview?.tables.find(
    (t) => t.name.toLowerCase() === tableName.toLowerCase(),
  );
  if (!table) return null;

  const isUsers = table.name.toLowerCase() === "users";

  return {
    table,
    columns: isUsers ? USER_COLUMNS : GENERIC_COLUMNS,
    rows: isUsers ? USER_ROWS : genericRows(table.name),
    pagination: { page: 1, pageSize: 10, totalRows: table.rows },
  };
}
