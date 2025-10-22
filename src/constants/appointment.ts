import { AppointmentStatus } from "@prisma/client";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.BOOKED]: "Booked",
  [AppointmentStatus.CANCELLED]: "Cancelled",
  [AppointmentStatus.COMPLETED]: "Completed",
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.BOOKED]: "bg-blue-100 text-blue-800",
  [AppointmentStatus.CANCELLED]: "bg-red-100 text-red-800",
  [AppointmentStatus.COMPLETED]: "bg-green-100 text-green-800",
};
