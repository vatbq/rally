import { RecurringFrequency, RecurringSchedule, Rule } from "@prisma/client";

export interface RecurringScheduleWithRule extends RecurringSchedule {
  rule: Rule;
}

export interface CreateRecurringScheduleInput {
  ruleId: string;
  frequency: RecurringFrequency;
  timeOfDay: string; 
  dayOfWeek?: number; 
  dayOfMonth?: number; 
  timezone: string;
  startsAt: Date;
  endsAt?: Date;
}

export { RecurringFrequency };
