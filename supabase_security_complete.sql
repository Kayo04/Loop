-- ============================================
-- LOOP FINANCE TRACKER - SECURITY HARDENING
-- Execute este SQL no Supabase para máxima segurança
-- ============================================

-- 1. CREATE WEBHOOK EVENTS TABLE (Idempotency)
-- Prevents duplicate webhook processing
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  processed_at timestamp DEFAULT now(),
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_id 
ON public.webhook_events(stripe_event_id);

CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at 
ON public.webhook_events(created_at);

-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- 3. PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- 4. TRANSACTIONS POLICIES
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions"
ON public.transactions FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions"
ON public.transactions FOR DELETE
USING (auth.uid() = user_id);

-- 5. ASSETS POLICIES
DROP POLICY IF EXISTS "Users can view own assets" ON public.assets;
CREATE POLICY "Users can view own assets"
ON public.assets FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assets" ON public.assets;
CREATE POLICY "Users can insert own assets"
ON public.assets FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own assets" ON public.assets;
CREATE POLICY "Users can update own assets"
ON public.assets FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own assets" ON public.assets;
CREATE POLICY "Users can delete own assets"
ON public.assets FOR DELETE
USING (auth.uid() = user_id);

-- 6. HABITS POLICIES
DROP POLICY IF EXISTS "Users can view own habits" ON public.habits;
CREATE POLICY "Users can view own habits"
ON public.habits FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own habits" ON public.habits;
CREATE POLICY "Users can insert own habits"
ON public.habits FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own habits" ON public.habits;
CREATE POLICY "Users can update own habits"
ON public.habits FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own habits" ON public.habits;
CREATE POLICY "Users can delete own habits"
ON public.habits FOR DELETE
USING (auth.uid() = user_id);

-- 7. HABIT LOGS POLICIES
DROP POLICY IF EXISTS "Users can view own habit logs" ON public.habit_logs;
CREATE POLICY "Users can view own habit logs"
ON public.habit_logs FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own habit logs" ON public.habit_logs;
CREATE POLICY "Users can insert own habit logs"
ON public.habit_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own habit logs" ON public.habit_logs;
CREATE POLICY "Users can delete own habit logs"
ON public.habit_logs FOR DELETE
USING (auth.uid() = user_id);

-- 8. CATEGORIES POLICIES
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
CREATE POLICY "Users can view own categories"
ON public.categories FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
CREATE POLICY "Users can insert own categories"
ON public.categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
CREATE POLICY "Users can update own categories"
ON public.categories FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
CREATE POLICY "Users can delete own categories"
ON public.categories FOR DELETE
USING (auth.uid() = user_id);

-- 9. BUDGETS POLICIES
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
CREATE POLICY "Users can view own budgets"
ON public.budgets FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
CREATE POLICY "Users can insert own budgets"
ON public.budgets FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
CREATE POLICY "Users can update own budgets"
ON public.budgets FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
CREATE POLICY "Users can delete own budgets"
ON public.budgets FOR DELETE
USING (auth.uid() = user_id);

-- 10. RECURRING TRANSACTIONS POLICIES
DROP POLICY IF EXISTS "Users can view own recurring transactions" ON public.recurring_transactions;
CREATE POLICY "Users can view own recurring transactions"
ON public.recurring_transactions FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recurring transactions" ON public.recurring_transactions;
CREATE POLICY "Users can insert own recurring transactions"
ON public.recurring_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recurring transactions" ON public.recurring_transactions;
CREATE POLICY "Users can update own recurring transactions"
ON public.recurring_transactions FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recurring transactions" ON public.recurring_transactions;
CREATE POLICY "Users can delete own recurring transactions"
ON public.recurring_transactions FOR DELETE
USING (auth.uid() = user_id);

-- 11. SUPPORT MESSAGES POLICIES
DROP POLICY IF EXISTS "Users can view own support messages" ON public.support_messages;
CREATE POLICY "Users can view own support messages"
ON public.support_messages FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own support messages" ON public.support_messages;
CREATE POLICY "Users can insert own support messages"
ON public.support_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 12. ADD PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier 
ON public.profiles(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status 
ON public.profiles(subscription_status);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
ON public.transactions(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_assets_user_id 
ON public.assets(user_id);

CREATE INDEX IF NOT EXISTS idx_habits_user_id 
ON public.habits(user_id);

-- 13. CLEANUP OLD WEBHOOK EVENTS (Optional - run monthly)
-- DELETE FROM public.webhook_events 
-- WHERE created_at < NOW() - INTERVAL '30 days';
