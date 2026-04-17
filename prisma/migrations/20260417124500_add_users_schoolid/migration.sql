-- Add missing schoolId relation on users for auth token payload/context.
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "schoolId" TEXT;

CREATE INDEX IF NOT EXISTS "users_schoolId_idx" ON "users"("schoolId");

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class
    WHERE relname = 'schools'
      AND relkind = 'r'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_schoolId_fkey'
  ) THEN
    ALTER TABLE "users"
    ADD CONSTRAINT "users_schoolId_fkey"
    FOREIGN KEY ("schoolId") REFERENCES "schools"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END $$;
