/*
  Warnings:

  - You are about to drop the column `aiApiKey` on the `system_settings` table. All the data in the column will be lost.
  - You are about to drop the column `aiModel` on the `system_settings` table. All the data in the column will be lost.
  - You are about to drop the column `aiProvider` on the `system_settings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `modules` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[matricule]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `levelId` to the `classes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPERADMIN';

-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "levelId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "evaluations" ADD COLUMN     "campaignId" TEXT;

-- AlterTable
ALTER TABLE "modules" ALTER COLUMN "code" DROP NOT NULL;

-- AlterTable
ALTER TABLE "professors" ADD COLUMN     "campusId" TEXT;

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "deviceMetadata" JSONB;

-- AlterTable
ALTER TABLE "system_settings" DROP COLUMN "aiApiKey",
DROP COLUMN "aiModel",
DROP COLUMN "aiProvider",
ADD COLUMN     "aiConfigs" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "aiOverrideConfigId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "matricule" TEXT;

-- CreateTable
CREATE TABLE "academic_levels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_modules" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_campaigns" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "classId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluation_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ClassModuleToProfessor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClassModuleToProfessor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "academic_levels_name_key" ON "academic_levels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "class_modules_classId_moduleId_key" ON "class_modules"("classId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "_ClassModuleToProfessor_B_index" ON "_ClassModuleToProfessor"("B");

-- CreateIndex
CREATE UNIQUE INDEX "modules_name_key" ON "modules"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_matricule_key" ON "users"("matricule");

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "academic_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_modules" ADD CONSTRAINT "class_modules_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_modules" ADD CONSTRAINT "class_modules_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professors" ADD CONSTRAINT "professors_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "evaluation_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_campaigns" ADD CONSTRAINT "evaluation_campaigns_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_campaigns" ADD CONSTRAINT "evaluation_campaigns_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_campaigns" ADD CONSTRAINT "evaluation_campaigns_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "professors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassModuleToProfessor" ADD CONSTRAINT "_ClassModuleToProfessor_A_fkey" FOREIGN KEY ("A") REFERENCES "class_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassModuleToProfessor" ADD CONSTRAINT "_ClassModuleToProfessor_B_fkey" FOREIGN KEY ("B") REFERENCES "professors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
