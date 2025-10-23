import { Customer, Email, Rule, RuleRun, ServiceHistory, Vehicle } from "@prisma/client";

export interface CohortMemberVehicle extends Omit<Vehicle, "id"> {
  vehicleId: string;
  customer: Omit<Customer, "createdAt">;
  lastService: Omit<ServiceHistory, "createdAt">;
}

export type Cohort = CohortMemberVehicle[];

export interface Campaign extends RuleRun {
  rule: Rule;
  Email: Email[];
  _count: {
    Email: number;
    ruleTargets: number;
  };
}