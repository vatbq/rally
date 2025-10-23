-- CreateEnum
CREATE TYPE "ScheduledCampaignStatus" AS ENUM ('PENDING', 'EXECUTING', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateTable
CREATE TABLE "ScheduledCampaign" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Los_Angeles',
    "status" "ScheduledCampaignStatus" NOT NULL DEFAULT 'PENDING',
    "executedAt" TIMESTAMP(3),
    "executedRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "ScheduledCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledCampaign_executedRunId_key" ON "ScheduledCampaign"("executedRunId");

-- AddForeignKey
ALTER TABLE "ScheduledCampaign" ADD CONSTRAINT "ScheduledCampaign_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledCampaign" ADD CONSTRAINT "ScheduledCampaign_executedRunId_fkey" FOREIGN KEY ("executedRunId") REFERENCES "RuleRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
