import { generateEmailBody, generateEmailSubject } from "@/lib/utils";
import { db } from "@/server/db";
import { Campaign } from "@/server/interfaces/campaigns";
import { previewRuleCohort } from "@/server/services/rules";
import { ScheduledCampaignStatus } from "@prisma/client";
import { simulateEmailSending } from "./email-simulator";

export const getCampaigns = async (): Promise<Campaign[]> => {
  return await db.ruleRun.findMany({
    include: {
      rule: true,
      emails: {
        include: {
          customer: true,
          vehicle: true,
        },
      },
      _count: {
        select: {
          emails: true,
          ruleTargets: true,
        },
      },
    },
    orderBy: {
      startedAt: "desc",
    },
  });
};

export const getIncompleteCampaigns = async (): Promise<Campaign[]> => {
  return await db.ruleRun.findMany({
    where: {
      completedAt: null,
    },
    include: {
      rule: true,
      emails: {
        include: {
          customer: true,
          vehicle: true,
        },
      },
      _count: {
        select: {
          emails: true,
          ruleTargets: true,
        },
      },
    },
    orderBy: {
      startedAt: "desc",
    },
  });
};

export const getCampaign = async (campaignId: string) => {
  return await db.ruleRun.findUnique({
    where: { id: campaignId },
    include: {
      rule: true,
      emails: {
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

export const executeEmailCampaign = async (ruleId: string) => {
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
    simulateEmailSending(runId);
  }
};

export const scheduleEmailCampaign = async (
  ruleId: string,
  scheduledFor: Date,
  timezone: string,
) => {
  const now = new Date();

  if (scheduledFor <= now) {
    throw new Error("Scheduled time must be in the future");
  }

  const rule = await db.rule.findUnique({
    where: { id: ruleId },
  });

  if (!rule) {
    throw new Error("Rule not found");
  }

  return await db.scheduledCampaign.create({
    data: {
      ruleId,
      scheduledFor,
      timezone,
      status: ScheduledCampaignStatus.PENDING,
    },
    include: {
      rule: true,
    },
  });
};

export const getScheduledCampaigns = async () => {
  return await db.scheduledCampaign.findMany({
    where: {
      status: {
        in: [
          ScheduledCampaignStatus.PENDING
        ],
      },
    },
    include: {
      rule: true,
    },
    orderBy: {
      scheduledFor: "asc",
    },
  });
};

export const getAllScheduledCampaigns = async () => {
  return await db.scheduledCampaign.findMany({
    include: {
      rule: true,
      executedRun: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const executeScheduledCampaign = async (scheduledCampaignId: string) => {
  const scheduled = await db.scheduledCampaign.findUnique({
    where: { id: scheduledCampaignId },
    include: { rule: true },
  });

  if (!scheduled) {
    throw new Error("Scheduled campaign not found");
  }

  if (scheduled.status !== ScheduledCampaignStatus.PENDING) {
    throw new Error("Scheduled campaign is not in PENDING status");
  }

  try {
    const cohort = await previewRuleCohort(scheduled.ruleId);

    if (cohort.length === 0) {
      await db.scheduledCampaign.update({
        where: { id: scheduledCampaignId },
        data: {
          status: ScheduledCampaignStatus.COMPLETED,
          executedAt: new Date(),
        },
      });
            
      return null;
    }

    let runId: string | undefined;

    await db.$transaction(async (tx) => {
      const run = await tx.ruleRun.create({
        data: {
          ruleId: scheduled.ruleId,
        },
      });

      runId = run.id;

      await tx.ruleTarget.createMany({
        data: cohort.map((member) => ({
          runId: run.id,
          ruleId: scheduled.ruleId,
          vehicleId: member.vehicleId,
        })),
      });

      await tx.email.createMany({
        data: cohort.map((member) => ({
          runId: run.id,
          ruleId: scheduled.ruleId,
          customerId: member.customer.id,
          vehicleId: member.vehicleId,
          toAddress: member.customer.email,
          subject: generateEmailSubject(scheduled.rule, member),
          body: generateEmailBody(scheduled.rule, member),
        })),
      });
    });

    // Mark as completed after successful creation
    await db.scheduledCampaign.update({
      where: { id: scheduledCampaignId },
      data: {
        status: ScheduledCampaignStatus.COMPLETED,
        executedAt: new Date(),
        executedRunId: runId,
      },
    });

    if (runId) {
      simulateEmailSending(runId);
    }

    return runId;
  } catch (error) {
    console.error(
      "\x1b[31m%s\x1b[0m",
      `[Scheduler] Failed to execute scheduled campaign ${scheduledCampaignId}:`,
      error,
    );
    await db.scheduledCampaign.update({
      where: { id: scheduledCampaignId },
      data: { status: ScheduledCampaignStatus.FAILED },
    });
    throw error;
  }
};

export const cancelScheduledCampaign = async (scheduledCampaignId: string) => {
  const scheduled = await db.scheduledCampaign.findUnique({
    where: { id: scheduledCampaignId },
  });

  if (!scheduled) {
    throw new Error("Scheduled campaign not found");
  }

  if (
    scheduled.status !== ScheduledCampaignStatus.PENDING &&
    scheduled.status !== ScheduledCampaignStatus.EXECUTING
  ) {
    throw new Error(
      "Cannot cancel a campaign that is not pending or executing",
    );
  }

  return await db.scheduledCampaign.update({
    where: { id: scheduledCampaignId },
    data: {
      status: ScheduledCampaignStatus.CANCELLED,
      cancelledAt: new Date(),
    },
  });
};
