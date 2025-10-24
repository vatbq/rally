import { getCustomersAction } from "@/app/_actions/customers";
import CustomerCard from "./CustomerCard";
import { Customer } from "@prisma/client";

const RulesDashboard = async () => {
  const customers = await getCustomersAction();

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
      {customers.map((customer: Customer) => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  );
};

export default RulesDashboard;
