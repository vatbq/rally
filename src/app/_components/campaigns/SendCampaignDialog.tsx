"use client";

import { useState, use, Suspense } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Send,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
} from "lucide-react";
import {
  sendEmailCampaignAction,
  scheduleEmailCampaignAction,
} from "@/app/_actions/campaigns";
import { Cohort } from "@/server/interfaces/rules";
import {
  CampaignFormData,
  campaignFormSchema,
  Mode,
} from "@/schemas/campaigns";

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

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      mode: Mode.NOW,
      scheduledDate: "",
      scheduledTime: "",
      timezone: "America/Los_Angeles",
    },
  });

  const mode = form.watch("mode");

  const onSubmit = async (data: CampaignFormData) => {
    setLoading(true);
    setResult(null);

    try {
      if (data.mode === Mode.NOW) {
        await sendEmailCampaignAction(ruleId);

        setResult({
          success: true,
          message: "Campaign launched successfully!",
        });

        setOpen(false);
        setResult(null);
        form.reset();
      } else {
        const scheduledFor = new Date(
          `${data.scheduledDate}T${data.scheduledTime}`,
        );

        const response = await scheduleEmailCampaignAction(
          ruleId,
          scheduledFor,
          data.timezone,
        );

        if (response.success) {
          setResult({
            success: true,
            message: "Campaign scheduled successfully!",
          });
          setTimeout(() => {
            setOpen(false);
            setResult(null);
            form.reset();
          }, 1500);
        } else {
          setResult({
            success: false,
            message: response.message || "Failed to schedule campaign",
          });
        }
      }
    } catch {
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
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

            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => form.setValue("mode", Mode.NOW)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === Mode.NOW
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                }`}
              >
                <Send className="h-4 w-4" />
                Send Now
              </button>
              <button
                type="button"
                onClick={() => form.setValue("mode", Mode.SCHEDULE)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === Mode.SCHEDULE
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                }`}
              >
                <Clock className="h-4 w-4" />
                Schedule
              </button>
            </div>

            {mode === Mode.SCHEDULE && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          min={new Date().toLocaleDateString().split("T")[0]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scheduledTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Time
                      </FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-xs text-muted-foreground">
                  Timezone: {form.watch("timezone")}
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                {mode === Mode.NOW ? "This will:" : "This will schedule:"}
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Create personalized emails for each eligible customer</li>
                <li>
                  {mode === Mode.NOW
                    ? "Queue emails for sending (simulated)"
                    : "Schedule emails to be sent at the specified time"}
                </li>
                <li>
                  Automatically progress through queued → sent → delivered
                  states
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || (result?.success ?? false)}
              >
                {loading
                  ? mode === Mode.SCHEDULE
                    ? "Launching..."
                    : "Scheduling..."
                  : mode === Mode.NOW
                    ? "Launch Now"
                    : "Schedule Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
