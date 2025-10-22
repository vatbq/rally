import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import RulesDashboard from "@/app/_components/rules/RulesDashboard";
import { RuleCardSkeleton } from "@/app/_components/rules/RuleCardSkeleton";

export default async function RulesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rules</h1>
        <Link href="/rules/new">
          <Button>Create New Rule</Button>
        </Link>
      </div>
      <Suspense fallback={<RuleDashboardSkeleton />}>
        <RulesDashboard />
      </Suspense>
    </div>
  );
}

const RuleDashboardSkeleton = () => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
      {[...Array(6)].map((_, index) => (
        <RuleCardSkeleton key={index} />
      ))}
    </div>
  );
};
