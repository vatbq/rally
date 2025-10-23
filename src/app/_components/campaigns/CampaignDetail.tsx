"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SERVICE_TYPE_LABELS } from "@/constants/rules";
import {
  Activity,
  ArrowLeft,
  CheckCircle,
  Clock,
  Mail,
  Send,
  User,
  Car,
} from "lucide-react";
import Link from "next/link";
import { getRuleRunAction } from "@/app/_actions/rules";

type Campaign = NonNullable<Awaited<ReturnType<typeof getRuleRunAction>>>;

interface CampaignDetailProps {
  initialCampaign: Campaign;
  campaignId: string;
}

export function CampaignDetail({
  initialCampaign,
  campaignId,
}: CampaignDetailProps) {
  const [campaign, setCampaign] = useState(initialCampaign);

  useEffect(() => {
    if (campaign.completedAt) {
      return;
    }

    const interval = setInterval(async () => {
      const updated = await getRuleRunAction(campaignId);
      if (updated) {
        setCampaign(updated);

        if (updated.completedAt) {
          clearInterval(interval);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [campaignId, campaign.completedAt]);

  const queuedEmails = campaign.Email.filter((e) => !e.sentAt);
  const sentEmails = campaign.Email.filter((e) => e.sentAt && !e.deliveredAt);
  const deliveredEmails = campaign.Email.filter((e) => e.deliveredAt);

  const getEmailStatus = (email: (typeof campaign.Email)[0]) => {
    if (email.deliveredAt) {
      return {
        label: "Delivered",
        icon: CheckCircle,
        color: "text-green-600",
        bg: "bg-green-100",
      };
    }
    if (email.sentAt) {
      return {
        label: "Sent",
        icon: Send,
        color: "text-blue-600",
        bg: "bg-blue-100",
      };
    }
    return {
      label: "Queued",
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-100",
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/campaigns">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Activity className="h-8 w-8" />
              {campaign.rule.name}
            </h1>
            <p className="text-muted-foreground">
              {SERVICE_TYPE_LABELS[campaign.rule.service]} • Started{" "}
              {new Date(campaign.startedAt).toLocaleString()}
            </p>
          </div>
          {!campaign.completedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              Live Updates
            </div>
          )}
          {campaign.completedAt && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Completed • {new Date(campaign.completedAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Emails</p>
                <p className="text-3xl font-bold">{campaign.Email.length}</p>
              </div>
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Queued</p>
                <p className="text-3xl font-bold text-orange-600">
                  {queuedEmails.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-3xl font-bold text-blue-600">
                  {sentEmails.length}
                </p>
              </div>
              <Send className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-3xl font-bold text-green-600">
                  {deliveredEmails.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email List */}
      <Card>
        <CardHeader>
          <CardTitle>Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {campaign.Email.map((email) => {
              const status = getEmailStatus(email);
              const StatusIcon = status.icon;

              return (
                <div
                  key={email.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {email.customer.firstName} {email.customer.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {email.toAddress}
                          </p>
                        </div>
                      </div>

                      {email.vehicle && (
                        <div className="flex items-center gap-3 text-sm">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {email.vehicle.make} {email.vehicle.model}{" "}
                            {email.vehicle.year}
                          </p>
                        </div>
                      )}

                      <div className="text-sm">
                        <p className="font-medium text-muted-foreground">
                          {email.subject}
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>

                      <div className="text-xs text-muted-foreground">
                        {email.deliveredAt ? (
                          <>
                            Delivered:{" "}
                            {new Date(email.deliveredAt).toLocaleString()}
                          </>
                        ) : email.sentAt ? (
                          <>Sent: {new Date(email.sentAt).toLocaleString()}</>
                        ) : (
                          <>
                            Queued: {new Date(email.queuedAt).toLocaleString()}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
