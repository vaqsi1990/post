-- Safe migration: convert parcels.status from text to enum without data loss

DO $$
BEGIN
  CREATE TYPE "ParcelStatus" AS ENUM (
    'pending',
    'in_warehouse',
    'in_transit',
    'arrived',
    'region',
    'ready_for_pickup',
    'delivered',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Normalize any legacy/unknown statuses before type conversion
UPDATE "parcels"
SET "status" = 'in_warehouse'
WHERE "status" = 'warehouse';

UPDATE "parcels"
SET "status" = 'cancelled'
WHERE "status" = 'stopped';

UPDATE "parcels"
SET "status" = 'pending'
WHERE "status" IS NULL
   OR "status" NOT IN (
     'pending',
     'in_warehouse',
     'in_transit',
     'arrived',
     'region',
     'ready_for_pickup',
     'delivered',
     'cancelled'
   );

-- Drop old text default before type conversion (Postgres cannot auto-cast defaults)
ALTER TABLE "parcels"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "parcels"
  ALTER COLUMN "status" TYPE "ParcelStatus"
  USING ("status"::text::"ParcelStatus");

ALTER TABLE "parcels"
  ALTER COLUMN "status" SET DEFAULT 'pending';

