/*
  Warnings:

  - Added the required column `customerName` to the `parcels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `onlineShop` to the `parcels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `parcels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "parcels" ADD COLUMN     "comment" TEXT,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "onlineShop" TEXT NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ALTER COLUMN "originCountry" DROP NOT NULL,
ALTER COLUMN "originAddress" DROP NOT NULL,
ALTER COLUMN "weight" DROP NOT NULL;
