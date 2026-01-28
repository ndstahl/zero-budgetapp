-- Households
CREATE TABLE households (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL DEFAULT 'My Household',
  owner_id        UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key to profiles now that households exists
ALTER TABLE profiles
  ADD CONSTRAINT profiles_household_fk
  FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL;

-- Household invites
CREATE TABLE household_invites (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id    UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  invited_email   TEXT NOT NULL,
  invited_by      UUID NOT NULL REFERENCES auth.users(id),
  status          TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
  token           TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can view their household"
  ON households FOR SELECT
  USING (id IN (SELECT household_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Household owner can update"
  ON households FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create households"
  ON households FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can view their invites"
  ON household_invites FOR SELECT
  USING (invited_by = auth.uid() OR invited_email = (SELECT email FROM profiles WHERE id = auth.uid()));
