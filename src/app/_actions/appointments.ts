"use server";

import { db } from "@/server/db";
import { AppointmentStatus } from "@prisma/client";

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

