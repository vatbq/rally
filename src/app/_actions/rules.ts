"use server";

import { getRules, previewRuleCohort } from "@/server/services/rules";

export const getRulesAction = async () => {
  return await getRules();
};

export const previewRuleCohortAction = async (
  ruleId: string
) => {
  return await previewRuleCohort(ruleId);
};
