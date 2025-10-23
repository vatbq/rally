-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "isReply" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "threadId" TEXT;

-- CreateIndex
CREATE INDEX "Email_threadId_idx" ON "Email"("threadId");
