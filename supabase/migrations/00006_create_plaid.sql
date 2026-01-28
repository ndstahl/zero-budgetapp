-- Plaid items (linked bank connections)
CREATE TABLE plaid_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plaid_item_id   TEXT NOT NULL UNIQUE,
  access_token    TEXT NOT NULL,  -- encrypted, server-side only
  institution_id  TEXT,
  institution_name TEXT,
  cursor          TEXT,
  status          TEXT CHECK (status IN ('active', 'error', 'login_required', 'disconnected')) DEFAULT 'active',
  error_code      TEXT,
  consent_expires_at TIMESTAMPTZ,
  last_synced_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Plaid accounts
CREATE TABLE plaid_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plaid_item_id   UUID NOT NULL REFERENCES plaid_items(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plaid_account_id TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  official_name   TEXT,
  type            TEXT NOT NULL,
  subtype         TEXT,
  mask            TEXT,
  current_balance BIGINT,
  available_balance BIGINT,
  is_hidden       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- RLS (access_token must NEVER be exposed to client)
ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_accounts ENABLE ROW LEVEL SECURITY;

-- Create a view that excludes access_token for client access
CREATE VIEW plaid_items_safe AS
SELECT id, user_id, plaid_item_id, institution_id, institution_name,
       status, error_code, consent_expires_at, last_synced_at, created_at
FROM plaid_items;

CREATE POLICY "plaid_items_select" ON plaid_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "plaid_accounts_select" ON plaid_accounts FOR SELECT
  USING (user_id = auth.uid());
