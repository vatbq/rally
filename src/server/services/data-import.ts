import { db } from "@/server/db";
import { ServiceType } from "@prisma/client";

interface ImportRow {
  customer_email: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_phone?: string;
  vehicle_vin?: string;
  vehicle_plate?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  service_type?: string;
  service_performed_at?: string;
  service_notes?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ImportStats {
  customersCreated: number;
  customersUpdated: number;
  vehiclesCreated: number;
  serviceHistoryCreated: number;
  errors: ValidationError[];
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function parseServiceType(service?: string): ServiceType | null {
  if (!service) return null;
  const upperService = service.toUpperCase();
  if (Object.values(ServiceType).includes(upperService as ServiceType)) {
    return upperService as ServiceType;
  }
  return null;
}

function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

export async function importCustomerData(
  csvContent: string,
): Promise<ImportStats> {
  const stats: ImportStats = {
    customersCreated: 0,
    customersUpdated: 0,
    vehiclesCreated: 0,
    serviceHistoryCreated: 0,
    errors: [],
  };

  // Parse CSV
  const lines = csvContent.trim().split("\n");
  if (lines.length === 0) {
    throw new Error("CSV file is empty");
  }

  const headers = lines[0]!.split(",").map((h) => h.trim());
  const rows: ImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]!.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    rows.push(row as unknown as ImportRow);
  }

  // Process each row
  const customerCache = new Map<string, string>(); // email -> customer id
  const vehicleCache = new Map<string, string>(); // vin/plate -> vehicle id

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const rowNumber = i + 2; // +2 because of header and 0-indexing

    // Validate required fields
    if (!row.customer_email) {
      stats.errors.push({
        row: rowNumber,
        field: "customer_email",
        message: "Email is required",
      });
      continue;
    }

    if (!validateEmail(row.customer_email)) {
      stats.errors.push({
        row: rowNumber,
        field: "customer_email",
        message: "Invalid email format",
      });
      continue;
    }

    // Create or get customer
    let customerId = customerCache.get(row.customer_email);

    if (!customerId) {
      // Check if customer exists in database
      const existingCustomer = await db.customer.findUnique({
        where: { email: row.customer_email },
      });

      if (existingCustomer) {
        customerId = existingCustomer.id;
        customerCache.set(row.customer_email, customerId);

        // Update customer info if provided
        if (
          row.customer_first_name ||
          row.customer_last_name ||
          row.customer_phone
        ) {
          await db.customer.update({
            where: { id: customerId },
            data: {
              firstName: row.customer_first_name || existingCustomer.firstName,
              lastName: row.customer_last_name || existingCustomer.lastName,
              phone: row.customer_phone || existingCustomer.phone,
            },
          });
          stats.customersUpdated++;
        }
      } else {
        // Create new customer
        const newCustomer = await db.customer.create({
          data: {
            email: row.customer_email,
            firstName: row.customer_first_name || null,
            lastName: row.customer_last_name || null,
            phone: row.customer_phone || null,
          },
        });
        customerId = newCustomer.id;
        customerCache.set(row.customer_email, customerId);
        stats.customersCreated++;
      }
    }

    // Create vehicle if provided
    if (row.vehicle_vin || row.vehicle_plate) {
      const vehicleKey = row.vehicle_vin || row.vehicle_plate || "";
      let vehicleId = vehicleCache.get(vehicleKey);

      if (!vehicleId) {
        // Check if vehicle exists
        const existingVehicle = row.vehicle_vin
          ? await db.vehicle.findUnique({ where: { vin: row.vehicle_vin } })
          : row.vehicle_plate
            ? await db.vehicle.findUnique({
                where: { plate: row.vehicle_plate },
              })
            : null;

        if (existingVehicle) {
          vehicleId = existingVehicle.id;
          vehicleCache.set(vehicleKey, vehicleId);
        } else {
          // Validate year if provided
          const year = row.vehicle_year ? parseInt(row.vehicle_year, 10) : null;
          if (
            row.vehicle_year &&
            (isNaN(year!) ||
              year! < 1900 ||
              year! > new Date().getFullYear() + 1)
          ) {
            stats.errors.push({
              row: rowNumber,
              field: "vehicle_year",
              message: "Invalid year",
            });
            continue;
          }

          // Create new vehicle
          const newVehicle = await db.vehicle.create({
            data: {
              vin: row.vehicle_vin || null,
              plate: row.vehicle_plate || null,
              make: row.vehicle_make || null,
              model: row.vehicle_model || null,
              year: year,
              customerId,
            },
          });
          vehicleId = newVehicle.id;
          vehicleCache.set(vehicleKey, vehicleId);
          stats.vehiclesCreated++;
        }
      }

      // Create service history if provided
      if (row.service_type && row.service_performed_at) {
        const serviceType = parseServiceType(row.service_type);
        const performedAt = parseDate(row.service_performed_at);

        if (!serviceType) {
          stats.errors.push({
            row: rowNumber,
            field: "service_type",
            message: `Invalid service type: ${row.service_type}`,
          });
          continue;
        }

        if (!performedAt) {
          stats.errors.push({
            row: rowNumber,
            field: "service_performed_at",
            message: "Invalid date format",
          });
          continue;
        }

        await db.serviceHistory.create({
          data: {
            vehicleId,
            service: serviceType,
            performedAt,
            notes: row.service_notes || null,
          },
        });
        stats.serviceHistoryCreated++;
      }
    }
  }

  return stats;
}
