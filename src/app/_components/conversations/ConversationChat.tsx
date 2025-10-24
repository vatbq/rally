"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Send, MessageCircle } from "lucide-react";
import { getConversationAction } from "@/app/_actions/conversations";
import { AppointmentNotification } from "./AppointmentNotification";

type Emails = Awaited<ReturnType<typeof getConversationAction>>;

interface ConversationViewProps {
  emails: Emails;
}

export function ConversationChat({ emails }: ConversationViewProps) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [emails]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <MessageCircle className="h-5 w-5" />
          Conversation ({emails.length}{" "}
          {emails.length === 1 ? "message" : "messages"})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[530px] overflow-y-auto pr-2">
          {emails.map((email, index) => {
            const isCustomerReply = email.isReply;
            const appointmentBooked = email.appointments[0]; // get the first appointment for this email

            return (
              <div key={email.id}>
                <div
                  className={`flex ${isCustomerReply ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      isCustomerReply
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {isCustomerReply ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span className="font-semibold text-sm">
                        {isCustomerReply
                          ? `${emails[0].customer.firstName || "Customer"}`
                          : "Dealership"}
                      </span>
                    </div>

                    {index === 0 && (
                      <p className="font-semibold mb-2">{email.subject}</p>
                    )}

                    <div className="whitespace-pre-wrap text-sm">
                      {email.body}
                    </div>

                    <div className="mt-3 pt-3 border-t border-current/20 text-xs opacity-70">
                      {email.deliveredAt ? (
                        <>
                          Delivered:{" "}
                          {new Date(email.deliveredAt).toLocaleString()}
                        </>
                      ) : email.sentAt ? (
                        <>Sent: {new Date(email.sentAt).toLocaleString()}</>
                      ) : (
                        <>Queued: {new Date(email.queuedAt).toLocaleString()}</>
                      )}
                    </div>
                  </div>
                </div>

                {appointmentBooked && (
                  <AppointmentNotification
                    startsAt={appointmentBooked.startsAt}
                    service={appointmentBooked.service}
                  />
                )}
              </div>
            );
          })}
          <div ref={endOfMessagesRef} />
        </div>
      </CardContent>
    </Card>
  );
}
