-- Add campaign linkage + indexes for notifications

ALTER TABLE "notifications" ADD COLUMN "campaignId" TEXT;

-- Indexes to keep /notifications fast
CREATE INDEX "notifications_userId_isRead_createdAt_idx"
ON "notifications"("userId", "isRead", "createdAt");

CREATE INDEX "notifications_campaignId_createdAt_idx"
ON "notifications"("campaignId", "createdAt");

-- Prevent duplicates (max 2 notifications per student per campaign if we use 2 distinct types)
ALTER TABLE "notifications"
ADD CONSTRAINT "notifications_userId_campaignId_type_key"
UNIQUE ("userId", "campaignId", "type");

-- Optional relation to campaigns
ALTER TABLE "notifications"
ADD CONSTRAINT "notifications_campaignId_fkey"
FOREIGN KEY ("campaignId") REFERENCES "evaluation_campaigns"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

