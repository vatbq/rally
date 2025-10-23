"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getRules,
  previewRuleCohort,
  createRule,
  getRuleRuns,
  getIncompleteRuleRuns,
  getRuleRun,
  sendEmailCampaign,
} from "@/server/services/rules";
import { CreateRule } from "@/schemas/rules";

export const getRulesAction = async () => {
  return await getRules();
};

export const previewRuleCohortAction = async (ruleId: string) => {
  return await previewRuleCohort(ruleId);
};

export const createRuleAction = async (data: CreateRule) => {
  try {
    await createRule(data);
  } catch (error) {
    console.error("Error creating rule:", error);
    return { error: "Failed to create rule" };
  } finally {
    revalidatePath("/rules");
    redirect("/rules");
  }
};

export const sendEmailCampaignAction = async (ruleId: string) => {
  try {
    const result = await sendEmailCampaign(ruleId);
    revalidatePath("/campaigns");
    return result;
  } catch (error) {
    console.error("Error launching campaign:", error);
    return { success: false, message: "Failed to launch campaign" };
  }
};

export const getRuleRunsAction = async () => {
  return await getRuleRuns();
};

export const getRuleRunAction = async (runId: string) => {
  return await getRuleRun(runId);
};

export const getIncompleteRuleRunsAction = async () => {
  return await getIncompleteRuleRuns();
};
