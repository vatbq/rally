"use client";

import { useState, use, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Send, Users, AlertCircle, CheckCircle } from "lucide-react";
import { sendEmailCampaignAction } from "@/app/_actions/campaigns";
import { Cohort } from "@/server/interfaces/rules";

interface SendCampaignDialogProps {
  ruleId: string;
  ruleName: string;
  cohort: Promise<Cohort>;
}

const CohortSummary = ({ cohort }: Pick<SendCampaignDialogProps, "cohort">) => {
  const data = use(cohort);

  return (
    <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <Users className="h-5 w-5 text-blue-600" />
      <span className="font-medium text-blue-900">
        {data.length} {data.length === 1 ? "customer" : "customers"} will
        receive this email
      </span>
    </div>
  );
};

export const SendCampaignDialog = ({
  ruleId,
  ruleName,
  cohort,
}: SendCampaignDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleLaunchCampaign = async () => {
    setLoading(true);
    setResult(null);

    try {
      await sendEmailCampaignAction(ruleId);
      setOpen(false);
      setResult(null);
    } catch (error) {
      setResult({
        success: false,
        message: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full mt-2">
          <Send className="h-4 w-4 mr-2" />
          Send Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Launch Campaign
          </DialogTitle>
          <DialogDescription>
            Send re-engagement emails to eligible customers for &ldquo;
            {ruleName}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {open && (
            <Suspense
              fallback={
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-sm text-muted-foreground">
                    Loading eligible customers...
                  </span>
                </div>
              }
            >
              <CohortSummary cohort={cohort} />
            </Suspense>
          )}

          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">This will:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Create personalized emails for each eligible customer</li>
              <li>Queue emails for sending (simulated)</li>
              <li>
                Automatically progress through queued → sent → delivered states
              </li>
              <li>Track responses and engagement</li>
            </ul>
          </div>

          {result && (
            <div
              className={`flex items-start gap-2 p-4 rounded-lg border ${
                result.success
                  ? "bg-green-50 border-green-200 text-green-900"
                  : "bg-red-50 border-red-200 text-red-900"
              }`}
            >
              {result.success ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-sm">{result.message}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLaunchCampaign}
            disabled={loading || (result?.success ?? false)}
          >
            {loading ? "Launching..." : "Launch Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
