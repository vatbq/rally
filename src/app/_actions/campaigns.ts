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
