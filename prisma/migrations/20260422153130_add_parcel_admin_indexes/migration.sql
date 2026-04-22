-- Add indexes used by the admin parcels list (status filter + createdAt/originCountry ordering)
CREATE INDEX "parcels_status_createdAt_desc_idx" ON "parcels" ("status", "createdAt" DESC);
CREATE INDEX "parcels_status_originCountry_createdAt_desc_idx" ON "parcels" ("status", "originCountry", "createdAt" DESC);

