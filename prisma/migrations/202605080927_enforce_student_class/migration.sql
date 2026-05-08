-- Enforce that students must have a classId at the database level
-- Use quotes for camelCase column names in PostgreSQL
ALTER TABLE "users" ADD CONSTRAINT "student_must_have_class" 
CHECK (
  ("role"::text != 'STUDENT') OR ("classId" IS NOT NULL)
);
