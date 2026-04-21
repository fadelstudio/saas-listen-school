-- Add school slug for tenant resolution by subdomain/header.
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Backfill slugs for existing rows (slugify from name).
WITH base AS (
  SELECT
    id,
    COALESCE(
      NULLIF(
        regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'),
        ''
      ),
      'school'
    ) AS base_slug
  FROM "schools"
),
ranked AS (
  SELECT
    id,
    base_slug,
    ROW_NUMBER() OVER (PARTITION BY base_slug ORDER BY id) AS rn
  FROM base
)
UPDATE "schools" s
SET "slug" = CASE
  WHEN r.rn = 1 THEN r.base_slug
  ELSE r.base_slug || '-' || r.rn::text
END
FROM ranked r
WHERE s.id = r.id AND s."slug" IS NULL;

-- Fallback if any row still has null slug.
UPDATE "schools"
SET "slug" = id
WHERE "slug" IS NULL;

-- Keep column non-null and unique.
ALTER TABLE "schools" ALTER COLUMN "slug" SET NOT NULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'schools_slug_key'
  ) THEN
    ALTER TABLE "schools" ADD CONSTRAINT "schools_slug_key" UNIQUE ("slug");
  END IF;
END $$;
