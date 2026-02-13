-- ============================================
-- LOOP FINANCE TRACKER - INVESTMENTS SCHEMA
-- ============================================

-- 1. ASSETS TABLE
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stock', 'reit', 'crypto', 'etf', 'other')),
  quantity DECIMAL(20, 8) NOT NULL CHECK (quantity > 0), -- High precision for crypto
  buy_price DECIMAL(10, 2) NOT NULL CHECK (buy_price >= 0),
  current_price DECIMAL(10, 2) NOT NULL CHECK (current_price >= 0),
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_assets_user ON assets(user_id);

-- 2. RLS POLICIES
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assets" ON assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets" ON assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets" ON assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets" ON assets
  FOR DELETE USING (auth.uid() = user_id);
