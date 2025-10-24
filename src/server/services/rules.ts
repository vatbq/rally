import { CreateRule } from "@/schemas/rules";
import { db } from "@/server/db";
import { type Rule, AppointmentStatus } from "@prisma/client";
import { Cohort } from "@/server/interfaces/rules";

export const getRules = async (): Promise<Rule[]> => {
  return await db.rule.findMany();
};

export const createRule = async (data: CreateRule) => {
  return await db.rule.create({ data });
};

export const getRule = async (ruleId: string) => {
  const rule = await db.rule.findUnique({
    where: { id: ruleId },
    include: {
      runs: {
        include: {
          emails: {
            include: {
              customer: true,
              vehicle: true,
            },
          },
        },
        orderBy: {
          startedAt: "desc",
        },
      },
      scheduledCampaigns: {
        where: {
          status: {
            in: ["PENDING", "EXECUTING"],
          },
        },
        orderBy: {
          scheduledFor: "asc",
        },
      },
    },
  });

  return rule;
};

export const previewRuleCohort = async (ruleId: string): Promise<Cohort> => {
  const rule = await db.rule.findUnique({
    where: { id: ruleId },
  });

  if (!rule) {
    throw new Error("Rule not found");
  }

  const now = new Date();
  const cutoffDate = new Date(now);
  cutoffDate.setMonth(cutoffDate.getMonth() - rule.cadenceMonths);

  const eligibleVehicles = await db.vehicle.findMany({
    where: {
      serviceHistory: {
        some: {
          service: rule.service,
          performedAt: {
            lte: cutoffDate,
          },
        },
      },
      appointments: {
        none: {
          service: rule.service,
          status: AppointmentStatus.BOOKED,
          startsAt: {
            gte: now,
          },
        },
      },
    },
    include: {
      customer: true,
      serviceHistory: {
        where: {
          service: rule.service,
        },
        orderBy: {
          performedAt: "desc",
        },
        take: 1,
      },
    },
  });

  return eligibleVehicles.map((v) => ({
    ...v,
    vehicleId: v.id,
    lastService: v.serviceHistory[0],
  }));
};
