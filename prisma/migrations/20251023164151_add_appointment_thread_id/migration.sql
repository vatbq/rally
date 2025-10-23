-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "threadId" TEXT;

-- CreateIndex
CREATE INDEX "Appointment_threadId_idx" ON "Appointment"("threadId");
