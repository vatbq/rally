import { Appointment as AppointmentPrisma, Vehicle } from "@prisma/client";

export interface Appointment extends AppointmentPrisma {
  vehicle: Vehicle;
}