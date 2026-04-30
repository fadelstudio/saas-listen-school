/*
  Warnings:

  - You are about to drop the column `campusId` on the `professors` table. All the data in the column will be lost.
  - You are about to drop the column `campusId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[campaignId]` on the table `decisions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[domain]` on the table `schools` will be added. If there are existing duplicate values, this will fail.
  - Made the column `schoolId` on table `campuses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `schoolId` on table `system_settings` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('UNDEFINED', 'MALE', 'FEMALE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DecisionStatus" ADD VALUE 'PROPOSED';
ALTER TYPE "DecisionStatus" ADD VALUE 'IN_PROGRESS';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PROFESSOR';

-- DropForeignKey
ALTER TABLE "campuses" DROP CONSTRAINT "campuses_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "decisions" DROP CONSTRAINT "decisions_evaluationId_fkey";

-- DropForeignKey
ALTER TABLE "evaluation_campaigns" DROP CONSTRAINT "evaluation_campaigns_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "evaluation_campaigns" DROP CONSTRAINT "evaluation_campaigns_professorId_fkey";

-- DropForeignKey
ALTER TABLE "professors" DROP CONSTRAINT "professors_campusId_fkey";

-- DropForeignKey
ALTER TABLE "system_settings" DROP CONSTRAINT "system_settings_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_campusId_fkey";

-- DropIndex
DROP INDEX "academic_levels_name_key";

-- DropIndex
DROP INDEX "campuses_schoolId_idx";

-- DropIndex
DROP INDEX "decisions_reportId_idx";

-- DropIndex
DROP INDEX "evaluations_schoolId_idx";

-- DropIndex
DROP INDEX "modules_code_key";

-- DropIndex
DROP INDEX "modules_name_key";

-- DropIndex
DROP INDEX "reports_schoolId_idx";

-- DropIndex
DROP INDEX "users_schoolId_idx";

-- AlterTable
ALTER TABLE "campuses" ALTER COLUMN "schoolId" SET NOT NULL;

-- AlterTable
ALTER TABLE "decisions" ADD COLUMN     "analysisId" TEXT,
ADD COLUMN     "campaignId" TEXT,
ADD COLUMN     "schoolId" TEXT,
ALTER COLUMN "evaluationId" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PROPOSED';

-- AlterTable
ALTER TABLE "evaluation_campaigns" ALTER COLUMN "moduleId" DROP NOT NULL,
ALTER COLUMN "professorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "evaluations" ADD COLUMN     "deviceMetadata" JSONB,
ALTER COLUMN "schoolId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "attachments" JSONB,
ADD COLUMN     "schoolId" TEXT,
ADD COLUMN     "targetCampusId" TEXT,
ADD COLUMN     "targetCampusIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "targetClassId" TEXT,
ADD COLUMN     "targetClassIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "targetDeviceUti" TEXT,
ADD COLUMN     "targetRole" "Role",
ADD COLUMN     "targetRoles" "Role"[] DEFAULT ARRAY[]::"Role"[],
ADD COLUMN     "targetUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "url" TEXT;

-- AlterTable
ALTER TABLE "professors" DROP COLUMN "campusId",
ADD COLUMN     "schoolId" TEXT;

-- AlterTable
ALTER TABLE "reports" ALTER COLUMN "schoolId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "schools" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "system_settings" ALTER COLUMN "schoolId" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "campusId",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "currentSessionId" TEXT,
ADD COLUMN     "sex" "Sex" NOT NULL DEFAULT 'UNDEFINED';

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_reports" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "filters" JSONB NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "generatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_devices" (
    "uti" TEXT NOT NULL,
    "fcmToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_devices_pkey" PRIMARY KEY ("uti")
);

-- CreateTable
CREATE TABLE "_CampusToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CampusToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "audit_logs_schoolId_createdAt_idx" ON "audit_logs"("schoolId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "_CampusToUser_B_index" ON "_CampusToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "decisions_campaignId_key" ON "decisions"("campaignId");

-- CreateIndex
CREATE INDEX "notifications_schoolId_isRead_createdAt_idx" ON "notifications"("schoolId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_targetCampusId_idx" ON "notifications"("targetCampusId");

-- CreateIndex
CREATE INDEX "notifications_targetClassId_idx" ON "notifications"("targetClassId");

-- CreateIndex
CREATE INDEX "notifications_targetDeviceUti_createdAt_idx" ON "notifications"("targetDeviceUti", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "schools_domain_key" ON "schools"("domain");

-- AddForeignKey
ALTER TABLE "campuses" ADD CONSTRAINT "campuses_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professors" ADD CONSTRAINT "professors_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "evaluation_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "analysis_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_reports" ADD CONSTRAINT "analysis_reports_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_reports" ADD CONSTRAINT "analysis_reports_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_targetCampusId_fkey" FOREIGN KEY ("targetCampusId") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_targetClassId_fkey" FOREIGN KEY ("targetClassId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_campaigns" ADD CONSTRAINT "evaluation_campaigns_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_campaigns" ADD CONSTRAINT "evaluation_campaigns_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "professors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampusToUser" ADD CONSTRAINT "_CampusToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "campuses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampusToUser" ADD CONSTRAINT "_CampusToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
