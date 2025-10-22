import z from "zod";
import { ServiceType } from "@prisma/client";

export const createRuleSchema = z.object({
  name: z.string().min(1, "Rule name is required"),
  service: z.nativeEnum(ServiceType),
  cadenceMonths: z.number().min(1, "Cadence must be at least 1 month"),
  sendWindowDays: z.number().min(0, "Must be 0 or greater"),
  sendWindowHours: z.number().min(0, "Must be 0 or greater").max(23, "Must be less than 24"),
  timezone: z.string().min(1, "Please select a timezone"),
  enabled: z.boolean(),
  emailTemplate: z.string().min(1, "Email template is required"),
});

export type CreateRule = z.infer<typeof createRuleSchema>;
