/*
  Warnings:

  - You are about to drop the column `availabilityScore` on the `evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `clarityScore` on the `evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `pedagogyScore` on the `evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `rhythmScore` on the `evaluations` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RatingBand" AS ENUM ('VERY_POOR', 'POOR', 'FAIR', 'GOOD', 'EXCELLENT');

-- DropForeignKey
ALTER TABLE "evaluation_campaigns" DROP CONSTRAINT "evaluation_campaigns_classId_fkey";

-- AlterTable
ALTER TABLE "evaluations" DROP COLUMN "availabilityScore",
DROP COLUMN "clarityScore",
DROP COLUMN "pedagogyScore",
DROP COLUMN "rhythmScore",
ADD COLUMN     "availabilityRating" "RatingBand",
ADD COLUMN     "comprehensionRating" "RatingBand",
ADD COLUMN     "explanationRating" "RatingBand",
ADD COLUMN     "pedagogyRating" "RatingBand",
ADD COLUMN     "rhythmRating" "RatingBand";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_otp_challenges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_otp_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "login_otp_challenges_userId_idx" ON "login_otp_challenges"("userId");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_otp_challenges" ADD CONSTRAINT "login_otp_challenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_campaigns" ADD CONSTRAINT "evaluation_campaigns_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
