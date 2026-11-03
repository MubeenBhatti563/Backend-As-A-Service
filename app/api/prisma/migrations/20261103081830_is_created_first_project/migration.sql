-- AlterTable
ALTER TABLE "platform_users" ADD COLUMN     "is_created" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "verification_tokens_user_id_type_idx" ON "verification_tokens"("user_id", "type");
