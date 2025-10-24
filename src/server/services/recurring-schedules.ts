import { db } from "@/server/db";
import {
  CreateRecurringScheduleInput,
  RecurringScheduleWithRule,
} from "@/server/interfaces/recurring-schedules";
import { RecurringFrequency, ScheduledCampaignStatus } from "@prisma/client";

export const calculateNextExecution = (
  frequency: RecurringFrequency,
  timeOfDay: string,
  timezone: string,
  fromDate: Date,
  dayOfWeek?: number | null,
  dayOfMonth?: number | null,
): Date => {
  const [hours, minutes] = timeOfDay.split(":").map(Number);
  const next = new Date(fromDate);

  switch (frequency) {
    case RecurringFrequency.DAILY:
      next.setHours(hours, minutes, 0, 0);

      if (next <= fromDate) {
        next.setDate(next.getDate() + 1);
      }

      break;

    case RecurringFrequency.WEEKLY:
      if (dayOfWeek === null || dayOfWeek === undefined) {
        throw new Error("dayOfWeek is required for WEEKLY frequency");
      }
      next.setHours(hours, minutes, 0, 0);

      const currentDay = next.getDay();
      let daysUntilTarget = dayOfWeek - currentDay;

      if (daysUntilTarget < 0) {
        daysUntilTarget += 7;
      } else if (daysUntilTarget === 0 && next <= fromDate) {
        daysUntilTarget = 7;
      }

      next.setDate(next.getDate() + daysUntilTarget);
      break;

    case RecurringFrequency.MONTHLY:
      if (dayOfMonth === null || dayOfMonth === undefined) {
        throw new Error("dayOfMonth is required for MONTHLY frequency");
      }
      next.setHours(hours, minutes, 0, 0);

      next.setDate(dayOfMonth);

      if (next <= fromDate) {
        next.setMonth(next.getMonth() + 1);
        next.setDate(dayOfMonth);
      }

      if (next.getDate() !== dayOfMonth) {
        next.setDate(0);
      }
      break;
  }

  return next;
};

export const createRecurringSchedule = async (
  input: CreateRecurringScheduleInput,
): Promise<RecurringScheduleWithRule> => {
  const rule = await db.rule.findUnique({
    where: { id: input.ruleId },
  });

  if (!rule) {
    throw new Error("Rule not found");
  }

  if (input.frequency === RecurringFrequency.WEEKLY && !input.dayOfWeek) {
    throw new Error("dayOfWeek is required for WEEKLY frequency");
  }

  if (input.frequency === RecurringFrequency.MONTHLY && !input.dayOfMonth) {
    throw new Error("dayOfMonth is required for MONTHLY frequency");
  }

  const nextScheduledFor = calculateNextExecution(
    input.frequency,
    input.timeOfDay,
    input.timezone,
    input.startsAt,
    input.dayOfWeek,
    input.dayOfMonth,
  );

  const recurringSchedule = await db.recurringSchedule.create({
    data: {
      ruleId: input.ruleId,
      frequency: input.frequency,
      timeOfDay: input.timeOfDay,
      dayOfWeek: input.dayOfWeek,
      dayOfMonth: input.dayOfMonth,
      timezone: input.timezone,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      nextScheduledFor,
      isActive: true,
    },
    include: {
      rule: true,
    },
  });

  await db.scheduledCampaign.create({
    data: {
      ruleId: input.ruleId,
      scheduledFor: nextScheduledFor,
      timezone: input.timezone,
      recurringScheduleId: recurringSchedule.id,
      status: ScheduledCampaignStatus.PENDING,
    },
  });

  return recurringSchedule;
};

export const pauseRecurringSchedule = async (
  id: string,
): Promise<RecurringScheduleWithRule> => {
  const schedule = await db.recurringSchedule.findUnique({
    where: { id },
  });

  if (!schedule) {
    throw new Error("Recurring schedule not found");
  }

  // Cancel any pending scheduled campaigns
  await db.scheduledCampaign.updateMany({
    where: {
      recurringScheduleId: id,
      status: ScheduledCampaignStatus.PENDING,
    },
    data: {
      status: ScheduledCampaignStatus.CANCELLED,
      cancelledAt: new Date(),
    },
  });

  return await db.recurringSchedule.update({
    where: { id },
    data: { isActive: false },
    include: {
      rule: true,
    },
  });
};

export const resumeRecurringSchedule = async (
  id: string,
): Promise<RecurringScheduleWithRule> => {
  const schedule = await db.recurringSchedule.findUnique({
    where: { id },
  });

  if (!schedule) {
    throw new Error("Recurring schedule not found");
  }

  const nextScheduledFor = calculateNextExecution(
    schedule.frequency,
    schedule.timeOfDay,
    schedule.timezone,
    new Date(),
    schedule.dayOfWeek,
    schedule.dayOfMonth,
  );

  await db.scheduledCampaign.create({
    data: {
      ruleId: schedule.ruleId,
      scheduledFor: nextScheduledFor,
      timezone: schedule.timezone,
      recurringScheduleId: id,
      status: ScheduledCampaignStatus.PENDING,
    },
  });

  return await db.recurringSchedule.update({
    where: { id },
    data: {
      isActive: true,
      nextScheduledFor,
    },
    include: {
      rule: true,
    },
  });
};

export const stopRecurringSchedule = async (id: string): Promise<void> => {
  const schedule = await db.recurringSchedule.findUnique({
    where: { id },
  });

  if (!schedule) {
    throw new Error("Recurring schedule not found");
  }

  await db.scheduledCampaign.updateMany({
    where: {
      recurringScheduleId: id,
      status: ScheduledCampaignStatus.PENDING,
    },
    data: {
      status: ScheduledCampaignStatus.CANCELLED,
      cancelledAt: new Date(),
    },
  });

  await db.recurringSchedule.delete({
    where: { id },
  });
};

export const getRecurringSchedules = async (): Promise<
  RecurringScheduleWithRule[]
> => {
  return await db.recurringSchedule.findMany({
    include: {
      rule: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getActiveRecurringSchedules = async (): Promise<
  RecurringScheduleWithRule[]
> => {
  return await db.recurringSchedule.findMany({
    where: {
      isActive: true,
    },
    include: {
      rule: true,
    },
    orderBy: {
      nextScheduledFor: "asc",
    },
  });
};
