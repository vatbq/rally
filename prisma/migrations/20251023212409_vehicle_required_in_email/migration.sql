/*
  Warnings:

  - Made the column `vehicleId` on table `Email` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Email" ALTER COLUMN "vehicleId" SET NOT NULL;
