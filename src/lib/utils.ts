import { Cohort } from "@/server/interfaces/rules";
import { RecurringFrequency, Rule } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateEmailSubject = (rule: Rule, member: Cohort[0]): string => {
  return `Time for ${rule.service.toLowerCase().replace(/_/g, " ")} - ${member.make} ${member.model}`;
};

export const generateEmailBody = (rule: Rule, member: Cohort[0]): string => {
  const customerName = member.customer.firstName || "Customer";
  const lastServiceDate = member.lastService?.performedAt
    ? new Date(member.lastService?.performedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "no service history";

  if (rule.emailTemplate && rule.emailTemplate.trim() !== "") {
    return rule.emailTemplate
      .replace(/\{customerName\}/g, customerName)
      .replace(/\{firstName\}/g, member.customer.firstName || "Customer")
      .replace(/\{lastName\}/g, member.customer.lastName || "")
      .replace(/\{year\}/g, String(member.year || ""))
      .replace(/\{make\}/g, member.make || "")
      .replace(/\{model\}/g, member.model || "")
      .replace(/\{service\}/g, rule.service.toLowerCase().replace(/_/g, " "))
      .replace(/\{cadenceMonths\}/g, String(rule.cadenceMonths))
      .replace(/\{lastServiceDate\}/g, lastServiceDate);
  }

  // Default mail
  return `Hi ${customerName},

We noticed it's been ${rule.cadenceMonths} months since your last ${rule.service.toLowerCase().replace(/_/g, " ")} service for your ${member.make} ${member.model} ${member.year}.

It's time to schedule your next service appointment to keep your vehicle running smoothly and safely.

Reply to this email to schedule an appointment, or call us at your convenience.

Best regards,
Rally`;
};

export const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatFrequency = (
  frequency: RecurringFrequency,
  dayOfWeek?: number | null,
  dayOfMonth?: number | null,
): string => {
  switch (frequency) {
    case RecurringFrequency.DAILY:
      return "Daily";
    case RecurringFrequency.WEEKLY:
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      return `Weekly on ${days[dayOfWeek ?? 0]}`;
    case RecurringFrequency.MONTHLY:
      return `Monthly on day ${dayOfMonth ?? 1}`;
    default:
      return frequency;
  }
};

export const getTimeUntil = (scheduledFor: Date) => {
  const now = new Date();
  const target = new Date(scheduledFor);
  const diff = target.getTime() - now.getTime();

  if (diff < 0) return "Executing soon...";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `in ${days} ${days === 1 ? "day" : "days"}`;
  }

  if (hours > 0) {
    return `in ${hours}h ${minutes}m`;
  }

  return `in ${minutes}m`;
};
