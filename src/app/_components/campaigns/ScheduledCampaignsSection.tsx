"use client";

import { useEffect, useState } from "react";
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
    <div>
      <h2 className="text-xl font-semibold mb-4">Scheduled Campaigns</h2>
      <div className="space-y-3">
        {scheduledCampaigns.map((item) => (
          <ScheduledCampaignItem key={item.id} campaign={item} />
        ))}
      </div>
    </div>
  );
}
