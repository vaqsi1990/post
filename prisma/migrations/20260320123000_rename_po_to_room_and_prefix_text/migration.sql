-- Convert existing integer PO sequence to text values like "PO1", "PO2", ...
-- Assumes original column is users.poNumber (added by 20260302102733_add_user_po_number).

-- Rename column if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'poNumber'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'roomNumber'
  ) THEN
    ALTER TABLE "users" RENAME COLUMN "poNumber" TO "roomNumber";
  END IF;
END
$$;

-- If roomNumber is still an integer type, convert it to text with the "PO" prefix.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'roomNumber'
      AND data_type IN ('integer', 'bigint', 'smallint')
  ) THEN
    ALTER TABLE "users" ALTER COLUMN "roomNumber" DROP DEFAULT;
    ALTER TABLE "users" ALTER COLUMN "roomNumber" TYPE TEXT USING ('PO' || "roomNumber"::text);
  ELSE
    -- If it's already text, ensure it starts with "PO"
    UPDATE "users"
    SET "roomNumber" = CASE
      WHEN "roomNumber" IS NULL THEN NULL
      WHEN "roomNumber" LIKE 'PO%' THEN "roomNumber"
      ELSE 'PO' || "roomNumber"
    END;
  END IF;
END
$$;

