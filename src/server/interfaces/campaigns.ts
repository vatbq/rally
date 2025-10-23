import { Email, Rule, RuleRun } from "@prisma/client";

export interface Campaign extends RuleRun {
  rule: Rule;
  emails: Email[];
  _count: {
    emails: number;
    ruleTargets: number;
  };
}
