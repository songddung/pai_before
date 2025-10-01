-- CreateTable
CREATE TABLE "ark"."analytics" (
    "analytics_id" BIGSERIAL NOT NULL,
    "conversation_id" BIGINT,
    "child_id" BIGINT NOT NULL,
    "extracted_keywords" JSONB,
    "category_scores" JSONB,
    "analysis_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("analytics_id")
);

-- CreateTable
CREATE TABLE "ark"."child_interests" (
    "interest_id" BIGSERIAL NOT NULL,
    "child_id" BIGINT NOT NULL,
    "category" TEXT,
    "keyword" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "mention_count" INTEGER NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "child_interests_pkey" PRIMARY KEY ("interest_id")
);

-- CreateTable
CREATE TABLE "ark"."recommendations" (
    "recommendation_id" BIGSERIAL NOT NULL,
    "child_id" BIGINT NOT NULL,
    "recommendation_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "recommendation_data" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("recommendation_id")
);

-- CreateTable
CREATE TABLE "ark"."knowledge_graph" (
    "knowledge_id" BIGSERIAL NOT NULL,
    "main_keyword" TEXT NOT NULL,
    "related_keyword" TEXT NOT NULL,
    "relation_type" TEXT NOT NULL,
    "confidence_score" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_graph_pkey" PRIMARY KEY ("knowledge_id")
);

-- CreateTable
CREATE TABLE "ark"."parent_reports" (
    "report_id" BIGSERIAL NOT NULL,
    "parent_id" BIGINT NOT NULL,
    "child_id" BIGINT NOT NULL,
    "report_type" TEXT NOT NULL,
    "report_start_date" TIMESTAMP(3),
    "report_end_date" TIMESTAMP(3),
    "bubble_chart_data" JSONB,
    "interest_summary" JSONB,
    "recommendation_summary" JSONB,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parent_reports_pkey" PRIMARY KEY ("report_id")
);

-- CreateIndex
CREATE INDEX "analytics_child_id_idx" ON "ark"."analytics"("child_id");

-- CreateIndex
CREATE INDEX "analytics_conversation_id_idx" ON "ark"."analytics"("conversation_id");

-- CreateIndex
CREATE INDEX "child_interests_child_id_keyword_idx" ON "ark"."child_interests"("child_id", "keyword");

-- CreateIndex
CREATE INDEX "recommendations_child_id_is_active_idx" ON "ark"."recommendations"("child_id", "is_active");

-- CreateIndex
CREATE INDEX "parent_reports_parent_id_idx" ON "ark"."parent_reports"("parent_id");

-- CreateIndex
CREATE INDEX "parent_reports_child_id_idx" ON "ark"."parent_reports"("child_id");
