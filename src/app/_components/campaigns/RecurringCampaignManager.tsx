"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Repeat,
  Pause,
  Play,
  StopCircle,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  pauseRecurringScheduleAction,
  resumeRecurringScheduleAction,
  stopRecurringScheduleAction,
  getRecurringSchedulesAction,
} from "@/app/_actions/campaigns";
import { RecurringScheduleWithRule } from "@/server/interfaces/recurring-schedules";
import { formatDateTime, formatFrequency } from "@/lib/utils";

interface RecurringCampaignManagerProps {
  initialSchedules: RecurringScheduleWithRule[];
}

export const RecurringCampaignManager = ({
  initialSchedules,
}: RecurringCampaignManagerProps) => {
  const [schedules, setSchedules] =
    useState<RecurringScheduleWithRule[]>(initialSchedules);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const allSchedules = await getRecurringSchedulesAction();
      if (allSchedules) {
        setSchedules(allSchedules);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handlePause = async (id: string) => {
    setLoading(id);
    setError(null);
    try {
      const result = await pauseRecurringScheduleAction(id);
      if (!result.success) {
        setError(result.message || "Failed to pause schedule");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(null);
    }
  };

  const handleResume = async (id: string) => {
    setLoading(id);
    setError(null);
    try {
      const result = await resumeRecurringScheduleAction(id);
      if (!result.success) {
        setError(result.message || "Failed to resume schedule");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(null);
    }
  };

  const handleStop = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to stop this recurring schedule? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading(id);
    setError(null);
    try {
      const result = await stopRecurringScheduleAction(id);
      if (!result.success) {
        setError(result.message || "Failed to stop schedule");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(null);
    }
  };

  if (schedules.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Repeat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No recurring schedules configured
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Create a recurring schedule from a rule to automatically send
              campaigns
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Recurring Schedules</h2>

      {error && (
        <div className="flex items-start gap-2 p-4 rounded-lg border bg-red-50 border-red-200 text-red-900">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid gap-4">
        {schedules.map((schedule) => (
          <Card
            key={schedule.id}
            className={
              !schedule.isActive ? "opacity-60 border-dashed" : undefined
            }
          >
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{schedule.rule.name}</h3>
                      {!schedule.isActive && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                          Paused
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {schedule.rule.service.replace(/_/g, " ")}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {schedule.isActive ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePause(schedule.id)}
                        disabled={loading === schedule.id}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResume(schedule.id)}
                        disabled={loading === schedule.id}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStop(schedule.id)}
                      disabled={loading === schedule.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Repeat className="h-4 w-4" />
                      <span>Frequency</span>
                    </div>
                    <p className="font-medium">
                      {formatFrequency(
                        schedule.frequency,
                        schedule.dayOfWeek,
                        schedule.dayOfMonth,
                      )}{" "}
                      at {schedule.timeOfDay}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Next Run</span>
                    </div>
                    <p className="font-medium">
                      {schedule.nextScheduledFor
                        ? formatDateTime(schedule.nextScheduledFor)
                        : "Not scheduled"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Started</span>
                    </div>
                    <p className="font-medium">
                      {formatDateTime(schedule.startsAt)}
                    </p>
                  </div>

                  {schedule.endsAt && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Ends</span>
                      </div>
                      <p className="font-medium">
                        {formatDateTime(schedule.endsAt)}
                      </p>
                    </div>
                  )}

                  {schedule.lastExecutedAt && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Last Run</span>
                      </div>
                      <p className="font-medium">
                        {formatDateTime(schedule.lastExecutedAt)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  Timezone: {schedule.timezone}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
