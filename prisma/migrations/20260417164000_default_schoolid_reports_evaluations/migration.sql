-- Ensure anonymous/public-created records still get tenant context in legacy single-school deployments.

-- Backfill existing null schoolId
UPDATE "evaluations" SET "schoolId" = 'afi-default-school' WHERE "schoolId" IS NULL;
UPDATE "reports"     SET "schoolId" = 'afi-default-school' WHERE "schoolId" IS NULL;

-- Default for future inserts (keeps multi-tenant ready; per-school inserts can override)
ALTER TABLE "evaluations" ALTER COLUMN "schoolId" SET DEFAULT 'afi-default-school';
ALTER TABLE "reports"     ALTER COLUMN "schoolId" SET DEFAULT 'afi-default-school';

