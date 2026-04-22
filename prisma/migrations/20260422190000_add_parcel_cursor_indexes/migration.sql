-- Stable keyset pagination indexes for admin parcels list
CREATE INDEX "parcels_status_createdAt_id_desc_idx" ON "parcels" ("status", "createdAt" DESC, "id" DESC);
CREATE INDEX "parcels_status_originCountry_createdAt_id_desc_idx" ON "parcels" ("status", "originCountry", "createdAt" DESC, "id" DESC);

