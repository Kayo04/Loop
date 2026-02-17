-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only view and update their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Transactions: Users can only access their own transactions
CREATE POLICY "Users can view own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
ON public.transactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
ON public.transactions FOR DELETE
USING (auth.uid() = user_id);

-- Assets: Users can only access their own assets
CREATE POLICY "Users can view own assets"
ON public.assets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets"
ON public.assets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets"
ON public.assets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
ON public.assets FOR DELETE
USING (auth.uid() = user_id);

-- Habits: Users can only access their own habits
CREATE POLICY "Users can view own habits"
ON public.habits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
ON public.habits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
ON public.habits FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
ON public.habits FOR DELETE
USING (auth.uid() = user_id);

-- Habit Logs: Users can only access their own habit logs
CREATE POLICY "Users can view own habit logs"
ON public.habit_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habit logs"
ON public.habit_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own habit logs"
ON public.habit_logs FOR DELETE
USING (auth.uid() = user_id);

-- Categories: Users can only access their own categories
CREATE POLICY "Users can view own categories"
ON public.categories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
ON public.categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
ON public.categories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
ON public.categories FOR DELETE
USING (auth.uid() = user_id);

-- Budgets: Users can only access their own budgets
CREATE POLICY "Users can view own budgets"
ON public.budgets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
ON public.budgets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
ON public.budgets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
ON public.budgets FOR DELETE
USING (auth.uid() = user_id);

-- Recurring Transactions: Users can only access their own recurring transactions
CREATE POLICY "Users can view own recurring transactions"
ON public.recurring_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring transactions"
ON public.recurring_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring transactions"
ON public.recurring_transactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring transactions"
ON public.recurring_transactions FOR DELETE
USING (auth.uid() = user_id);
