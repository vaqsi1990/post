-- AlterTable
ALTER TABLE "declarations" ALTER COLUMN "currency" SET DEFAULT 'GEL';

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'GEL';

-- AlterTable
ALTER TABLE "parcels" ALTER COLUMN "currency" SET DEFAULT 'GEL';

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "currency" SET DEFAULT 'GEL';

-- AlterTable
ALTER TABLE "tariffs" ALTER COLUMN "currency" SET DEFAULT 'GEL';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0;
