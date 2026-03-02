/*
  Warnings:

  - A unique constraint covering the columns `[poNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `filePath` to the `parcels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "parcels" ADD COLUMN     "filePath" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "poNumber" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_poNumber_key" ON "users"("poNumber");
