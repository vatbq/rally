import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const CustomerCardSkeleton = () => {
  return (
    <Card className="max-w-[300px]">
      <CardHeader className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Skeleton className="h-6 w-36 mb-2" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <div>
            <Skeleton className="h-3 w-12 mb-1" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div>
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div>
            <Skeleton className="h-3 w-20 mb-1" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
