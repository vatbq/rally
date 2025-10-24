/**
 * Adds seed data to your db
 *
 * @see https://www.db.io/docs/guides/database/seed-database
 */
import { db } from "@/server/db";

async function main() {
  await db.email.deleteMany();
  await db.ruleTarget.deleteMany();
  await db.ruleRun.deleteMany();
  await db.appointment.deleteMany();
  await db.serviceHistory.deleteMany();
  await db.rule.deleteMany();
  await db.vehicle.deleteMany();
  await db.customer.deleteMany();
  await db.recurringSchedule.deleteMany();
  await db.scheduledCampaign.deleteMany();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
