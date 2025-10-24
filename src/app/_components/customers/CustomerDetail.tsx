import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SERVICE_TYPE_LABELS } from "@/constants/rules";
import {
  ArrowLeft,
  Mail,
  Phone,
  Car,
  Calendar,
  Wrench,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { getCustomerAction } from "@/app/_actions/customers";
import { AppointmentCard } from "./AppointmentCard";

type Customer = NonNullable<Awaited<ReturnType<typeof getCustomerAction>>>;

interface CustomerDetailProps {
  customer: Customer;
}

export function CustomerDetail({ customer }: CustomerDetailProps) {
  const fullName = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(" ") || "No name";

  const initials = [customer.firstName?.[0], customer.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "?";

  return (
    <>
      <div className="mb-6">
        <Link href="/customers">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </Link>

        <div className="flex items-start gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-3xl flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              {fullName}
            </h1>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{customer.phone}</span>
                </div>
              )}
              <div className="text-sm text-muted-foreground mt-2">
                Customer since {new Date(customer.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customer.vehicles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No vehicles registered</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customer.vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-lg">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <div className="text-sm text-muted-foreground space-y-1 mt-2">
                        {vehicle.vin && (
                          <p>
                            <span className="font-medium">VIN:</span> {vehicle.vin}
                          </p>
                        )}
                        {vehicle.plate && (
                          <p>
                            <span className="font-medium">Plate:</span> {vehicle.plate}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{vehicle.appointments.length} appointments</p>
                      <p>{vehicle.serviceHistory.length} services</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customer.allAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No appointments scheduled</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customer.allAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customer.conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customer.conversations.map(({ firstEmail, threadId, replyCount }) => (
                <Link
                  key={threadId}
                  href={`/conversations/${threadId}`}
                  className="block border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">{firstEmail.subject}</p>
                        {replyCount > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {replyCount} {replyCount === 1 ? "reply" : "replies"}
                          </span>
                        )}
                      </div>
                      {firstEmail.vehicle && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Car className="h-4 w-4" />
                          <p>
                            {firstEmail.vehicle.make} {firstEmail.vehicle.model}{" "}
                            {firstEmail.vehicle.year}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {new Date(firstEmail.queuedAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Service History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customer.allServiceHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No service history</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customer.allServiceHistory.map((service) => (
                <div
                  key={service.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">
                        {SERVICE_TYPE_LABELS[service.service]}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Car className="h-4 w-4" />
                        <p>
                          {service.vehicle.make} {service.vehicle.model}{" "}
                          {service.vehicle.year}
                        </p>
                      </div>
                      {service.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {service.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {new Date(service.performedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

