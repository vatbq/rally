"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRules, previewRuleCohort, createRule } from "@/server/services/rules";
import { CreateRule } from "@/schemas/rules";

export const getRulesAction = async () => {
  return await getRules();
};

export const previewRuleCohortAction = async (
  ruleId: string
) => {
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
