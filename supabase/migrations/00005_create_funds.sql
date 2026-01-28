-- Savings funds with rollover
CREATE TABLE funds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id    UUID REFERENCES households(id),
  name            TEXT NOT NULL,
  target_amount   BIGINT NOT NULL DEFAULT 0,
  current_balance BIGINT NOT NULL DEFAULT 0,
  color           TEXT DEFAULT '#4F46E5',
  icon            TEXT DEFAULT 'piggy-bank',
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Monthly fund contributions
CREATE TABLE fund_contributions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id         UUID NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
  budget_id       UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  amount          BIGINT NOT NULL DEFAULT 0,
  actual_amount   BIGINT NOT NULL DEFAULT 0,
  month           INT NOT NULL,
  year            INT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "funds_select" ON funds FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "funds_insert" ON funds FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "funds_update" ON funds FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "funds_delete" ON funds FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "fund_contributions_select" ON fund_contributions FOR SELECT
  USING (fund_id IN (SELECT id FROM funds WHERE user_id = auth.uid()));

CREATE POLICY "fund_contributions_insert" ON fund_contributions FOR INSERT
  WITH CHECK (fund_id IN (SELECT id FROM funds WHERE user_id = auth.uid()));

CREATE POLICY "fund_contributions_update" ON fund_contributions FOR UPDATE
  USING (fund_id IN (SELECT id FROM funds WHERE user_id = auth.uid()));
