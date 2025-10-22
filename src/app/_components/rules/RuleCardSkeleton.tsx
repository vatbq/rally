import { Skeleton } from "@/components/ui/skeleton";

export const RuleCardSkeleton = () => {
  return (
    <div className="border rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-1" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="col-span-2">
          <Skeleton className="h-4 w-16 mb-1" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>

      <div className="mt-4">
        <Skeleton className="h-4 w-40 mb-2" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
};
