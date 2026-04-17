-- Add missing reportId column on decisions for tenant scoping and linking.

ALTER TABLE "decisions"
ADD COLUMN IF NOT EXISTS "reportId" TEXT;

-- Prisma schema uses @unique on Decision.reportId
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'decisions_reportId_key'
  ) THEN
    ALTER TABLE "decisions" ADD CONSTRAINT "decisions_reportId_key" UNIQUE ("reportId");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "decisions_reportId_idx" ON "decisions"("reportId");

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reports' AND relkind = 'r')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'decisions_reportId_fkey')
  THEN
    ALTER TABLE "decisions"
    ADD CONSTRAINT "decisions_reportId_fkey"
    FOREIGN KEY ("reportId") REFERENCES "reports"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END $$;

