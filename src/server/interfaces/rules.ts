import { Customer, ServiceHistory, Vehicle } from "@prisma/client";

export interface CohortMemberVehicle extends Omit<Vehicle, "id"> {
  vehicleId: string;
  customer: Omit<Customer, "createdAt">;
  lastService: Omit<ServiceHistory, "createdAt">;
}

export type Cohort = CohortMemberVehicle[];