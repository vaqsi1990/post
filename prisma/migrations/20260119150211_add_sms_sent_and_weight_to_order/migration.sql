-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "smsSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "weight" TEXT NOT NULL DEFAULT '';
