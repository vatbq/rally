"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { type ScheduledCampaign } from "@/server/interfaces/campaigns";
import { ScheduledCampaignItem } from "./ScheduledCampaignItem";
import { getScheduledCampaignsAction } from "@/app/_actions/campaigns";

interface ScheduledCampaignsSectionProps {
  scheduledCampaigns: ScheduledCampaign[];
}

export function ScheduledCampaignsSection({
  scheduledCampaigns: initialScheduledCampaigns,
}: ScheduledCampaignsSectionProps) {
  const [scheduledCampaigns, setScheduledCampaigns] = useState<
    ScheduledCampaign[]
  >(initialScheduledCampaigns);

  useEffect(() => {
    if (scheduledCampaigns.length === 0) {
      return;
    }

    const interval = setInterval(async () => {
      const updated = await getScheduledCampaignsAction();
      if (updated) {
        setScheduledCampaigns(updated);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [scheduledCampaigns.length]);

  if (scheduledCampaigns.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Scheduled Campaigns
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {scheduledCampaigns.map((item) => (
            <ScheduledCampaignItem key={item.id} campaign={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
