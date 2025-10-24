"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SERVICE_TYPE_LABELS } from "@/constants/rules";
import {
  ArrowLeft,
  Activity,
  Mail,
  Clock,
  CheckCircle,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getRuleAction, previewRuleCohortAction } from "@/app/_actions/rules";
import { SendCampaignDialog } from "../campaigns/SendCampaignDialog";
import { ScheduledCampaignsSection } from "../campaigns/ScheduledCampaignsSection";
import { CohortPreviewDialog } from "./CohortPreviewDialog";

type Rule = NonNullable<Awaited<ReturnType<typeof getRuleAction>>>;
type Cohort = Awaited<ReturnType<typeof previewRuleCohortAction>>;

interface RuleDetailProps {
  rule: Rule;
  ruleId: string;
  cohort: Promise<Cohort>;
}

export function RuleDetail({ rule, ruleId, cohort }: RuleDetailProps) {
  const router = useRouter();

  const totalCampaigns = rule.runs.length;

  const completedCampaigns = rule.runs.filter((run) => run.completedAt).length;

  const totalEmails = rule.runs.reduce(
    (sum, run) => sum + run.emails.length,
    0,
  );

  const deliveredEmails = rule.runs.reduce(
    (sum, run) => sum + run.emails.filter((email) => email.deliveredAt).length,
    0,
  );

  return (
    <>
      <div className="mb-6">
        <Link href="/rules">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Rules
          </Button>
        </Link>
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Settings className="h-8 w-8" />
                {rule.name}
                 <span
              className={`px-2 py-1 rounded-full text-xs mt-1 font-medium ${
                rule.enabled
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {rule.enabled ? "Enabled" : "Disabled"}
            </span>
              </h1>
              <p className="text-muted-foreground">
                {SERVICE_TYPE_LABELS[rule.service]} • Created{" "}
                {new Date(rule.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CohortPreviewDialog ruleName={rule.name} cohort={cohort} />
            {rule.enabled && (
              <SendCampaignDialog
                ruleId={ruleId}
                ruleName={rule.name}
                cohort={cohort}
              />
            )}
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Frequency</p>
              <p className="text-lg font-medium">
                Every {rule.cadenceMonths}{" "}
                {rule.cadenceMonths === 1 ? "month" : "months"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Send Window</p>
              <p className="text-lg font-medium">
                {rule.sendWindowDays} days at {rule.sendWindowHours}:00
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Timezone</p>
              <p className="text-lg font-medium">{rule.timezone}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Email Template</p>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm whitespace-pre-wrap font-mono">
                {rule.emailTemplate}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
                <p className="text-3xl font-bold">{totalCampaigns}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {completedCampaigns}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Emails</p>
                <p className="text-3xl font-bold">{totalEmails}</p>
              </div>
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-3xl font-bold text-blue-600">
                  {deliveredEmails}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {rule.scheduledCampaigns.length > 0 && (
        <ScheduledCampaignsSection
          scheduledCampaigns={rule.scheduledCampaigns.map((sc) => ({
            ...sc,
            rule: rule,
          }))}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Campaign History</CardTitle>
        </CardHeader>
        <CardContent>
          {totalCampaigns === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No campaigns have been run yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rule.runs.map((run) => {
                const isCompleted = run.completedAt !== null;
                const emailCount = run.emails.length;
                const deliveredCount = run.emails.filter(
                  (e) => e.deliveredAt,
                ).length;

                return (
                  <div
                    key={run.id}
                    onClick={() => router.push(`/campaigns/${run.id}`)}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-orange-600 animate-pulse" />
                          )}
                          <div>
                            <p className="font-medium">
                              Campaign from{" "}
                              {new Date(run.startedAt).toLocaleString()}
                            </p>
                            {isCompleted && (
                              <p className="text-sm text-muted-foreground">
                                Completed:{" "}
                                {new Date(run.completedAt!).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Emails
                            </p>
                            <p className="text-lg font-bold">{emailCount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Delivered
                            </p>
                            <p className="text-lg font-bold text-green-600">
                              {deliveredCount}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
