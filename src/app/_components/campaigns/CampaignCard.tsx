"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
} from "lucide-react";
import { SERVICE_TYPE_LABELS } from "@/constants/rules";
import { type Campaign } from "@/server/interfaces/rules";

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard = ({ campaign }: CampaignCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer max-w-[300px]">
      <CardHeader className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <CardTitle className="text-base truncate">
              {campaign.rule.name}
            </CardTitle>
          </div>
          {campaign.completedAt ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 flex-shrink-0">
              <CheckCircle className="h-3 w-3" />
              Done
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex-shrink-0">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
              In Progress
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {SERVICE_TYPE_LABELS[campaign.rule.service]}
        </p>

        <div className="space-y-2 pt-1 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Started</p>
            <p className="text-xs font-medium">
              {new Date(campaign.startedAt).toLocaleDateString()} at{" "}
              {new Date(campaign.startedAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          {campaign.completedAt && (
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-xs font-medium">
                {new Date(campaign.completedAt).toLocaleDateString()} at{" "}
                {new Date(campaign.completedAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};

export default CampaignCard;
