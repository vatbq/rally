import { getCampaignAction } from "@/app/_actions/campaigns";
import { CampaignDetail } from "@/app/_components/campaigns/CampaignDetail";
import { notFound } from "next/navigation";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await getCampaignAction(id);

  if (!campaign) {
    notFound();
  }

  return <CampaignDetail initialCampaign={campaign} campaignId={id} />;
}
