"use client";

import { useActionState, startTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Car, Mail, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  getConversationAction,
  generateAIReplyAction,
} from "@/app/_actions/conversations";
import { ConversationChat } from "./ConversationChat";

type Emails = Awaited<ReturnType<typeof getConversationAction>>;

interface ConversationViewProps {
  threadId: string;
  initialEmails: Emails;
}

export function ConversationView({
  threadId,
  initialEmails,
}: ConversationViewProps) {
  const [, action, isGeneratingReply] = useActionState(async () => {
    await generateAIReplyAction(threadId);
  }, null);

  const firstEmail = initialEmails[0];

  if (!firstEmail) {
    return null;
  }

  const lastEmail = initialEmails[initialEmails.length - 1];
  const customer = firstEmail?.customer;
  const vehicle = firstEmail?.vehicle;

  return (
    <>
      <Link href="/campaigns">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-lg">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {customer.email}
                    </p>
                  </div>
                </div>

                {vehicle && (
                  <div className="flex items-center gap-3">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                  </div>
                )}

                {firstEmail.rule && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Campaign: {firstEmail.rule.name}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => startTransition(action)}
            disabled={isGeneratingReply}
            className="gap-2 w-full"
          >
            {isGeneratingReply ? (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {lastEmail?.isReply
                  ? "Reply to Customer"
                  : "Simulate Customer Reply"}
              </>
            )}
          </Button>
        </div>

        <div className="lg:col-span-2">
          <ConversationChat
            emails={initialEmails}
            isGeneratingReply={isGeneratingReply}
          />
        </div>
      </div>
    </>
  );
}
