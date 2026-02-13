-- Add next payment date column
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS next_payment_date TIMESTAMP WITH TIME ZONE;
