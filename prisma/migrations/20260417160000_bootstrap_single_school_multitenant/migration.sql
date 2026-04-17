-- Bootstrap multi-tenant "school" layer for legacy single-school databases.
-- Safe to run on existing deployments (idempotent / conditional).

-- 1) Schools table (tenant root)
CREATE TABLE IF NOT EXISTS "schools" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "domain" TEXT,
  "logoUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'schools_name_key'
  ) THEN
    ALTER TABLE "schools" ADD CONSTRAINT "schools_name_key" UNIQUE ("name");
  END IF;
END $$;

-- Default tenant used for existing AFI test data
INSERT INTO "schools" ("id", "name")
VALUES ('afi-default-school', 'AFI (default)')
ON CONFLICT ("id") DO NOTHING;

-- 2) Add schoolId columns if missing (nullable first for safe backfill)
ALTER TABLE "users"           ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
ALTER TABLE "campuses"        ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
ALTER TABLE "reports"         ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
ALTER TABLE "evaluations"     ADD COLUMN IF NOT EXISTS "schoolId" TEXT;

-- 3) Backfill schoolId for existing rows
UPDATE "users"           SET "schoolId" = 'afi-default-school' WHERE "schoolId" IS NULL;
UPDATE "campuses"        SET "schoolId" = 'afi-default-school' WHERE "schoolId" IS NULL;
UPDATE "system_settings" SET "schoolId" = 'afi-default-school' WHERE "schoolId" IS NULL;
UPDATE "reports"         SET "schoolId" = 'afi-default-school' WHERE "schoolId" IS NULL;
UPDATE "evaluations"     SET "schoolId" = 'afi-default-school' WHERE "schoolId" IS NULL;

-- 4) Indices for tenant scoping
CREATE INDEX IF NOT EXISTS "users_schoolId_idx"       ON "users"("schoolId");
CREATE INDEX IF NOT EXISTS "campuses_schoolId_idx"    ON "campuses"("schoolId");
CREATE INDEX IF NOT EXISTS "reports_schoolId_idx"     ON "reports"("schoolId");
CREATE INDEX IF NOT EXISTS "evaluations_schoolId_idx" ON "evaluations"("schoolId");

-- 5) Foreign keys (only if target table exists and constraint missing)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'schools' AND relkind = 'r') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_schoolId_fkey') THEN
      ALTER TABLE "users"
      ADD CONSTRAINT "users_schoolId_fkey"
      FOREIGN KEY ("schoolId") REFERENCES "schools"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'campuses_schoolId_fkey') THEN
      ALTER TABLE "campuses"
      ADD CONSTRAINT "campuses_schoolId_fkey"
      FOREIGN KEY ("schoolId") REFERENCES "schools"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'system_settings_schoolId_fkey') THEN
      ALTER TABLE "system_settings"
      ADD CONSTRAINT "system_settings_schoolId_fkey"
      FOREIGN KEY ("schoolId") REFERENCES "schools"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reports_schoolId_fkey') THEN
      ALTER TABLE "reports"
      ADD CONSTRAINT "reports_schoolId_fkey"
      FOREIGN KEY ("schoolId") REFERENCES "schools"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'evaluations_schoolId_fkey') THEN
      ALTER TABLE "evaluations"
      ADD CONSTRAINT "evaluations_schoolId_fkey"
      FOREIGN KEY ("schoolId") REFERENCES "schools"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
  END IF;
END $$;

-- 6) SystemSettings unique per school (if schema expects it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'system_settings_schoolId_key'
  ) THEN
    ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_schoolId_key" UNIQUE ("schoolId");
  END IF;
END $$;

