import { db } from "../db";
import { Appointment, AppointmentStatus, ServiceType } from "@prisma/client";

interface CreateAppointmentFromConversationParams {
  vehicleId: string;
  serviceType: ServiceType;
  threadId: string;
  startsAt: string;
  endsAt: string;
}

export async function createAppointmentFromConversation({
  vehicleId,
  serviceType,
  threadId,
  startsAt,
  endsAt,
}: CreateAppointmentFromConversationParams): Promise<Appointment> {
  const startTime = new Date(startsAt);
  const endTime = new Date(endsAt);

  const appointment = await db.appointment.create({
    data: {
      vehicleId,
      service: serviceType,
      startsAt: startTime,
      endsAt: endTime,
      status: AppointmentStatus.BOOKED,
      threadId: threadId,
      notes: "Booked via AI conversation",
    },
  });

  return appointment;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
): Promise<Appointment> {
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const updatedAppointment = await db.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });

  if (status === AppointmentStatus.COMPLETED) {
    await db.serviceHistory.create({
      data: {
        vehicleId: appointment.vehicleId,
        service: appointment.service,
        performedAt: appointment.startsAt,
        notes: appointment.notes,
      },
    });
  }

  return updatedAppointment;
}
