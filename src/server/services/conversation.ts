import { EmailStatus, ServiceType, Vehicle } from "@prisma/client";
import { db } from "../db";
import {
  simulateCustomerReply,
  simulateAgentReply,
} from "./openia/conversation";
import { Confidence, detectBookingIntent } from "./openia/intent-detection";
import { createAppointmentFromConversation } from "./appointments";
import { Email } from "../interfaces/emails";

export const getConversation = async (threadId: string) => {
  const emails = await db.email.findMany({
    where: { threadId },
    include: {
      customer: true,
      vehicle: true,
      rule: true,
      appointments: true,
    },
    orderBy: {
      queuedAt: "asc",
    },
  });

  return emails;
};


export const simulateNextReply = async (threadId: string) => {
  const emails: Email[] = await db.email.findMany({
    where: { threadId },
    include: {
      customer: true,
      vehicle: true,
      rule: true,
    },
    orderBy: {
      queuedAt: "asc",
    },
  });

  if (emails.length === 0) {
    throw new Error("Thread not found");
  }

  const lastEmail = emails[emails.length - 1]!;

  if (lastEmail.isReply) {
    return await generateAgentReply(threadId, emails);
  } else {
    return await generateCustomerReply(threadId, emails);
  }
};

async function generateCustomerReply(threadId: string, emails: Email[]) {
  const firstEmail = emails[0]!;
  const customer = firstEmail.customer;
  const vehicle = firstEmail.vehicle;

  const conversationHistory = emails
    .map((email) => `${email.isReply ? "customer" : "dealer"}: ${email.body}`)
    .join("\n\n");

  const customerReply = await simulateCustomerReply(
    customer.firstName || "Customer",
    vehicle
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
      : "their vehicle",
    conversationHistory,
  );

  const replyEmail = await db.email.create({
    data: {
      threadId: threadId,
      customerId: customer.id,
      vehicleId: vehicle.id,
      toAddress: "dealer@example.com",
      subject: `Re: ${firstEmail.subject}`,
      body: customerReply,
      isReply: true,
      sentAt: new Date(),
      deliveredAt: new Date(),
      status: EmailStatus.DELIVERED, // should be QUEUED and be sent by the email worker but we're doing it here for now
    },
    include: {
      customer: true,
      vehicle: true,
    },
  });

  return replyEmail;
}

async function generateAgentReply(threadId: string, emails: Email[]) {
  const firstEmail = emails[0]!;
  const customer = firstEmail.customer;
  const vehicle = firstEmail.vehicle;
  const serviceType = firstEmail.rule?.service || ServiceType.OTHER;

  const conversationHistory = emails
    .map((email) => `${email.isReply ? "customer" : "dealer"}: ${email.body}`)
    .join("\n\n");

  const appointmentDetails = await createAppointment(firstEmail.id, conversationHistory, vehicle, serviceType);

  const agentReply = await simulateAgentReply(
    customer.firstName || "Customer",
    vehicle
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
      : "their vehicle",
    serviceType,
    conversationHistory,
    appointmentDetails,
  );

  const replyEmail = await db.email.create({
    data: {
      threadId: threadId,
      customerId: customer.id,
      vehicleId: vehicle?.id,
      toAddress: customer.email,
      subject: `Re: ${firstEmail.subject}`,
      body: agentReply,
      isReply: false,
      sentAt: new Date(),
      deliveredAt: new Date(),
      status: EmailStatus.DELIVERED,
    },
    include: {
      customer: true,
      vehicle: true,
    },
  });

  if (appointmentDetails) {
    await db.appointment.update({
      where: {
        id: appointmentDetails.id,
      },
      data: {
        threadId: replyEmail.id,
      },
    });
  }
  
  return replyEmail;
}

const createAppointment = async (firstEmailId: string, conversationHistory: string, vehicle: Vehicle, serviceType: ServiceType) => {
  const bookingIntent = await detectBookingIntent(conversationHistory);

  if (
    bookingIntent.hasIntent &&
    bookingIntent.confidence === Confidence.HIGH &&
    bookingIntent.startsAt &&
    bookingIntent.endsAt &&
    vehicle
  ) {
    // Check if appointment already exists for this email
    const recentAppointment = await db.appointment.findFirst({
      where: {
        threadId: firstEmailId,
        createdAt: {
          gte: new Date(Date.now() - 2 * 60 * 1000), // Last 2 minutes
        },
      },
    });

    if (!recentAppointment) {
      try {
        return await createAppointmentFromConversation({
          vehicleId: vehicle.id,
          serviceType: serviceType,
          threadId: firstEmailId,
          startsAt: bookingIntent.startsAt,
          endsAt: bookingIntent.endsAt,
        });
      } catch (error) {
        console.error("Error creating appointment:", error);
      }
    }
  }

  return undefined;
}
