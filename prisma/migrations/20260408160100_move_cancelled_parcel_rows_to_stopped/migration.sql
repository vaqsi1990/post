-- After 'stopped' exists: unify legacy cancelled rows into stopped (გაჩერებული)
UPDATE "parcels"
SET "status" = 'stopped'
WHERE "status" = 'cancelled';
