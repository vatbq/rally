"use client";

import { useState, use, Suspense } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  createRecurringScheduleAction,
} from "@/app/_actions/campaigns";
import { Cohort } from "@/server/interfaces/rules";
import {
  CampaignFormData,
  campaignFormSchema,
  Mode,
  RecurringFrequency,
} from "@/schemas/campaigns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Repeat } from "lucide-react";

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
      recurringFrequency: undefined,
      recurringTime: "",
      recurringDayOfWeek: undefined,
      recurringDayOfMonth: undefined,
      recurringStartDate: "",
      recurringEndDate: "",
      timezone: "America/Los_Angeles",
    },
  });

  const mode = form.watch("mode");
  const recurringFrequency = form.watch("recurringFrequency");

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
      } else if (data.mode === Mode.SCHEDULE) {
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
      } else if (data.mode === Mode.RECURRING) {
        // Create recurring schedule
        const startsAt = new Date(data.recurringStartDate!);

        const response = await createRecurringScheduleAction({
          ruleId,
          frequency: data.recurringFrequency as "DAILY" | "WEEKLY" | "MONTHLY",
          timeOfDay: data.recurringTime!,
          dayOfWeek: data.recurringDayOfWeek,
          dayOfMonth: data.recurringDayOfMonth,
          timezone: data.timezone,
          startsAt,
          endsAt: data.recurringEndDate
            ? new Date(data.recurringEndDate)
            : undefined,
        });

        if (response.success) {
          setResult({
            success: true,
            message: "Recurring schedule created successfully!",
          });
          setTimeout(() => {
            setOpen(false);
            setResult(null);
            form.reset();
          }, 1500);
        } else {
          setResult({
            success: false,
            message: response.message || "Failed to create recurring schedule",
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

            <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => form.setValue("mode", Mode.NOW)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === Mode.SCHEDULE
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                }`}
              >
                <Clock className="h-4 w-4" />
                Schedule
              </button>
              <button
                type="button"
                onClick={() => form.setValue("mode", Mode.RECURRING)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === Mode.RECURRING
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                }`}
              >
                <Repeat className="h-4 w-4" />
                Recurring
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

            {mode === Mode.RECURRING && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <FormField
                  control={form.control}
                  name="recurringFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={RecurringFrequency.DAILY}>
                            Daily
                          </SelectItem>
                          <SelectItem value={RecurringFrequency.WEEKLY}>
                            Weekly
                          </SelectItem>
                          <SelectItem value={RecurringFrequency.MONTHLY}>
                            Monthly
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recurringTime"
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

                {recurringFrequency === RecurringFrequency.WEEKLY && (
                  <FormField
                    control={form.control}
                    name="recurringDayOfWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day of Week</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">Sunday</SelectItem>
                            <SelectItem value="1">Monday</SelectItem>
                            <SelectItem value="2">Tuesday</SelectItem>
                            <SelectItem value="3">Wednesday</SelectItem>
                            <SelectItem value="4">Thursday</SelectItem>
                            <SelectItem value="5">Friday</SelectItem>
                            <SelectItem value="6">Saturday</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {recurringFrequency === RecurringFrequency.MONTHLY && (
                  <FormField
                    control={form.control}
                    name="recurringDayOfMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day of Month</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(
                              (day) => (
                                <SelectItem key={day} value={day.toString()}>
                                  {day}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="recurringStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Start Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recurringEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        End Date (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          min={new Date().toISOString().split("T")[0]}
                        />
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
                  ? mode === Mode.NOW
                    ? "Launching..."
                    : mode === Mode.SCHEDULE
                      ? "Scheduling..."
                      : "Creating..."
                  : mode === Mode.NOW
                    ? "Launch Now"
                    : mode === Mode.SCHEDULE
                      ? "Schedule Campaign"
                      : "Create Recurring Schedule"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
