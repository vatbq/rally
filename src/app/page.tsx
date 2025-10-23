import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/app/_components/dashboard/DashboardStats";
import { UpcomingAppointments } from "@/app/_components/dashboard/UpcomingAppointments";
import { RecentCampaigns } from "@/app/_components/dashboard/RecentCampaigns";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex flex-col space-y-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Rally!</h1>

      <div className="flex gap-4 flex-wrap">
        <Link href="/rules/new">
          <Button>Create New Rule</Button>
        </Link>
        <Link href="/campaigns">
          <Button variant="outline">View Campaigns</Button>
        </Link>
        <Link href="/rules">
          <Button variant="outline">View Rules</Button>
        </Link>
      </div>

      <Suspense fallback={<StatsSkeletons />}>
        <DashboardStats />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<CardSkeleton />}>
          <UpcomingAppointments />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <RecentCampaigns />
        </Suspense>
      </div>
    </div>
  );
}

function StatsSkeletons() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}
