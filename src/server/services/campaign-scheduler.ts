import cron, { type ScheduledTask } from "node-cron";
import { db } from "@/server/db";
import { ScheduledCampaignStatus } from "@prisma/client";
import { executeScheduledCampaign } from "./campaigns";

let schedulerTask: ScheduledTask | null = null;

export const startCampaignScheduler = () => {
  if (schedulerTask) {
    console.log(
      "\x1b[33m%s\x1b[0m",
      "[Scheduler] Already running, skipping initialization",
    );
    return;
  }

  console.log(
    "\x1b[32m%s\x1b[0m",
    "[Scheduler] Starting campaign scheduler...",
  );

  // Check every minute for campaigns that need to run
  schedulerTask = cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const dueSchedules = await db.scheduledCampaign.findMany({
        where: {
          status: ScheduledCampaignStatus.PENDING,
          scheduledFor: { lte: now },
        },
        include: {
          rule: true,
        },
      });

      if (dueSchedules.length > 0) {
        console.log(
          "\x1b[36m%s\x1b[0m",
          `[Scheduler] Found ${dueSchedules.length} campaign(s) to execute`,
        );
      }

      for (const schedule of dueSchedules) {
        try {
          console.log(
            "\x1b[36m%s\x1b[0m",
            `[Scheduler] Executing scheduled campaign ${schedule.id} for rule "${schedule.rule.name}"`,
          );

          await executeScheduledCampaign(schedule.id);

          console.log(
            "\x1b[32m%s\x1b[0m",
            "Scheduled campaign executed",
            schedule.id,
          );
        } catch (error) {
          console.error(
            "\x1b[31m%s\x1b[0m",
            `[Scheduler] Failed to execute scheduled campaign ${schedule.id}:`,
            error,
          );
        }
      }
    } catch (error) {
      console.error(
        "\x1b[31m%s\x1b[0m",
        "[Scheduler] Error checking for scheduled campaigns:",
        error,
      );
    }
  });

  console.log(
    "\x1b[32m%s\x1b[0m",
    "[Scheduler] Campaign scheduler started successfully",
  );
};

export const stopCampaignScheduler = () => {
  if (schedulerTask) {
    schedulerTask.stop();
    schedulerTask = null;
    console.log("\x1b[33m%s\x1b[0m", "[Scheduler] Campaign scheduler stopped");
  }
};
