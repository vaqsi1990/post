-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'EMPLOYEE';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "roomNumber" DROP NOT NULL;

-- RenameIndex
ALTER INDEX "users_poNumber_key" RENAME TO "users_roomNumber_key";
