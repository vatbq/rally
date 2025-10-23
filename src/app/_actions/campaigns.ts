"use server";

import { executeEmailCampaign, getCampaign, getCampaigns, getIncompleteCampaigns } from "@/server/services/campaigns";
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

export const getIncompleteCampaignsAction = async () => {
  return await getIncompleteCampaigns();
};

export const getCampaignAction = async (campaignId: string) => {
  return await getCampaign(campaignId);
};