ALTER TABLE "storage_buckets"
ADD COLUMN "is_public" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "project_storage_settings" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "cdn_base_url" VARCHAR(255),
  "cache_ttl_seconds" INTEGER NOT NULL DEFAULT 3600,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "project_storage_settings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "project_storage_settings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "project_storage_settings_project_id_key" ON "project_storage_settings"("project_id");
