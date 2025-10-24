import z from "zod";

export const Mode = {
  NOW: "now",
  SCHEDULE: "schedule",
  RECURRING: "recurring",
} as const;

export const RecurringFrequency = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
} as const;

export const campaignFormSchema = z
  .object({
    mode: z.enum(["now", "schedule", "recurring"]),
    // One-time schedule fields
    scheduledDate: z.string().optional(),
    scheduledTime: z.string().optional(),
    // Recurring schedule fields
    recurringFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).optional(),
    recurringTime: z.string().optional(),
    recurringDayOfWeek: z.number().min(0).max(6).optional(),
    recurringDayOfMonth: z.number().min(1).max(31).optional(),
    recurringStartDate: z.string().optional(),
    recurringEndDate: z.string().optional(),
    // Common fields
    timezone: z.string(),
  })
  .refine(
    (data) => {
      if (data.mode === "schedule") {
        return !!data.scheduledDate && !!data.scheduledTime;
      }
      return true;
    },
    {
      message: "Please select both date and time",
      path: ["scheduledDate"],
    },
  )
  .refine(
    (data) => {
      if (
        data.mode === Mode.SCHEDULE &&
        data.scheduledDate &&
        data.scheduledTime
      ) {
        const scheduledFor = new Date(
          `${data.scheduledDate}T${data.scheduledTime}`,
        );
        return scheduledFor > new Date();
      }
      return true;
    },
    {
      message: "Scheduled time must be in the future",
      path: ["scheduledTime"],
    },
  )
  .refine(
    (data) => {
      if (data.mode === "recurring") {
        return (
          !!data.recurringFrequency &&
          !!data.recurringTime &&
          !!data.recurringStartDate
        );
      }
      return true;
    },
    {
      message: "Please select frequency, time, and start date",
      path: ["recurringFrequency"],
    },
  )
  .refine(
    (data) => {
      if (data.mode === "recurring" && data.recurringFrequency === "WEEKLY") {
        return data.recurringDayOfWeek !== undefined;
      }
      return true;
    },
    {
      message: "Please select a day of the week",
      path: ["recurringDayOfWeek"],
    },
  )
  .refine(
    (data) => {
      if (data.mode === "recurring" && data.recurringFrequency === "MONTHLY") {
        return data.recurringDayOfMonth !== undefined;
      }
      return true;
    },
    {
      message: "Please select a day of the month",
      path: ["recurringDayOfMonth"],
    },
  )
  .refine(
    (data) => {
      if (data.mode === "recurring" && data.recurringStartDate) {
        const startDate = new Date(data.recurringStartDate);
        return startDate >= new Date(new Date().toDateString()); // Start of today
      }
      return true;
    },
    {
      message: "Start date must be today or in the future",
      path: ["recurringStartDate"],
    },
  )
  .refine(
    (data) => {
      if (
        data.mode === "recurring" &&
        data.recurringEndDate &&
        data.recurringStartDate
      ) {
        const endDate = new Date(data.recurringEndDate);
        const startDate = new Date(data.recurringStartDate);
        return endDate > startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["recurringEndDate"],
    },
  );

export type CampaignFormData = z.infer<typeof campaignFormSchema>;
