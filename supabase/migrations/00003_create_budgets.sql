-- Budgets (one per user per month)
CREATE TABLE budgets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id    UUID REFERENCES households(id) ON DELETE CASCADE,
  month           INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year            INT NOT NULL CHECK (year BETWEEN 2020 AND 2100),
  planned_income  BIGINT NOT NULL DEFAULT 0,
  notes           TEXT,
  is_template     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month, year)
);

-- Category groups (e.g. "Housing", "Food", "Transportation")
CREATE TABLE category_groups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id       UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  sort_order      INT NOT NULL DEFAULT 0,
  is_income       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Line items (e.g. "Mortgage" under "Housing")
CREATE TABLE line_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_group_id UUID NOT NULL REFERENCES category_groups(id) ON DELETE CASCADE,
  budget_id       UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  planned_amount  BIGINT NOT NULL DEFAULT 0,
  sort_order      INT NOT NULL DEFAULT 0,
  is_fund         BOOLEAN DEFAULT FALSE,
  fund_target     BIGINT,
  due_date        INT CHECK (due_date IS NULL OR (due_date BETWEEN 1 AND 31)),
  is_recurring    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_budgets_user_month ON budgets(user_id, month, year);
CREATE INDEX idx_category_groups_budget ON category_groups(budget_id);
CREATE INDEX idx_line_items_budget ON line_items(budget_id);
CREATE INDEX idx_line_items_group ON line_items(category_group_id);

-- RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budgets_select" ON budgets FOR SELECT
  USING (user_id = auth.uid() OR household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "budgets_insert" ON budgets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "budgets_update" ON budgets FOR UPDATE
  USING (user_id = auth.uid() OR household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "budgets_delete" ON budgets FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "category_groups_select" ON category_groups FOR SELECT
  USING (budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid() OR household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "category_groups_insert" ON category_groups FOR INSERT
  WITH CHECK (budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid()));

CREATE POLICY "category_groups_update" ON category_groups FOR UPDATE
  USING (budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid() OR household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "category_groups_delete" ON category_groups FOR DELETE
  USING (budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid()));

CREATE POLICY "line_items_select" ON line_items FOR SELECT
  USING (budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid() OR household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "line_items_insert" ON line_items FOR INSERT
  WITH CHECK (budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid()));

CREATE POLICY "line_items_update" ON line_items FOR UPDATE
  USING (budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid() OR household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "line_items_delete" ON line_items FOR DELETE
  USING (budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid()));
