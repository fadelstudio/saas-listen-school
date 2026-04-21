-- Photos de profil (stockage Supabase, chemin relatif au bucket `attachments`)

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatarPath" TEXT;
ALTER TABLE "professors" ADD COLUMN IF NOT EXISTS "avatarPath" TEXT;
