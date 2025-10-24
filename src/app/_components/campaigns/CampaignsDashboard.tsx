"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { getCampaignsAction } from "@/app/_actions/campaigns";
import { type Campaign } from "@/server/interfaces/campaigns";
import CampaignCard from "./CampaignCard";

interface CampaignsDashboardProps {
  initialCampaigns: Campaign[];
}

export function CampaignsDashboard({
  initialCampaigns,
}: CampaignsDashboardProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);

  useEffect(() => {
    const interval = setInterval(async () => {
      const allCampaigns = await getCampaignsAction();
      if (allCampaigns) {
        setCampaigns(allCampaigns);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [campaigns]);

  if (!campaigns || campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
          <p className="text-muted-foreground mb-4">
            Launch your first campaign from the Rules page
          </p>
          <Link href="/rules" className="text-primary hover:underline">
            Go to Rules →
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
