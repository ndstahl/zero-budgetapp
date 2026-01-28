-- Transactions
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id    UUID REFERENCES households(id) ON DELETE CASCADE,
  budget_id       UUID REFERENCES budgets(id) ON DELETE SET NULL,
  line_item_id    UUID REFERENCES line_items(id) ON DELETE SET NULL,
  plaid_transaction_id TEXT UNIQUE,
  plaid_account_id TEXT,
  amount          BIGINT NOT NULL,
  merchant_name   TEXT,
  description     TEXT,
  date            DATE NOT NULL,
  pending         BOOLEAN DEFAULT FALSE,
  type            TEXT CHECK (type IN ('expense', 'income', 'transfer')) DEFAULT 'expense',
  source          TEXT CHECK (source IN ('manual', 'plaid', 'recurring')) DEFAULT 'manual',
  is_split        BOOLEAN DEFAULT FALSE,
  parent_transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  is_excluded     BOOLEAN DEFAULT FALSE,
  notes           TEXT,
  receipt_url     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_budget ON transactions(budget_id);
CREATE INDEX idx_transactions_line_item ON transactions(line_item_id);
CREATE INDEX idx_transactions_plaid ON transactions(plaid_transaction_id) WHERE plaid_transaction_id IS NOT NULL;
CREATE INDEX idx_transactions_parent ON transactions(parent_transaction_id) WHERE parent_transaction_id IS NOT NULL;

-- RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select" ON transactions FOR SELECT
  USING (user_id = auth.uid() OR household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "transactions_insert" ON transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "transactions_update" ON transactions FOR UPDATE
  USING (user_id = auth.uid() OR household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "transactions_delete" ON transactions FOR DELETE
  USING (user_id = auth.uid());
