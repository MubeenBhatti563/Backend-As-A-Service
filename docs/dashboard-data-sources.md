# Dashboard data sources

Dashboard product data is loaded from the authenticated Nest API using the
existing API client or a server-side fetch that forwards the session cookie.
Mock fallbacks are not used in the dashboard.

| UI                       | API source                                             | Notes                                                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account projects         | `GET /project/get-all-project`                         | Includes latest recorded project DB and file usage bytes.                                                                                                                                                |
| Account activity         | `GET /project/activity`                                | Reads persisted activity logs. Empty means no activity is recorded.                                                                                                                                      |
| Account plan and usage   | `GET /plan/my-plan`                                    | Values are from current-period usage records.                                                                                                                                                            |
| Public plan descriptions | `GET /plan/plans`                                      | Prices and limits are read from plan rows.                                                                                                                                                               |
| Project overview         | `GET /project/:id/overview`                            | Reads the last seven daily telemetry records; chart points are persisted counts and storage snapshots. Service-health telemetry and active-user counts are unavailable and omitted/reported unavailable. |
| Project usage            | `GET /project/:id/usage`                               | Owner-checked monthly project usage, current plan quotas, and daily API request records for `/dashboard/projects/:id/usage`. File-storage and realtime usage are shown as not tracked until telemetry is implemented. |
| Authentication           | None                                                   | `/dashboard/projects/:id/auth` and `/auth/:userId` are clearly labeled UI previews using local sample users. Search and role filtering apply only to those samples; detail pages, sessions, security logs, and user/role/settings operations are not backed by project APIs. |
| API Endpoints             | None                                                   | `/dashboard/projects/:id/api-endpoints` shows illustrative sample endpoint/code/response snippets only. It is not a generated project API; endpoint execution is disabled and cURL copy copies example text only. |
| Project storage           | None                                                   | `/dashboard/projects/:id/storage` and `/storage/:bucketId` are responsive previews with sample bucket/file rows and sample usage values. Bucket CRUD, uploads, downloads, CDN settings, and storage policies are not connected to project APIs; actions are disabled. |
| Database tables          | `GET /project/:id/database`                            | Counts use exact `COUNT(*)`; storage is PostgreSQL physical relation size.                                                                                                                               |
| Database indexes         | `GET /project/:id/database/indexes`                    | Reads index metadata from PostgreSQL catalogs for the owned project schema; byte totals are exact allocated relation sizes.                                                                              |
| Database ER diagram      | `GET /project/:id/database/relationships`              | Graph of all tables and foreign key relationships with topological layout positions.                                                                                                                     |
| Table rows               | `GET /project/:id/database/tables/:name`               | Exact total count and paginated row data. Sensitive columns are omitted.                                                                                                                                 |
| Table structure          | `GET /project/:id/database/tables/:name/structure`     | Column definitions, primary keys, data types, nullability, unique/foreign key constraints.                                                                                                               |
| Table relationships      | `GET /project/:id/database/tables/:name/relationships` | Directional incoming/outgoing foreign keys and sub-graph ER diagram for a single table.                                                                                                                  |
| Table indexes            | `GET /project/:id/database/tables/:name/indexes`       | Indexes specific to a table, including index method, column list, and allocated size.                                                                                                                    |
| Table RLS policies       | `GET /project/:id/database/tables/:name/policies`      | Row-Level Security status (`relrowsecurity`) and policies defined on the table (`pg_policies`).                                                                                                          |
| SQL Workspace Query      | `POST /project/:id/database/query`                     | Executes SQL statement within tenant search_path with a 15-second statement timeout; returns column keys, rows (capped at 500), execution duration, and affected count.                                 |

OAuth provider screens and payment checkout are
intentionally not connected. No Stripe integration is configured. Billing
actions are disabled while checkout is unavailable.

## PostgreSQL size semantics

`pg_total_relation_size` reports allocated physical bytes for a table including
indexes and TOAST storage. It is not the sum of visible row payload bytes. An
empty table may still occupy several 8 KiB PostgreSQL pages, particularly when
an index exists. The database API also returns heap and index bytes separately
for diagnostics. Row counts are exact on database table views; this can cost
more than catalog estimates for large tables, so pagination endpoints should
be preferred over frequent full overview refreshes.

Historical API request graphs use daily telemetry snapshots. Active-user counts,
storage-provider health, and invoices have no backing events/tables yet; the UI
must not present generated values as live telemetry. Account profile and notification preferences are
stored on the authenticated platform-user record and exposed through the
authenticated `/auth/profile` and `/auth/preferences` endpoints.

## Daily project usage collection

`UsageTelemetryInterceptor` counts successful (`< 400`) HTTP responses with a
`projectId` route parameter. The ID comes from the matched route, not a client
header or body. The backend aggregates counts in Redis by UTC day/project and
flushes them once per minute to `project_usage_daily`; Redis keys expire after
nine days. A Redis lock ensures only one API replica performs a flush/snapshot
at a time. Database bytes are sampled from PostgreSQL relation sizes hourly.
Keep Redis durable and monitored: the short-lived counters are the buffer
before the daily SQL record is updated.

The request graph currently means successful project-scoped HTTP requests to
this API, including dashboard reads. It does not mean SDK/API-key traffic: the
backend does not yet authenticate incoming project API keys or route tenant
traffic through a gateway. Database snapshots begin after deployment and are
not retroactively available; the graph fills in as daily telemetry accumulates.

The project usage endpoint scopes the project lookup to the authenticated
owner. It returns the current UTC calendar month, the owner's active plan
limits, monthly project usage and available daily API request counts. The
dashboard fills missing calendar days with zero for the request chart. Database
usage uses the monthly record when populated, falling back to the latest daily
snapshot; file-storage and realtime figures are not yet measured per project
and must not be interpreted as live usage.

## Unavailable dashboard areas

Realtime, Edge Functions, AI Assistant and Logs currently render a shared
"Coming soon" page with planned capabilities; they are not functional service
interfaces yet. Authentication, API Endpoints, and Storage have preview-only
interfaces and are not connected to project-specific services. Storage summary
values are examples and are not live telemetry. Project Settings navigation
also includes sections that are placeholders. Danger Zone actions are disabled
until corresponding project-management APIs exist. `/help` currently shows
the same reusable unavailable banner.

The SQL editor's Query History is stored in browser `localStorage` under
`baas_sql_history_<projectId>`, independently for each project and browser. It
keeps at most 50 entries without automatic expiry. The editor's **Clear** action
only clears the current query/results; history entries are removed with their
individual delete buttons or **Clear all**.
