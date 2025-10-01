-- CreateEnum
CREATE TYPE "conversation"."ParticipantType" AS ENUM ('CHILD', 'PARENT');

-- CreateEnum
CREATE TYPE "conversation"."InputType" AS ENUM ('TEXT', 'VOICE');

-- CreateTable
CREATE TABLE "conversation"."conversations" (
    "id" BIGSERIAL NOT NULL,
    "participant_type" "conversation"."ParticipantType" NOT NULL,
    "participant_id" BIGINT NOT NULL,
    "title" TEXT,
    "initial_image_s3_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_at" TIMESTAMP(3),

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation"."questions" (
    "id" BIGSERIAL NOT NULL,
    "conversation_id" BIGINT NOT NULL,
    "input_type" "conversation"."InputType" NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation"."answers" (
    "id" BIGSERIAL NOT NULL,
    "question_id" BIGINT NOT NULL,
    "answer_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversations_participant_type_participant_id_idx" ON "conversation"."conversations"("participant_type", "participant_id");

-- CreateIndex
CREATE INDEX "questions_conversation_id_question_order_idx" ON "conversation"."questions"("conversation_id", "question_order");

-- CreateIndex
CREATE UNIQUE INDEX "answers_question_id_key" ON "conversation"."answers"("question_id");

-- AddForeignKey
ALTER TABLE "conversation"."questions" ADD CONSTRAINT "questions_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation"."answers" ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "conversation"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
