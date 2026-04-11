-- CreateIndex
CREATE INDEX "parcels_userId_idx" ON "parcels"("userId");

-- CreateIndex
CREATE INDEX "parcels_status_idx" ON "parcels"("status");

-- CreateIndex
CREATE INDEX "tariffs_isActive_destinationCountry_idx" ON "tariffs"("isActive", "destinationCountry");
