import { CreateRule } from "@/schemas/rules";
import { db } from "@/server/db";
import { type Rule, AppointmentStatus } from "@prisma/client";
import { Campaign, Cohort } from "@/server/interfaces/rules";
import { generateEmailBody, generateEmailSubject } from "@/lib/utils";
import { simulateEmailSending } from "./email-simulator";

export const getRules = async (): Promise<Rule[]> => {
  return await db.rule.findMany();
};

export const createRule = async (data: CreateRule) => {
  return await db.rule.create({ data });
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

export const sendEmailCampaign = async (ruleId: string) => {
  console.log(
    "\x1b[31m%s\x1b[0m",
    "Sending email campaign for ruleId:",
    ruleId,
  );

  const rule = await db.rule.findUnique({
    where: { id: ruleId },
  });

  if (!rule) {
    throw new Error("Rule not found");
  }

  const cohort = await previewRuleCohort(ruleId);

  if (cohort.length === 0) {
    return;
  }

  let runId: string | undefined;
  await db.$transaction(async (tx) => {
    const run = await tx.ruleRun.create({
      data: {
        ruleId: ruleId,
      },
    });

    runId = run.id;

    await tx.ruleTarget.createMany({
      data: cohort.map((member) => ({
        runId: run.id,
        ruleId: ruleId,
        vehicleId: member.vehicleId,
      })),
    });

    await tx.email.createMany({
      data: cohort.map((member) => ({
        runId: run.id,
        ruleId: ruleId,
        customerId: member.customer.id,
        vehicleId: member.vehicleId,
        toAddress: member.customer.email,
        subject: generateEmailSubject(rule, member),
        body: generateEmailBody(rule, member),
      })),
    });
  });

  if (runId) {
    console.log(
      "\x1b[31m%s\x1b[0m",
      "Simulating email sending for runId:",
      runId,
    );
    await simulateEmailSending(runId);
    console.log("\x1b[31m%s\x1b[0m", "Email simulation result");
  }
};

export const getRuleRuns = async (): Promise<Campaign[]> => {
  return await db.ruleRun.findMany({
    include: {
      rule: true,
      Email: {
        include: {
          customer: true,
          vehicle: true,
        },
      },
      _count: {
        select: {
          Email: true,
          ruleTargets: true,
        },
      },
    },
    orderBy: {
      startedAt: "desc",
    },
  });
};

export const getIncompleteRuleRuns = async (): Promise<Campaign[]> => {
  return await db.ruleRun.findMany({
    where: {
      completedAt: null,
    },
    include: {
      rule: true,
      Email: {
        include: {
          customer: true,
          vehicle: true,
        },
      },
      _count: {
        select: {
          Email: true,
          ruleTargets: true,
        },
      },
    },
    orderBy: {
      startedAt: "desc",
    },
  });
};

export const getRuleRun = async (runId: string) => {
  return await db.ruleRun.findUnique({
    where: { id: runId },
    include: {
      rule: true,
      Email: {
        include: {
          customer: true,
          vehicle: true,
        },
        orderBy: {
          queuedAt: "desc",
        },
      },
      ruleTargets: {
        include: {
          vehicle: {
            include: {
              customer: true,
            },
          },
        },
      },
    },
  });
};
