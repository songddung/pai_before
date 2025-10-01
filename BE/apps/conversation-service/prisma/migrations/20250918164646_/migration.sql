/*
  Warnings:

  - You are about to drop the column `participant_id` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `participant_type` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `input_type` on the `questions` table. All the data in the column will be lost.
  - Added the required column `child_id` to the `conversations` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "conversation"."conversations_participant_type_participant_id_idx";

-- AlterTable
ALTER TABLE "conversation"."answers" ADD COLUMN     "vqa_direct_answer" TEXT;

-- AlterTable
ALTER TABLE "conversation"."conversations" DROP COLUMN "participant_id",
DROP COLUMN "participant_type",
ADD COLUMN     "child_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "conversation"."questions" DROP COLUMN "input_type";

-- DropEnum
DROP TYPE "conversation"."InputType";

-- DropEnum
DROP TYPE "conversation"."ParticipantType";
