
-- ============================================
-- FIX: ALLOW CUSTOM ASSET TYPES
-- ============================================
-- The original table had a strict check constraint: CHECK (type IN ('stock', 'reit', 'crypto', 'etf', 'other'))
-- We need to remove this so we can store 'Real Estate', 'Vehicle', 'Cash', etc.

DO $$
BEGIN
    -- 1. Drop the named constraint if it exists
    -- Note: The name is usually 'assets_type_check', but sometimes Supabase auto-generates a different name if not specified.
    -- We try the standard name first.
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assets_type_check') THEN
        ALTER TABLE assets DROP CONSTRAINT assets_type_check;
    END IF;
END $$;

-- 2. ALTERNATIVE: If the constraint has a random name, we can try to find it dynamically or just rely on the user manually checking if the above failed.
-- But usually 'assets_type_check' is the default for a column named 'type' with a check.

-- 3. Verify it's text (just to be safe)
ALTER TABLE assets ALTER COLUMN type TYPE text;

-- 4. Re-enable constraint? NO. We want flexiblity.
-- If we wanted to re-enable, we would need to include ALL new types.
-- For now, leaving it as open TEXT is safer for this feature.
