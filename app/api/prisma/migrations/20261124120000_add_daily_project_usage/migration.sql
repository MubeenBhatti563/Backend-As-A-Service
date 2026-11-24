CREATE TABLE "project_usage_daily" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "day" DATE NOT NULL,
  "api_requests" BIGINT NOT NULL DEFAULT 0,
  "db_bytes" BIGINT NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "project_usage_daily_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "project_usage_daily_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "project_usage_daily_project_id_day_key" ON "project_usage_daily"("project_id", "day");
CREATE INDEX "project_usage_daily_project_id_day_idx" ON "project_usage_daily"("project_id", "day");
