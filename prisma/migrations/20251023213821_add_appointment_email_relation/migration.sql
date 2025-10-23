-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Email"("id") ON DELETE SET NULL ON UPDATE CASCADE;
