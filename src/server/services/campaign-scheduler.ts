import cron, { type ScheduledTask } from "node-cron";
import { db } from "@/server/db";
import { ScheduledCampaignStatus } from "@prisma/client";
import { executeScheduledCampaign } from "./campaigns";
import { calculateNextExecution } from "./recurring-schedules";

let schedulerTask: ScheduledTask | null = null;

const handleRecurringScheduleNext = async (recurringScheduleId: string) => {
  try {
    const recurringSchedule = await db.recurringSchedule.findUnique({
      where: { id: recurringScheduleId },
    });

    if (!recurringSchedule) {
      console.error(
        "\x1b[31m%s\x1b[0m",
        `[Scheduler] Recurring schedule ${recurringScheduleId} not found`,
      );
      return;
    }

    if (!recurringSchedule.isActive) {
      console.log(
        "\x1b[33m%s\x1b[0m",
        `[Scheduler] Recurring schedule ${recurringScheduleId} is inactive, skipping next run`,
      );
      return;
    }

    if (recurringSchedule.endsAt && new Date() >= recurringSchedule.endsAt) {
      console.log(
        "\x1b[33m%s\x1b[0m",
        `[Scheduler] Recurring schedule ${recurringScheduleId} has ended, marking as inactive`,
      );
      await db.recurringSchedule.update({
        where: { id: recurringScheduleId },
        data: { isActive: false },
      });
      return;
    }

    const nextScheduledFor = calculateNextExecution(
      recurringSchedule.frequency,
      recurringSchedule.timeOfDay,
      recurringSchedule.timezone,
      new Date(),
      recurringSchedule.dayOfWeek,
      recurringSchedule.dayOfMonth,
    );

    await db.scheduledCampaign.create({
      data: {
        ruleId: recurringSchedule.ruleId,
        scheduledFor: nextScheduledFor,
        timezone: recurringSchedule.timezone,
        recurringScheduleId: recurringSchedule.id,
        status: ScheduledCampaignStatus.PENDING,
      },
    });

    await db.recurringSchedule.update({
      where: { id: recurringScheduleId },
      data: {
        lastExecutedAt: new Date(),
        nextScheduledFor,
      },
    });

    console.log(
      "\x1b[32m%s\x1b[0m",
      `[Scheduler] Created next scheduled campaign for recurring schedule ${recurringScheduleId} at ${nextScheduledFor}`,
    );
  } catch (error) {
    console.error(
      "\x1b[31m%s\x1b[0m",
      `[Scheduler] Failed to create next scheduled campaign for recurring schedule ${recurringScheduleId}:`,
      error,
    );
  }
};

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
          recurringSchedule: true,
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

          if (schedule.recurringScheduleId) {
            await handleRecurringScheduleNext(schedule.recurringScheduleId);
          }
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
