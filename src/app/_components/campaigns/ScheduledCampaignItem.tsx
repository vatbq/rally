import { Clock, Calendar } from "lucide-react";
import { type ScheduledCampaign } from "@/server/interfaces/campaigns";
import { formatDate, formatTime, getTimeUntil } from "@/lib/utils";
import { CancelScheduledCampaignButton } from "./CancelButton";

interface ScheduledCampaignItemProps {
  campaign: ScheduledCampaign;
}

export function ScheduledCampaignItem({
  campaign,
}: ScheduledCampaignItemProps) {
  return (
    <div className="flex items-start justify-between p-4 border rounded-lg bg-muted/30">
      <div className="flex-1 space-y-2">
        <div className="flex items-start gap-3">
          <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div className="flex-1">
            <p className="font-medium">{campaign.rule.name}</p>
            <p className="text-sm text-muted-foreground">
              {campaign.rule.service.replace(/_/g, " ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm ml-7">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>
              {formatDate(campaign.scheduledFor)} at{" "}
              {formatTime(campaign.scheduledFor)}
            </span>
          </div>
          <span className="text-muted-foreground">•</span>
          <span className="text-primary font-medium">
            {getTimeUntil(campaign.scheduledFor)}
          </span>
        </div>
      </div>
      <CancelScheduledCampaignButton campaignId={campaign.id} />
    </div>
  );
}
