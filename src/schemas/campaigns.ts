import z from "zod";

export const Mode = {
  NOW: "now",
  SCHEDULE: "schedule",
} as const;

export const campaignFormSchema = z
  .object({
    mode: z.enum(["now", "schedule"]),
    scheduledDate: z.string(),
    scheduledTime: z.string(),
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
  );

export type CampaignFormData = z.infer<typeof campaignFormSchema>;
