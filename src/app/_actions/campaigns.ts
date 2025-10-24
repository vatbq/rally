"use server";

import {
  executeEmailCampaign,
  getCampaign,
  getCampaigns,
  scheduleEmailCampaign,
  getScheduledCampaigns,
  getAllScheduledCampaigns,
  cancelScheduledCampaign,
} from "@/server/services/campaigns";
import {
  createRecurringSchedule,
  pauseRecurringSchedule,
  resumeRecurringSchedule,
  stopRecurringSchedule,
  getRecurringSchedules,
} from "@/server/services/recurring-schedules";
import {
  CreateRecurringScheduleInput,
} from "@/server/interfaces/recurring-schedules";
import { revalidatePath } from "next/cache";

export const sendEmailCampaignAction = async (ruleId: string) => {
  try {
    await executeEmailCampaign(ruleId);
    revalidatePath("/campaigns");
    return { success: true, message: "Campaign launched successfully" };
  } catch (error) {
    console.error("Error launching campaign:", error);
    return { success: false, message: "Failed to launch campaign" };
  }
};

export const getCampaignsAction = async () => {
  return await getCampaigns();
};

export const getCampaignAction = async (campaignId: string) => {
  return await getCampaign(campaignId);
};

export const scheduleEmailCampaignAction = async (
  ruleId: string,
  scheduledFor: Date,
  timezone: string,
) => {
  try {
    const scheduled = await scheduleEmailCampaign(
      ruleId,
      scheduledFor,
      timezone,
    );
    revalidatePath("/campaigns");
    revalidatePath("/rules");
    return { success: true, data: scheduled };
  } catch (error) {
    console.error("Error scheduling campaign:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to schedule campaign",
    };
  }
};

export const getScheduledCampaignsAction = async () => {
  return await getScheduledCampaigns();
};

export const getAllScheduledCampaignsAction = async () => {
  return await getAllScheduledCampaigns();
};

export const cancelScheduledCampaignAction = async (
  scheduledCampaignId: string,
) => {
  try {
    await cancelScheduledCampaign(scheduledCampaignId);
    revalidatePath("/campaigns");
    return { success: true };
  } catch (error) {
    console.error("Error cancelling scheduled campaign:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to cancel campaign",
    };
  }
};

export const createRecurringScheduleAction = async (
  input: CreateRecurringScheduleInput,
) => {
  try {
    const schedule = await createRecurringSchedule(input);
    revalidatePath("/campaigns");
    revalidatePath("/rules");
    return { success: true, data: schedule };
  } catch (error) {
    console.error("Error creating recurring schedule:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create recurring schedule",
    };
  }
};

export const pauseRecurringScheduleAction = async (id: string) => {
  try {
    const schedule = await pauseRecurringSchedule(id);
    revalidatePath("/campaigns");
    revalidatePath("/rules");
    return { success: true, data: schedule };
  } catch (error) {
    console.error("Error pausing recurring schedule:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to pause recurring schedule",
    };
  }
};

export const resumeRecurringScheduleAction = async (id: string) => {
  try {
    const schedule = await resumeRecurringSchedule(id);
    revalidatePath("/campaigns");
    revalidatePath("/rules");
    return { success: true, data: schedule };
  } catch (error) {
    console.error("Error resuming recurring schedule:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to resume recurring schedule",
    };
  }
};

export const stopRecurringScheduleAction = async (id: string) => {
  try {
    await stopRecurringSchedule(id);
    revalidatePath("/campaigns");
    revalidatePath("/rules");
    return { success: true };
  } catch (error) {
    console.error("Error stopping recurring schedule:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to stop recurring schedule",
    };
  }
};

export const getRecurringSchedulesAction = async () => {
  return await getRecurringSchedules();
};
