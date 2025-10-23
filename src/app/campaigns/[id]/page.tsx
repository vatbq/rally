import { getRuleRunAction } from "@/app/_actions/rules";
import { CampaignDetail } from "@/app/_components/campaigns/CampaignDetail";
import { notFound } from "next/navigation";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await getRuleRunAction(id);

  if (!campaign) {
    notFound();
  }

  return <CampaignDetail initialCampaign={campaign} campaignId={id} />;
}
