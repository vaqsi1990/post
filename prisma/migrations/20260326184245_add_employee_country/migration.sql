-- CreateEnum
CREATE TYPE "EmployeeCountry" AS ENUM ('GB', 'US', 'CN', 'IT', 'GR', 'ES', 'FR', 'DE', 'TR');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "employeeCountry" "EmployeeCountry";
