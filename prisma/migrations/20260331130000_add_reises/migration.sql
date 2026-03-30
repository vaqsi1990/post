-- CreateTable
CREATE TABLE "reises" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originCountry" TEXT NOT NULL,
    "destinationCountry" TEXT NOT NULL DEFAULT 'GE',
    "departureAt" TIMESTAMP(3),
    "arrivalAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reises_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "parcels" ADD COLUMN "reisId" TEXT;

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_reisId_fkey" FOREIGN KEY ("reisId") REFERENCES "reises"("id") ON DELETE SET NULL ON UPDATE CASCADE;
