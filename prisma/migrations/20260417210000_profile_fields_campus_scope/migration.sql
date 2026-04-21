-- Champs profil (User, Professor, Campus) + pas de contrainte sur campus prof (déjà nullable).

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "numero" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" TEXT;

ALTER TABLE "professors" ADD COLUMN IF NOT EXISTS "matricule" TEXT;
ALTER TABLE "professors" ADD COLUMN IF NOT EXISTS "numero" TEXT;
ALTER TABLE "professors" ADD COLUMN IF NOT EXISTS "phone" TEXT;

ALTER TABLE "campuses" ADD COLUMN IF NOT EXISTS "code" TEXT;
ALTER TABLE "campuses" ADD COLUMN IF NOT EXISTS "phone" TEXT;
