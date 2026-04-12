-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL DEFAULT 'AFI',
    "authReportsRequired" BOOLEAN NOT NULL DEFAULT false,
    "authEvaluationsRequired" BOOLEAN NOT NULL DEFAULT false,
    "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
    "aiProvider" TEXT NOT NULL DEFAULT 'OPENAI',
    "aiModel" TEXT NOT NULL DEFAULT 'gpt-4o',
    "aiApiKey" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);
