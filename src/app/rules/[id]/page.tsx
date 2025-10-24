import { getRuleAction, previewRuleCohortAction } from "@/app/_actions/rules";
import { RuleDetail } from "@/app/_components/rules/RuleDetail";
import { notFound } from "next/navigation";

export default async function RuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rule = await getRuleAction(id);
  const cohort = previewRuleCohortAction(id);

  if (!rule) {
    notFound();
  }

  return <RuleDetail rule={rule} ruleId={id} cohort={cohort} />;
}
