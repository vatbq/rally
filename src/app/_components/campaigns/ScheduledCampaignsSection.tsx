import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { type ScheduledCampaign } from "@/server/interfaces/campaigns";
import { ScheduledCampaignItem } from "./ScheduledCampaignItem";

interface ScheduledCampaignsSectionProps {
  scheduledCampaigns: ScheduledCampaign[];
}

export function ScheduledCampaignsSection({
  scheduledCampaigns,
}: ScheduledCampaignsSectionProps) {
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
