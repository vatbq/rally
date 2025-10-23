import { parentPort, workerData } from "worker_threads";
import { db } from "@/server/db";
import { EmailStatus, ScheduledCampaignStatus } from "@prisma/client";

interface WorkerData {
  scheduledCampaignId: string;
}

const processEmails = async (scheduledCampaignId: string) => {
  const emailsToProcess = await db.email.findMany({
    where: {
      runId: scheduledCampaignId,
    },
    orderBy: {
      queuedAt: "asc",
    },
  });

  // Mark them as "sent"
  for (const email of emailsToProcess) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Small delay to simulate processing
    await db.email.update({
      where: { id: email.id },
      data: { status: EmailStatus.SENT, sentAt: new Date() },
    });
  }

  // Mark them as "delivered"
  for (const email of emailsToProcess) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Small delay to simulate delivery

    await db.email.update({
      where: { id: email.id },
      data: { status: EmailStatus.DELIVERED, deliveredAt: new Date() },
    });
  }

  // mark run as completed
  await db.ruleRun.update({
    where: { id: scheduledCampaignId },
    data: { completedAt: new Date() },
  });

  await db.scheduledCampaign.update({
    where: { executedRunId: scheduledCampaignId },
    data: { status: ScheduledCampaignStatus.COMPLETED },
  });

  return {
    success: true,
    result: {
      processed: emailsToProcess.length,
      scheduledCampaignId,
    },
  };
};

(async () => {
  try {
    const { scheduledCampaignId } = workerData as WorkerData;
    const result = await processEmails(scheduledCampaignId);

    if (parentPort) {
      parentPort.postMessage({ success: true, result });
    }
  } catch (error) {
    console.error(
      "\x1b[31m%s\x1b[0m",
      "[Worker] Error processing emails:",
      error,
    );
    if (parentPort) {
      parentPort.postMessage({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
    process.exit(1);
  }
})();
