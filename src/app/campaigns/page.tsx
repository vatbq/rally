import {
  getCampaignsAction,
  getScheduledCampaignsAction,
} from "@/app/_actions/campaigns";
import { CampaignsDashboard } from "@/app/_components/campaigns/CampaignsDashboard";
import { ScheduledCampaignsSection } from "@/app/_components/campaigns/ScheduledCampaignsSection";
import { Suspense } from "react";
import CampaignCardSkeleton from "../_components/campaigns/CampaignCardSkeleton";

export default async function CampaignsPage() {
  const campaigns = await getCampaignsAction();
  const scheduledCampaigns = await getScheduledCampaignsAction();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Campaign Console</h1>
        <p className="text-muted-foreground">
          Monitor your email campaigns and engagement
        </p>
      </div>

      <div className="space-y-8">
        {scheduledCampaigns && scheduledCampaigns.length > 0 && (
          <ScheduledCampaignsSection scheduledCampaigns={scheduledCampaigns} />
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Active & Completed Campaigns
          </h2>
          <Suspense fallback={<CampaignsDashboardSkeleton />}>
            <CampaignsDashboard initialCampaigns={campaigns || []} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

const CampaignsDashboardSkeleton = () => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
      {[...Array(6)].map((_, index) => (
        <CampaignCardSkeleton key={index} />
      ))}
    </div>
  );
};
