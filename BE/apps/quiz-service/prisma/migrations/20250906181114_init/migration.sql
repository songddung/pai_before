-- CreateTable
CREATE TABLE "quiz"."quizzes" (
    "id" BIGSERIAL NOT NULL,
    "parent_id" BIGINT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "reward" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz"."quiz_results" (
    "id" BIGSERIAL NOT NULL,
    "quiz_id" BIGINT NOT NULL,
    "child_id" BIGINT NOT NULL,
    "total_attempts" INTEGER NOT NULL,
    "is_solved" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "reward_given" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "quiz_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quizzes_parent_id_is_active_idx" ON "quiz"."quizzes"("parent_id", "is_active");

-- CreateIndex
CREATE INDEX "quiz_results_quiz_id_child_id_idx" ON "quiz"."quiz_results"("quiz_id", "child_id");

-- AddForeignKey
ALTER TABLE "quiz"."quiz_results" ADD CONSTRAINT "quiz_results_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz"."quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
