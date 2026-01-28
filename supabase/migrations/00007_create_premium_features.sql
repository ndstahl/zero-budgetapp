-- Bill reminders
CREATE TABLE bill_reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  line_item_id    UUID REFERENCES line_items(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  amount          BIGINT,
  due_day         INT NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  frequency       TEXT CHECK (frequency IN ('monthly', 'biweekly', 'weekly', 'quarterly', 'annual')) DEFAULT 'monthly',
  remind_days_before INT DEFAULT 3,
  is_autopay      BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Transaction rules (auto-categorization)
CREATE TABLE transaction_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_field     TEXT CHECK (match_field IN ('merchant_name', 'description')) DEFAULT 'merchant_name',
  match_type      TEXT CHECK (match_type IN ('contains', 'equals', 'starts_with')) DEFAULT 'contains',
  match_value     TEXT NOT NULL,
  line_item_id    UUID NOT NULL REFERENCES line_items(id) ON DELETE CASCADE,
  priority        INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Detected subscriptions
CREATE TABLE detected_subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_name   TEXT NOT NULL,
  estimated_amount BIGINT,
  frequency       TEXT,
  last_charged    DATE,
  next_expected   DATE,
  is_confirmed    BOOLEAN DEFAULT FALSE,
  is_dismissed    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Net worth accounts
CREATE TABLE net_worth_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id    UUID REFERENCES households(id),
  name            TEXT NOT NULL,
  type            TEXT CHECK (type IN ('asset', 'liability')) NOT NULL,
  subtype         TEXT,
  plaid_account_id UUID REFERENCES plaid_accounts(id) ON DELETE SET NULL,
  is_manual       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Net worth snapshots
CREATE TABLE net_worth_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES net_worth_accounts(id) ON DELETE CASCADE,
  balance         BIGINT NOT NULL,
  snapshot_date   DATE NOT NULL,
  source          TEXT CHECK (source IN ('manual', 'plaid')) DEFAULT 'manual',
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_id, snapshot_date)
);

-- Paycheck plans
CREATE TABLE paycheck_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_id       UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT 'Paycheck 1',
  expected_amount BIGINT NOT NULL DEFAULT 0,
  expected_date   DATE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE paycheck_allocations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paycheck_plan_id UUID NOT NULL REFERENCES paycheck_plans(id) ON DELETE CASCADE,
  line_item_id    UUID NOT NULL REFERENCES line_items(id) ON DELETE CASCADE,
  amount          BIGINT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Financial roadmap progress
CREATE TABLE roadmap_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_key        TEXT NOT NULL,
  status          TEXT CHECK (status IN ('locked', 'active', 'completed')) DEFAULT 'locked',
  completed_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, step_key)
);

-- Push notification tokens
CREATE TABLE push_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token           TEXT NOT NULL,
  platform        TEXT CHECK (platform IN ('ios', 'android', 'web')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, token)
);

-- RLS for all premium tables
ALTER TABLE bill_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE net_worth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE net_worth_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE paycheck_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE paycheck_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Simple user-owns-row policies for all
CREATE POLICY "bill_reminders_all" ON bill_reminders FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "transaction_rules_all" ON transaction_rules FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "detected_subscriptions_all" ON detected_subscriptions FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "net_worth_accounts_all" ON net_worth_accounts FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "net_worth_snapshots_all" ON net_worth_snapshots FOR ALL
  USING (account_id IN (SELECT id FROM net_worth_accounts WHERE user_id = auth.uid()))
  WITH CHECK (account_id IN (SELECT id FROM net_worth_accounts WHERE user_id = auth.uid()));
CREATE POLICY "paycheck_plans_all" ON paycheck_plans FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "paycheck_allocations_all" ON paycheck_allocations FOR ALL
  USING (paycheck_plan_id IN (SELECT id FROM paycheck_plans WHERE user_id = auth.uid()))
  WITH CHECK (paycheck_plan_id IN (SELECT id FROM paycheck_plans WHERE user_id = auth.uid()));
CREATE POLICY "roadmap_progress_all" ON roadmap_progress FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "push_tokens_all" ON push_tokens FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
