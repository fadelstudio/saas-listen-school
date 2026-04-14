-- AlterTable
ALTER TABLE "system_settings" ADD COLUMN     "authOtpRequired" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "fcmToken" TEXT;
