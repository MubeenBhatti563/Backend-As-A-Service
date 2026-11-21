-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_user_id_type_key" ON "verification_tokens"("user_id", "type");
