import { getCampaignsAction } from "@/app/_actions/campaigns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SERVICE_TYPE_LABELS } from "@/constants/rules";
import { TrendingUp, CheckCircle, Clock, Mail } from "lucide-react";
import Link from "next/link";

export async function RecentCampaigns() {
  const allCampaigns = await getCampaignsAction();
  const campaigns = allCampaigns.slice(0, 3);

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No campaigns have been launched yet.
          </p>
          <Link
            href="/rules"
            className="inline-flex items-center text-sm text-primary hover:underline mt-2"
          >
            Create your first campaign
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recent Campaigns
        </CardTitle>
        <Link
          href="/campaigns"
          className="text-sm text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {campaigns.map((campaign) => (
          <Link
            key={campaign.id}
            href={`/campaigns/${campaign.id}`}
            className="block"
          >
            <div className="flex flex-col space-y-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="font-medium text-sm">
                    {campaign.rule.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {SERVICE_TYPE_LABELS[campaign.rule.service]}
                  </div>
                </div>
                {campaign.completedAt ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    Done
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(campaign.startedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {campaign._count.emails} emails
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
