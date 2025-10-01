/*
  Warnings:

  - You are about to drop the column `category_scores` on the `analytics` table. All the data in the column will be lost.
  - You are about to drop the column `keyword` on the `child_interests` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `child_interests` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[child_id,category]` on the table `child_interests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `analytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_score` to the `analytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_score` to the `child_interests` table without a default value. This is not possible if the table is not empty.
  - Made the column `category` on table `child_interests` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "ark"."child_interests_child_id_keyword_idx";

-- AlterTable
ALTER TABLE "ark"."analytics" DROP COLUMN "category_scores",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "category_score" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ark"."child_interests" DROP COLUMN "keyword",
DROP COLUMN "score",
ADD COLUMN     "total_score" INTEGER NOT NULL,
ALTER COLUMN "category" SET NOT NULL;

-- CreateIndex
CREATE INDEX "analytics_child_id_category_idx" ON "ark"."analytics"("child_id", "category");

-- CreateIndex
CREATE INDEX "child_interests_child_id_category_idx" ON "ark"."child_interests"("child_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "child_interests_child_id_category_key" ON "ark"."child_interests"("child_id", "category");
