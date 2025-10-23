"use client";

import { Button } from "@/components/ui/button";
import { cancelScheduledCampaignAction } from "@/app/_actions/campaigns";

export function CancelScheduledCampaignButton({
  campaignId,
}: {
  campaignId: string;
}) {
  const cancelAction = async () => {
    await cancelScheduledCampaignAction(campaignId);
  };

  return (
    <form action={cancelAction}>
      <Button type="submit" variant="ghost" size="sm">
        Cancel
      </Button>
    </form>
  );
}
