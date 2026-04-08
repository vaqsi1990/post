-- Add ParcelStatus.stopped (გაჩერებული). Must be alone in this migration so the new enum value is committed before use.
ALTER TYPE "ParcelStatus" ADD VALUE 'stopped';
