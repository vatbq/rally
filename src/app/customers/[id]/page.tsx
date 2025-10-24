import { getCustomerAction } from "@/app/_actions/customers";
import { CustomerDetail } from "@/app/_components/customers/CustomerDetail";
import { notFound } from "next/navigation";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerAction(id);

  if (!customer) {
    notFound();
  }

  return <CustomerDetail customer={customer} />;
}
