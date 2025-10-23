import { Cohort } from "@/server/interfaces/rules";
import { Rule } from "@prisma/client";
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
  const lastServiceDate = member.lastService.performedAt
    ? new Date(member.lastService.performedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "recently";

  // Use template if provided, otherwise use default
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
