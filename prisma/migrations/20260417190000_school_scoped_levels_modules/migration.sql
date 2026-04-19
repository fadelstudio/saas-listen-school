-- AcademicLevel + Module scoped by school (no shared catalogue between tenants).

-- ─── academic_levels ─────────────────────────────────────────────────────────
ALTER TABLE "academic_levels" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;

DROP TABLE IF EXISTS _level_school_pairs;
CREATE TEMP TABLE _level_school_pairs AS
SELECT DISTINCT cl."levelId" AS "levelId", cp."schoolId" AS "schoolId"
FROM "classes" cl
JOIN "campuses" cp ON cp."id" = cl."campusId"
WHERE cp."schoolId" IS NOT NULL;

-- Single-school levels: attach row to that school
UPDATE "academic_levels" al
SET "schoolId" = x."schoolId"
FROM (
  SELECT "levelId", MIN("schoolId") AS "schoolId"
  FROM _level_school_pairs
  GROUP BY "levelId"
  HAVING COUNT(DISTINCT "schoolId") = 1
) x
WHERE al.id = x."levelId" AND al."schoolId" IS NULL;

-- Multi-school: keep one row for MIN(school), clone for other schools and re-point classes
DO $$
DECLARE
  lev RECORD;
  sch RECORD;
  new_id TEXT;
  first_school TEXT;
  lvl_name TEXT;
  lvl_order INT;
  lvl_created TIMESTAMP(3);
  lvl_updated TIMESTAMP(3);
BEGIN
  FOR lev IN
    SELECT "levelId" AS lid
    FROM _level_school_pairs
    GROUP BY "levelId"
    HAVING COUNT(DISTINCT "schoolId") > 1
  LOOP
    SELECT "name", "order", "createdAt", "updatedAt"
    INTO lvl_name, lvl_order, lvl_created, lvl_updated
    FROM "academic_levels"
    WHERE id = lev.lid;

    SELECT MIN("schoolId") INTO first_school FROM _level_school_pairs WHERE "levelId" = lev.lid;
    UPDATE "academic_levels" SET "schoolId" = first_school WHERE id = lev.lid;

    FOR sch IN
      SELECT DISTINCT p."schoolId" AS sid
      FROM _level_school_pairs p
      WHERE p."levelId" = lev.lid AND p."schoolId" <> first_school
    LOOP
      new_id := gen_random_uuid()::text;
      INSERT INTO "academic_levels" ("id", "schoolId", "name", "order", "createdAt", "updatedAt")
      VALUES (new_id, sch.sid, lvl_name, lvl_order, lvl_created, lvl_updated);

      UPDATE "classes" cl
      SET "levelId" = new_id
      FROM "campuses" cp
      WHERE cl."campusId" = cp."id"
        AND cp."schoolId" = sch.sid
        AND cl."levelId" = lev.lid;
    END LOOP;
  END LOOP;
END $$;

-- Levels still without school (no class): attach to first school row
UPDATE "academic_levels"
SET "schoolId" = (SELECT "id" FROM "schools" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "schoolId" IS NULL;

ALTER TABLE "academic_levels" DROP CONSTRAINT IF EXISTS "academic_levels_name_key";

ALTER TABLE "academic_levels" ALTER COLUMN "schoolId" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'academic_levels_schoolId_fkey') THEN
    ALTER TABLE "academic_levels"
      ADD CONSTRAINT "academic_levels_schoolId_fkey"
      FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "academic_levels_schoolId_name_key" ON "academic_levels"("schoolId", "name");
CREATE INDEX IF NOT EXISTS "academic_levels_schoolId_idx" ON "academic_levels"("schoolId");

-- ─── modules ─────────────────────────────────────────────────────────────────
ALTER TABLE "modules" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;

DROP TABLE IF EXISTS _module_school_pairs;
CREATE TEMP TABLE _module_school_pairs AS
SELECT DISTINCT cm."moduleId" AS "moduleId", cp."schoolId" AS "schoolId"
FROM "class_modules" cm
JOIN "classes" cl ON cl."id" = cm."classId"
JOIN "campuses" cp ON cp."id" = cl."campusId"
WHERE cp."schoolId" IS NOT NULL
UNION
SELECT DISTINCT r."moduleId", r."schoolId"
FROM "reports" r
WHERE r."moduleId" IS NOT NULL AND r."schoolId" IS NOT NULL
UNION
SELECT DISTINCT e."moduleId", e."schoolId"
FROM "evaluations" e
WHERE e."schoolId" IS NOT NULL;

UPDATE "modules" m
SET "schoolId" = x."schoolId"
FROM (
  SELECT "moduleId", MIN("schoolId") AS "schoolId"
  FROM _module_school_pairs
  GROUP BY "moduleId"
  HAVING COUNT(DISTINCT "schoolId") = 1
) x
WHERE m.id = x."moduleId" AND m."schoolId" IS NULL;

DO $$
DECLARE
  mod RECORD;
  sch RECORD;
  new_id TEXT;
  first_school TEXT;
  m_name TEXT;
  m_code TEXT;
  m_created TIMESTAMP(3);
  m_updated TIMESTAMP(3);
BEGIN
  FOR mod IN
    SELECT "moduleId" AS mid
    FROM _module_school_pairs
    GROUP BY "moduleId"
    HAVING COUNT(DISTINCT "schoolId") > 1
  LOOP
    SELECT "name", "code", "createdAt", "updatedAt"
    INTO m_name, m_code, m_created, m_updated
    FROM "modules"
    WHERE id = mod.mid;

    SELECT MIN("schoolId") INTO first_school FROM _module_school_pairs WHERE "moduleId" = mod.mid;
    UPDATE "modules" SET "schoolId" = first_school WHERE id = mod.mid;

    FOR sch IN
      SELECT DISTINCT p."schoolId" AS sid
      FROM _module_school_pairs p
      WHERE p."moduleId" = mod.mid AND p."schoolId" <> first_school
    LOOP
      new_id := gen_random_uuid()::text;
      INSERT INTO "modules" ("id", "schoolId", "name", "code", "createdAt", "updatedAt")
      VALUES (new_id, sch.sid, m_name, m_code, m_created, m_updated);

      UPDATE "class_modules" cm SET "moduleId" = new_id
      FROM "classes" cl
      JOIN "campuses" cp ON cp."id" = cl."campusId"
      WHERE cm."classId" = cl."id" AND cp."schoolId" = sch.sid AND cm."moduleId" = mod.mid;

      UPDATE "reports" SET "moduleId" = new_id WHERE "schoolId" = sch.sid AND "moduleId" = mod.mid;
      UPDATE "evaluations" SET "moduleId" = new_id WHERE "schoolId" = sch.sid AND "moduleId" = mod.mid;

      UPDATE "evaluation_campaigns" ec SET "moduleId" = new_id
      WHERE ec."moduleId" = mod.mid
        AND (
          (ec."campusId" IS NOT NULL AND EXISTS (SELECT 1 FROM "campuses" c WHERE c.id = ec."campusId" AND c."schoolId" = sch.sid))
          OR (ec."classId" IS NOT NULL AND EXISTS (
              SELECT 1 FROM "classes" cl2
              JOIN "campuses" c2 ON c2.id = cl2."campusId"
              WHERE cl2.id = ec."classId" AND c2."schoolId" = sch.sid
            ))
          OR EXISTS (
              SELECT 1 FROM "professors" pf
              JOIN "campuses" c3 ON c3.id = pf."campusId"
              WHERE pf.id = ec."professorId" AND c3."schoolId" = sch.sid
            )
        );
    END LOOP;
  END LOOP;
END $$;

UPDATE "modules"
SET "schoolId" = (SELECT "id" FROM "schools" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "schoolId" IS NULL;

ALTER TABLE "modules" DROP CONSTRAINT IF EXISTS "modules_name_key";
ALTER TABLE "modules" DROP CONSTRAINT IF EXISTS "modules_code_key";

ALTER TABLE "modules" ALTER COLUMN "schoolId" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'modules_schoolId_fkey') THEN
    ALTER TABLE "modules"
      ADD CONSTRAINT "modules_schoolId_fkey"
      FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "modules_schoolId_name_key" ON "modules"("schoolId", "name");
CREATE INDEX IF NOT EXISTS "modules_schoolId_idx" ON "modules"("schoolId");

DROP TABLE IF EXISTS _level_school_pairs;
DROP TABLE IF EXISTS _module_school_pairs;
