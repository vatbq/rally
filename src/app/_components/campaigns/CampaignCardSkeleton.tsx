import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CampaignCardSkeleton = () => {
  return (
    <Card className="max-w-[300px]">
      <CardHeader className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        <Skeleton className="h-4 w-24" />

        <div className="space-y-2 pt-1 border-t">
          <div>
            <Skeleton className="h-3 w-12 mb-1" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div>
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default CampaignCardSkeleton;

