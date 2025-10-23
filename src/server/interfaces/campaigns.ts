import {
  Email,
  Rule,
  RuleRun,
  ScheduledCampaign as ScheduledCampaignPrisma,
} from "@prisma/client";

export interface Campaign extends RuleRun {
  rule: Rule;
  emails: Email[];
  _count: {
    emails: number;
    ruleTargets: number;
  };
}

export interface ScheduledCampaign extends ScheduledCampaignPrisma {
  rule: Rule;
}
