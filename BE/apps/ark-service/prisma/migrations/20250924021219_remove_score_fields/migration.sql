/*
  Warnings:

  - You are about to drop the column `category_score` on the `analytics` table. All the data in the column will be lost.
  - You are about to drop the column `total_score` on the `child_interests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ark"."analytics" DROP COLUMN "category_score";

-- AlterTable
ALTER TABLE "ark"."child_interests" DROP COLUMN "total_score";
