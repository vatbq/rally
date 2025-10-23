import { getUpcomingAppointmentsAction } from "@/app/_actions/appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SERVICE_TYPE_LABELS } from "@/constants/rules";
import { Calendar, Clock, User, Car } from "lucide-react";

export async function UpcomingAppointments() {
  const appointments = await getUpcomingAppointmentsAction(5);

  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No upcoming appointments scheduled.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Appointments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex flex-col space-y-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">
                    {appointment.vehicle.customer.firstName}{" "}
                    {appointment.vehicle.customer.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {appointment.vehicle.year} {appointment.vehicle.make}{" "}
                    {appointment.vehicle.model}
                  </span>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                {SERVICE_TYPE_LABELS[appointment.service]}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(appointment.startsAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {new Date(appointment.startsAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

