import { Cohort } from "@/server/interfaces/rules";
import { Rule } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateEmailSubject = (rule: Rule, member: Cohort[0]): string => {
  const customerName = member.customer.firstName || "Customer";
  return `Time for ${rule.service.toLowerCase().replace(/_/g, " ")} - ${member.make} ${member.model}`;
};

export const generateEmailBody = (rule: Rule, member: Cohort[0]): string => {
  const customerName = member.customer.firstName || "Customer";
  const vehicleInfo = `${member.make} ${member.model} ${member.year}`;

  // Use template if provided, otherwise use default
  if (rule.emailTemplate && rule.emailTemplate.trim() !== "") {
    return rule.emailTemplate
      .replace(/\{customerName\}/g, customerName)
      .replace(/\{firstName\}/g, member.customer.firstName || "Customer")
      .replace(/\{lastName\}/g, member.customer.lastName || "")
      .replace(/\{vehicle\}/g, vehicleInfo)
      .replace(/\{service\}/g, rule.service.toLowerCase().replace(/_/g, " "));
  }

  // Default template
  return `Hi ${customerName},

We noticed it's been ${rule.cadenceMonths} months since your last ${rule.service.toLowerCase().replace(/_/g, " ")} service for your ${vehicleInfo}.

It's time to schedule your next service appointment to keep your vehicle running smoothly and safely.

Reply to this email to schedule an appointment, or call us at your convenience.

Best regards,
Your Service Team`;
};
