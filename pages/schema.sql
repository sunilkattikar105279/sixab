-- ═══════════════════════════════════════════════════════════════
-- SIXXAB AI · Schema v2 — User Roles + Org Model
-- Run AFTER schema.sql in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Add user_role and org_id to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS user_role    TEXT DEFAULT 'customer'
    CHECK (user_role IN ('admin','operator','customer')),
  ADD COLUMN IF NOT EXISTS org_id       UUID,
  ADD COLUMN IF NOT EXISTS avatar_url   TEXT,
  ADD COLUMN IF NOT EXISTS bio          TEXT,
  ADD COLUMN IF NOT EXISTS timezone     TEXT DEFAULT 'America/Chicago',
  ADD COLUMN IF NOT EXISTS onboarded    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- ── ORGANISATIONS (for operator/agency accounts) ─────────────
CREATE TABLE IF NOT EXISTS organisations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  owner_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan          TEXT DEFAULT 'agency',
  logo_url      TEXT,
  website       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from profiles to orgs
ALTER TABLE profiles
  ADD CONSTRAINT profiles_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES organisations(id) ON DELETE SET NULL;

-- ── ROLE PERMISSIONS (what each role can see/do) ─────────────
-- admin  : full access to everything — all users, all orgs, all data
-- operator: manages a set of customers within their org
-- customer: sees only their own data

CREATE TABLE IF NOT EXISTS user_invites (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT NOT NULL,
  org_id        UUID REFERENCES organisations(id) ON DELETE CASCADE,
  invited_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  role          TEXT DEFAULT 'customer' CHECK (role IN ('operator','customer')),
  token         TEXT UNIQUE DEFAULT encode(gen_random_bytes(32),'hex'),
  accepted      BOOLEAN DEFAULT FALSE,
  expires_at    TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── AGENT RUNS (track every agent call with outcome) ─────────
CREATE TABLE IF NOT EXISTS agent_runs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agent_type    TEXT NOT NULL,   -- ceo, cmo, cso, coo, etc.
  tool          TEXT,            -- specific tool within agent
  input         TEXT,
  output        TEXT,
  tokens_used   INTEGER DEFAULT 0,
  duration_ms   INTEGER,
  status        TEXT DEFAULT 'completed',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS agent_runs_user_id_idx ON agent_runs(user_id);
CREATE INDEX IF NOT EXISTS agent_runs_created_at_idx ON agent_runs(created_at);

-- ── BUSINESS PROFILE (strategy context for all agents) ────────
CREATE TABLE IF NOT EXISTS business_profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT,
  industry      TEXT,
  stage         TEXT DEFAULT 'pre-revenue',
  target_mrr    DECIMAL(12,2),
  current_mrr   DECIMAL(12,2) DEFAULT 0,
  target_market TEXT,
  icp           TEXT,           -- Ideal Customer Profile
  usp           TEXT,           -- Unique Selling Proposition
  pain_points   TEXT,
  competitors   TEXT[],
  website       TEXT,
  location      TEXT DEFAULT 'Dallas, TX',
  team_size     INTEGER DEFAULT 1,
  founded_year  INTEGER,
  goals         JSONB,          -- {q1,q2,q3,q4,annual}
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── FUNNEL STAGES (sales + marketing funnel tracker) ──────────
CREATE TABLE IF NOT EXISTS funnel_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id    UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  lead_id       UUID REFERENCES leads(id) ON DELETE SET NULL,
  stage         TEXT NOT NULL,   -- awareness,interest,consideration,intent,purchase,retention
  channel       TEXT,            -- linkedin,email,content,referral,paid,organic
  action        TEXT,
  value         DECIMAL(10,2),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS for new tables ────────────────────────────────────────
ALTER TABLE organisations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invites     ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_events    ENABLE ROW LEVEL SECURITY;

-- Organisations: owner + members in org
CREATE POLICY "org_access" ON organisations FOR ALL
  USING (owner_id = auth.uid() OR id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "own_invites"    ON user_invites      FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE org_id = organisations.org_id));
CREATE POLICY "own_agent_runs" ON agent_runs        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_biz_profile" ON business_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_funnel"     ON funnel_events     FOR ALL USING (auth.uid() = user_id);

-- Admin bypass: admins can see everything
CREATE POLICY "admin_all_contacts" ON crm_contacts FOR ALL
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id=auth.uid() AND user_role='admin'));

CREATE POLICY "admin_all_leads" ON leads FOR ALL
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id=auth.uid() AND user_role='admin'));

-- ── Helper function: get current user role ────────────────────
CREATE OR REPLACE FUNCTION get_user_role(uid UUID)
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT user_role FROM profiles WHERE id = uid
$$;

-- ── Seed first admin (replace with your actual user email) ────
-- Run this AFTER you sign up for the first time:
-- UPDATE profiles SET user_role = 'admin' WHERE email = 'sunil.kattikar@gmail.com';

SELECT 'Schema v2 applied successfully ✓' AS status;
