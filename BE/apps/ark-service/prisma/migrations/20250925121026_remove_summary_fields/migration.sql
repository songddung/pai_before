/*
  Warnings:

  - You are about to drop the column `interest_summary` on the `parent_reports` table. All the data in the column will be lost.
  - You are about to drop the column `recommendation_summary` on the `parent_reports` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ark"."parent_reports" DROP COLUMN "interest_summary",
DROP COLUMN "recommendation_summary";
