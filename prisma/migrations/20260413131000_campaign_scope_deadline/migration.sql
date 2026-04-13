-- Extend evaluation campaigns: scope + optional class/campus targeting + required deadline

ALTER TABLE "evaluation_campaigns" ADD COLUMN "scope" TEXT NOT NULL DEFAULT 'CLASS';
ALTER TABLE "evaluation_campaigns" ADD COLUMN "campusId" TEXT;

-- classId becomes optional (for CAMPUS/SCHOOL)
ALTER TABLE "evaluation_campaigns" ALTER COLUMN "classId" DROP NOT NULL;

-- dueDate becomes required for security (deadline)
-- If existing rows have NULL dueDate, set a safe default: createdAt + 14 days
UPDATE "evaluation_campaigns"
SET "dueDate" = ("createdAt" + INTERVAL '14 days')
WHERE "dueDate" IS NULL;

ALTER TABLE "evaluation_campaigns" ALTER COLUMN "dueDate" SET NOT NULL;

-- Foreign key to campus
ALTER TABLE "evaluation_campaigns"
ADD CONSTRAINT "evaluation_campaigns_campusId_fkey"
FOREIGN KEY ("campusId") REFERENCES "campuses"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Helpful indexes for reminder scans
CREATE INDEX "evaluation_campaigns_scope_status_dueDate_idx"
ON "evaluation_campaigns"("scope", "status", "dueDate");

CREATE INDEX "evaluation_campaigns_campusId_status_dueDate_idx"
ON "evaluation_campaigns"("campusId", "status", "dueDate");

CREATE INDEX "evaluation_campaigns_classId_status_dueDate_idx"
ON "evaluation_campaigns"("classId", "status", "dueDate");

