import { db } from "../db";
import { Customer } from "@prisma/client";

export const getCustomers = async (): Promise<Customer[]> => {
  return await db.customer.findMany({
    include: {
      vehicles: true,
    },
  });
};

// Note: Using single query with includes + JS grouping instead of multiple queries with raw SQL.
// Single round-trip has lower latency than multiple queries, and the JS processing is negligible for the planned dataset size.
export const getCustomer = async (customerId: string) => {
  const customer = await db.customer.findUnique({
    where: { id: customerId },
    include: {
      vehicles: {
        include: {
          serviceHistory: {
            orderBy: {
              performedAt: "desc",
            },
          },
          appointments: {
            orderBy: {
              startsAt: "desc",
            },
          },
        },
      },
      emails: {
        orderBy: {
          queuedAt: "asc",
        },
        include: {
          vehicle: true,
        },
      },
    },
  });

  if (!customer) return null;

  const emailThreads = new Map<string, typeof customer.emails>();
  customer.emails.forEach((email) => {
    const tid = email.threadId || email.id;
    if (!emailThreads.has(tid)) {
      emailThreads.set(tid, []);
    }
    emailThreads.get(tid)!.push(email);
  });

  const conversations = Array.from(emailThreads.values()).map((thread) => {
    const sortedThread = thread.sort(
      (a, b) => new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime(),
    );

    return {
      firstEmail: sortedThread[0]!,
      threadId: sortedThread[0]!.threadId || sortedThread[0]!.id,
      replyCount: sortedThread.length - 1,
      lastEmailAt: sortedThread[sortedThread.length - 1]!.queuedAt,
    };
  });

  conversations.sort(
    (a, b) =>
      new Date(b.lastEmailAt).getTime() - new Date(a.lastEmailAt).getTime(),
  );

  const allAppointments = customer.vehicles.flatMap((vehicle) =>
    vehicle.appointments.map((apt) => ({ ...apt, vehicle })),
  );

  const allServiceHistory = customer.vehicles.flatMap((vehicle) =>
    vehicle.serviceHistory.map((service) => ({ ...service, vehicle })),
  );

  return {
    ...customer,
    conversations,
    allAppointments,
    allServiceHistory,
  };
};
