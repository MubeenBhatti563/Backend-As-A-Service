CREATE TABLE "storage_buckets" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "name" VARCHAR(63) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "storage_buckets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "storage_buckets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "storage_objects" (
  "id" TEXT NOT NULL,
  "bucket_id" TEXT NOT NULL,
  "object_key" TEXT NOT NULL,
  "file_name" VARCHAR(255) NOT NULL,
  "content_type" VARCHAR(255) NOT NULL,
  "size" BIGINT NOT NULL,
  "uploaded_by" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "storage_objects_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "storage_objects_bucket_id_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage_buckets"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "storage_buckets_project_id_name_key" ON "storage_buckets"("project_id", "name");
CREATE INDEX "storage_buckets_project_id_created_at_idx" ON "storage_buckets"("project_id", "created_at");
CREATE UNIQUE INDEX "storage_objects_object_key_key" ON "storage_objects"("object_key");
CREATE INDEX "storage_objects_bucket_id_created_at_idx" ON "storage_objects"("bucket_id", "created_at" DESC);
