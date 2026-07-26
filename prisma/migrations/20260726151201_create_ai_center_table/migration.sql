-- CreateTable
CREATE TABLE "ai_center" (
    "id" SERIAL NOT NULL,
    "task_title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "task_type" TEXT NOT NULL DEFAULT 'Feature',
    "estimated_hours" DOUBLE PRECISION NOT NULL,
    "story_points" DOUBLE PRECISION NOT NULL,
    "complexity" TEXT NOT NULL,
    "confidence_score" DOUBLE PRECISION NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ai_center_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_center_created_by_id_idx" ON "ai_center"("created_by_id");

-- CreateIndex
CREATE INDEX "ai_center_deleted_at_idx" ON "ai_center"("deleted_at");

-- AddForeignKey
ALTER TABLE "ai_center" ADD CONSTRAINT "ai_center_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
