-- CreateEnum
CREATE TYPE "media"."UploaderType" AS ENUM ('PARENT', 'CHILD');

-- CreateTable
CREATE TABLE "media"."media_files" (
    "media_id" BIGSERIAL NOT NULL,
    "uploader_profile_id" BIGINT NOT NULL,
    "uploader_type" "media"."UploaderType" NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "s3_key" TEXT NOT NULL,
    "cdn_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("media_id")
);

-- CreateIndex
CREATE INDEX "media_files_uploader_profile_id_uploader_type_idx" ON "media"."media_files"("uploader_profile_id", "uploader_type");
