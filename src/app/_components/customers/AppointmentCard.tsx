"use client";

import { Car, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SERVICE_TYPE_LABELS } from "@/constants/rules";
import { APPOINTMENT_STATUS_LABELS } from "@/constants/appointment";
import { updateAppointmentStatusAction } from "@/app/_actions/appointments";
import { AppointmentStatus } from "@prisma/client";
import { Appointment } from "@/server/interfaces/appointment";

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const handleUpdateStatus = (status: AppointmentStatus) => {
    updateAppointmentStatusAction(appointment.id, status);
  };

  const isBooked = appointment.status === AppointmentStatus.BOOKED;

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-medium">
              {SERVICE_TYPE_LABELS[appointment.service]}
            </p>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                appointment.status === "COMPLETED"
                  ? "bg-green-100 text-green-700"
                  : appointment.status === "CANCELLED"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {APPOINTMENT_STATUS_LABELS[appointment.status]}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Car className="h-4 w-4" />
            <p>
              {appointment.vehicle.make} {appointment.vehicle.model}{" "}
              {appointment.vehicle.year}
            </p>
          </div>
          {appointment.notes && (
            <p className="text-sm text-muted-foreground mt-2">
              {appointment.notes}
            </p>
          )}

          {isBooked && (
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateStatus("COMPLETED")}
                className="text-green-700 border-green-200 hover:bg-green-50"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Complete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateStatus("CANCELLED")}
                className="text-red-700 border-red-200 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          )}
        </div>
        <div className="text-right text-sm">
          <p className="font-medium">
            {new Date(appointment.startsAt).toLocaleDateString()}
          </p>
          <p className="text-muted-foreground">
            {new Date(appointment.startsAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
