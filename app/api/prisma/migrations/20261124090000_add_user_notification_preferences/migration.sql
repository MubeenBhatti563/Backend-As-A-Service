ALTER TABLE "platform_users"
  ADD COLUMN "email_alerts" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "security_alerts" BOOLEAN NOT NULL DEFAULT true;
