"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { getIncompleteCampaignsAction } from "@/app/_actions/campaigns";
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
    const hasRunningCampaigns = campaigns.some((c) => !c.completedAt);

    if (!hasRunningCampaigns) {
      return;
    }

    const interval = setInterval(async () => {
      const incompleteCampaigns: Campaign[] =
        await getIncompleteCampaignsAction();

      setCampaigns((prevCampaigns) => {
        const nowCompleted = prevCampaigns
          .filter((prev) => !prev.completedAt)
          .filter(
            (prev) => !incompleteCampaigns.some((curr) => curr.id === prev.id),
          )
          .map((campaign) => ({ ...campaign, completedAt: new Date() }));

        const stillCompleted = prevCampaigns.filter((c) => c.completedAt);

        const allCampaigns = [
          ...incompleteCampaigns,
          ...nowCompleted,
          ...stillCompleted,
        ];

        return allCampaigns.sort(
          (a, b) =>
            new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
        );
      });

      if (incompleteCampaigns.length === 0) {
        clearInterval(interval);
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
    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
