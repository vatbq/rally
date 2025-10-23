/**
 * Adds seed data to your db
 *
 * @see https://www.db.io/docs/guides/database/seed-database
 */
import { db } from "@/server/db";

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.email.deleteMany();
  await db.ruleTarget.deleteMany();
  await db.ruleRun.deleteMany();
  await db.appointment.deleteMany();
  await db.serviceHistory.deleteMany();
  await db.rule.deleteMany();
  await db.vehicle.deleteMany();
  await db.customer.deleteMany();

  // Create customers
  const customer1 = await db.customer.create({
    data: {
      email: "john.smith@example.com",
      firstName: "John",
      lastName: "Smith",
      phone: "+1-555-0101",
    },
  });

  const customer2 = await db.customer.create({
    data: {
      email: "sarah.johnson@example.com",
      firstName: "Sarah",
      lastName: "Johnson",
      phone: "+1-555-0102",
    },
  });

  const customer3 = await db.customer.create({
    data: {
      email: "mike.davis@example.com",
      firstName: "Mike",
      lastName: "Davis",
      phone: "+1-555-0103",
    },
  });

  console.log("✅ Created customers");

  // Create vehicles
  const vehicle1 = await db.vehicle.create({
    data: {
      vin: "1HGCM82633A123456",
      plate: "ABC1234",
      make: "Honda",
      model: "Accord",
      year: 2019,
      customerId: customer1.id,
    },
  });

  const vehicle2 = await db.vehicle.create({
    data: {
      vin: "5FNRL5H40BB123456",
      plate: "XYZ5678",
      make: "Toyota",
      model: "Camry",
      year: 2021,
      customerId: customer1.id,
    },
  });

  const vehicle3 = await db.vehicle.create({
    data: {
      vin: "1FMCU0G64JUA12345",
      plate: "DEF9012",
      make: "Ford",
      model: "F-150",
      year: 2020,
      customerId: customer2.id,
    },
  });

  const _vehicle4 = await db.vehicle.create({
    data: {
      vin: "2T1BURHE5GC123456",
      plate: "GHI3456",
      make: "Tesla",
      model: "Model 3",
      year: 2022,
      customerId: customer3.id,
    },
  });

  console.log("✅ Created vehicles");

  // Create service history
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  await db.serviceHistory.create({
    data: {
      vehicleId: vehicle1.id,
      service: "OIL_CHANGE",
      performedAt: threeMonthsAgo,
      notes: "Synthetic oil, new filter",
    },
  });

  await db.serviceHistory.create({
    data: {
      vehicleId: vehicle1.id,
      service: "TIRE_ROTATION",
      performedAt: sixMonthsAgo,
      notes: "All tires rotated, pressure checked",
    },
  });

  await db.serviceHistory.create({
    data: {
      vehicleId: vehicle2.id,
      service: "ROUTINE_MAINTENANCE",
      performedAt: threeMonthsAgo,
      notes: "30,000 mile service - oil change, tire rotation, inspections",
    },
  });

  await db.serviceHistory.create({
    data: {
      vehicleId: vehicle3.id,
      service: "BRAKE_INSPECTION",
      performedAt: oneYearAgo,
      notes: "Brake pads at 40%, rotors good",
    },
  });

  await db.serviceHistory.create({
    data: {
      vehicleId: vehicle3.id,
      service: "OIL_CHANGE",
      performedAt: sixMonthsAgo,
      notes: "Conventional oil, new filter",
    },
  });

  console.log("✅ Created service history");

  // Create rules
  const oilChangeRule = await db.rule.create({
    data: {
      name: "Oil Change Reminder",
      service: "OIL_CHANGE",
      cadenceMonths: 3,
      sendWindowDays: 7,
      sendWindowHours: 0,
      timezone: "America/Los_Angeles",
      enabled: true,
      emailTemplate: `Hi {firstName},

It's time for your {year} {make} {model}'s oil change! 

Your last oil change was {lastServiceDate}, and we recommend getting one every {cadenceMonths} months.

Schedule your appointment today!

Best regards,
Rally Auto Service`,
    },
  });

  const _tireRotationRule = await db.rule.create({
    data: {
      name: "Tire Rotation Reminder",
      service: "TIRE_ROTATION",
      cadenceMonths: 6,
      sendWindowDays: 14,
      sendWindowHours: 0,
      timezone: "America/Los_Angeles",
      enabled: true,
      emailTemplate: `Hi {firstName},

It's been {cadenceMonths} months since your last tire rotation for your {year} {make} {model}.

Regular tire rotations help extend tire life and ensure even wear.

Book your appointment now!

Best regards,
Rally Auto Service`,
    },
  });

  const _brakeInspectionRule = await db.rule.create({
    data: {
      name: "Brake Inspection Reminder",
      service: "BRAKE_INSPECTION",
      cadenceMonths: 12,
      sendWindowDays: 30,
      sendWindowHours: 0,
      timezone: "America/Los_Angeles",
      enabled: true,
      emailTemplate: `Hi {firstName},

Safety first! It's time for your annual brake inspection for your {year} {make} {model}.

Your last inspection was {lastServiceDate}.

Schedule your brake inspection today!

Best regards,
Rally Auto Service`,
    },
  });

  console.log("✅ Created rules");

  // Create appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 0, 0, 0);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(9, 0, 0, 0);

  await db.appointment.create({
    data: {
      vehicleId: vehicle1.id,
      service: "OIL_CHANGE",
      startsAt: tomorrow,
      endsAt: new Date(tomorrow.getTime() + 60 * 60 * 1000), // 1 hour later
      status: "BOOKED",
      notes: "Customer requested synthetic oil",
    },
  });

  await db.appointment.create({
    data: {
      vehicleId: vehicle3.id,
      service: "BRAKE_INSPECTION",
      startsAt: nextWeek,
      endsAt: new Date(nextWeek.getTime() + 90 * 60 * 1000), // 1.5 hours later
      status: "BOOKED",
      notes: "Customer mentioned squeaking noise",
    },
  });

  await db.appointment.create({
    data: {
      vehicleId: vehicle2.id,
      service: "TIRE_ROTATION",
      startsAt: yesterday,
      endsAt: new Date(yesterday.getTime() + 45 * 60 * 1000), // 45 minutes later
      status: "COMPLETED",
      notes: "Service completed successfully",
    },
  });

  console.log("✅ Created appointments");

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
