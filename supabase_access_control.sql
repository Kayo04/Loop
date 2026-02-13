-- Add subscription_tier column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro'));

-- Update existing users to 'free' (safe default)
UPDATE profiles SET subscription_tier = 'free' WHERE subscription_tier IS NULL;

-- (Optional) Set a specific user to 'pro' for testing
-- UPDATE profiles SET subscription_tier = 'pro' WHERE id = 'YOUR_USER_ID';
