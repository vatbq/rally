import { Email as EmailPrisma, Customer, Vehicle, Rule } from "@prisma/client";

export interface Email extends EmailPrisma {
  customer: Customer;
  vehicle: Vehicle;
  rule: Rule | null;
}
