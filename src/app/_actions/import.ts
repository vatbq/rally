"use server";

import { importCustomerData } from "@/server/services/data-import";

export async function importCsvData(csvContent: string) {
  try {
    const stats = await importCustomerData(csvContent);
    return { success: true, stats };
  } catch (error) {
    console.error("Error importing data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
