-- Fix orphan students: assign to school 'afi' and a valid class
-- 1. Find a class from 'afi'
-- 2. Update users

DO $$ 
DECLARE 
    fallback_class_id UUID;
BEGIN 
    -- Try to find a class belonging to school 'afi'
    SELECT c.id INTO fallback_class_id 
    FROM "classes" c
    JOIN "campuses" cam ON c."campusId" = cam.id
    WHERE cam."schoolId" = 'afi'
    LIMIT 1;

    IF fallback_class_id IS NOT NULL THEN
        UPDATE "users" 
        SET "schoolId" = 'afi', "classId" = fallback_class_id::text
        WHERE "role" = 'STUDENT' 
        AND ("classId" IS NULL OR "schoolId" IS NULL OR "schoolId" != 'afi');
    END IF;
END $$;
