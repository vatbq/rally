"use server";

import { getCustomers, getCustomer } from "@/server/services/costumers";
import { Customer } from "@prisma/client";

export const getCustomersAction = async (): Promise<Customer[]> => {
  return await getCustomers();
};

export const getCustomerAction = async (customerId: string) => {
  return await getCustomer(customerId);
};
