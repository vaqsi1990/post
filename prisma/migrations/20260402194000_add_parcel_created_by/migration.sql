-- AlterTable
ALTER TABLE "parcels" ADD COLUMN "createdById" TEXT;

-- CreateIndex
CREATE INDEX "parcels_createdById_idx" ON "parcels"("createdById");

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
