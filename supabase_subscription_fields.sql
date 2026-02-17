-- Add subscription management fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'cancelled', 'expired')),
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly'));

-- Update existing profiles to have proper subscription status based on tier
UPDATE profiles
SET subscription_status = CASE
    WHEN subscription_tier = 'pro' THEN 'active'
    ELSE 'free'
END
WHERE subscription_status IS NULL OR subscription_status = 'free';
