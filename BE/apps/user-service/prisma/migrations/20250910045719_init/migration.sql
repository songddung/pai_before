/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `children` table. All the data in the column will be lost.
  - You are about to drop the column `avatar_url` on the `parents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user"."children" DROP COLUMN "avatar_url",
ADD COLUMN     "avatar_media_id" BIGINT;

-- AlterTable
ALTER TABLE "user"."parents" DROP COLUMN "avatar_url",
ADD COLUMN     "avatar_media_id" BIGINT,
ADD COLUMN     "voice_media_id" BIGINT;
