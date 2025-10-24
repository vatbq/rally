import { db } from "@/server/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, Calendar, Mail } from "lucide-react";
import { AppointmentStatus } from "@prisma/client";

async function getStats() {
  const [customersCount, vehiclesCount, appointmentsCount, emailsCount] =
    await Promise.all([
      db.customer.count(),
      db.vehicle.count(),
      db.appointment.count({
        where: {
          status: AppointmentStatus.BOOKED,
          startsAt: {
            gte: new Date(),
          },
        },
      }),
      db.email.count(),
    ]);

  return {
    customersCount,
    vehiclesCount,
    appointmentsCount,
    emailsCount,
  };
}

export async function DashboardStats() {
  const stats = await getStats();

  const statCards = [
    {
      title: "Total Customers",
      value: stats.customersCount,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Vehicles",
      value: stats.vehiclesCount,
      icon: Car,
      color: "text-green-600",
    },
    {
      title: "Upcoming Appointments",
      value: stats.appointmentsCount,
      icon: Calendar,
      color: "text-orange-600",
    },
    {
      title: "Emails Sent",
      value: stats.emailsCount,
      icon: Mail,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
