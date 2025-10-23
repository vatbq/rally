import { type Rule } from "@prisma/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SERVICE_TYPE_LABELS } from "@/constants/rules";
import { CohortPreviewDialog } from "./CohortPreviewDialog";
import { SendCampaignDialog } from "./SendCampaignDialog";
import { previewRuleCohortAction } from "@/app/_actions/rules";

interface RuleCardProps {
  rule: Rule;
}

export const RuleCard = ({ rule }: RuleCardProps) => {
  const cohort = previewRuleCohortAction(rule.id);

  return (
    <Card className="hover:shadow-lg transition-all hover:scale-[1.02] h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold flex-1">{rule.name}</h3>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              rule.enabled
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {rule.enabled ? "Enabled" : "Disabled"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-0!">
          {SERVICE_TYPE_LABELS[rule.service]}
        </p>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 flex flex-col">
        <div className="space-y-3 flex-1">
          <div>
            <span className="text-xs text-muted-foreground">Frequency</span>
            <p className="text-sm font-medium">
              Every {rule.cadenceMonths}{" "}
              {rule.cadenceMonths === 1 ? "month" : "months"}
            </p>
          </div>

          <div>
            <span className="text-xs text-muted-foreground">Send Window</span>
            <p className="text-sm font-medium">
              {rule.sendWindowDays} days at {rule.sendWindowHours}:00
            </p>
          </div>

          <div>
            <span className="text-xs text-muted-foreground">Created</span>
            <p className="text-sm font-medium">
              {new Date(rule.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <CohortPreviewDialog ruleName={rule.name} cohort={cohort} />
          {rule.enabled && (
            <SendCampaignDialog
              ruleId={rule.id}
              ruleName={rule.name}
              cohort={cohort}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
