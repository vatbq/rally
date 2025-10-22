"use client";

import { use, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Cohort } from "@/server/interfaces/rules";
import { Eye, Users } from "lucide-react";

interface CohortPreviewDialogProps {
  ruleName: string;
  cohort: Promise<Cohort>;
}

const CohortContent = ({ cohort }: Pick<CohortPreviewDialogProps, "cohort">) => {
  const data = use(cohort);

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No customers currently eligible for this rule.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {data.length} {data.length === 1 ? "customer" : "customers"} eligible
        </p>
      </div>

      <div className="space-y-2">
        {data.map((member) => (
          <div
            key={member.vehicleId}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="font-medium">{member.customer.firstName} {member.customer.lastName}</p>
                <p className="text-sm text-muted-foreground">
                  {member.customer.email}
                </p>
                <p className="text-sm font-medium text-blue-600">
                  {member.make} {member.model} {member.year}
                </p>
              </div>
              <div className="text-right">
                {member.lastService.performedAt ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Last service
                    </p>
                    <p className="text-sm font-medium">
                      {new Date(member.lastService.performedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.floor((new Date().getTime() - member.lastService.performedAt.getTime()) / (1000 * 60 * 60 * 24))} days ago
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-orange-600 font-medium">
                    No service history
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const CohortPreviewDialog = ({
  ruleName,
  cohort,
}: CohortPreviewDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-2">
          <Eye className="h-4 w-4 mr-2" />
          Preview Cohort
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Cohort Preview: {ruleName}
          </DialogTitle>
          <DialogDescription>
            Customers and vehicles currently eligible for this re-engagement rule
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {open && (
            <Suspense
              fallback={
                <div className="text-center py-8 text-muted-foreground">
                  Loading eligible customers...
                </div>
              }
            >
              <CohortContent cohort={cohort} />
            </Suspense>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};