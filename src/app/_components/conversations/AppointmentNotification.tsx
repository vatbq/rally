import { Calendar, CheckCircle2 } from "lucide-react";
import { SERVICE_TYPE_LABELS } from "@/constants/rules";

interface AppointmentNotificationProps {
  startsAt: Date;
  service: keyof typeof SERVICE_TYPE_LABELS;
}

export function AppointmentNotification({
  startsAt,
  service,
}: AppointmentNotificationProps) {
  return (
    <div className="flex justify-center my-3">
      <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2 max-w-sm">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-green-900 mb-1">
              Appointment Booked
            </p>
            <div className="flex items-center gap-3 text-xs text-green-700">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(startsAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <span>
                {new Date(startsAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

