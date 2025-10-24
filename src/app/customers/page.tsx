import { Suspense } from "react";
import CustomersDashboard from "../_components/customers/CustomersDashboard";
import { Skeleton } from "@/components/ui/skeleton";

const CustomersPage = async () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
      </div>
      <Suspense fallback={<CustomersDashboardSkeleton />}>
        <CustomersDashboard />
      </Suspense>
    </div>
  );
};

const CustomersDashboardSkeleton = () => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
      {[...Array(6)].map((_, index) => (
        <Skeleton key={index} />
      ))}
    </div>
  );
};

export default CustomersPage;
