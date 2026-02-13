-- Add dividend tracking column
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS annual_dividend_per_share DECIMAL(10, 4) DEFAULT 0;

-- Comment: This represents the expected annual dividend per single share/unit.
