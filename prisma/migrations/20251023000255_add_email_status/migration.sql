-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED');

-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "status" "EmailStatus" NOT NULL DEFAULT 'QUEUED';
