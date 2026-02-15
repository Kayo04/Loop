-- Add currency preference to user profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';

-- Comment: Stores user's preferred currency (EUR, USD, GBP, etc.)
