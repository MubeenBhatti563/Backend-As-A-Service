/*
  Warnings:

  - You are about to drop the column `is_created` on the `platform_users` table. All the data in the column will be lost.
  - Added the required column `role` to the `api_keys` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN     "role" "ApiKeyRole" NOT NULL;

-- AlterTable
ALTER TABLE "platform_users" DROP COLUMN "is_created";
