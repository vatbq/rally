"use server";

import { db } from "@/server/db";
import { updateAppointmentStatus } from "@/server/services/appointments";
import { AppointmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const getUpcomingAppointmentsAction = async (limit = 5) => {
  return await db.appointment.findMany({
    where: {
      status: AppointmentStatus.BOOKED,
      startsAt: {
        gte: new Date(),
      },
    },
    include: {
      vehicle: {
        include: {
          customer: true,
        },
      },
    },
    orderBy: {
      startsAt: "asc",
    },
    take: limit,
  });
};

export const getRecentAppointmentsAction = async (limit = 5) => {
  return await db.appointment.findMany({
    include: {
      vehicle: {
        include: {
          customer: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
};

export const updateAppointmentStatusAction = async (
  appointmentId: string,
  status: AppointmentStatus,
) => {
  await updateAppointmentStatus(appointmentId, status);

  revalidatePath("/customers");
};
