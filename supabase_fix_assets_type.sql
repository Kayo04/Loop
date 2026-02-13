-- Remove the check constraint on the 'type' column to allow custom categories
-- This allows storing 'Real Estate', 'Vehicle', 'Cash', etc. directly in the 'type' column.

DO $$
BEGIN
    -- Attempt to drop the standard named constraint
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assets_type_check') THEN
        ALTER TABLE assets DROP CONSTRAINT assets_type_check;
    END IF;
END $$;

-- Verify/Ensure column is text (it should be already)
ALTER TABLE assets ALTER COLUMN type TYPE text;
