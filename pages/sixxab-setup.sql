-- ═══════════════════════════════════════════════════════════════════
-- SIXXAB AI · Complete Database Setup
-- Run this ENTIRE block in Supabase SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── PROFILES (extends Supabase auth.users) ────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT UNIQUE NOT NULL,
  full_name       TEXT,
  company         TEXT,
  phone           TEXT,
  avatar_url      TEXT,
  bio             TEXT,
  timezone        TEXT DEFAULT 'America/Chicago',
  onboarded       BOOLEAN DEFAULT FALSE,
  user_role       TEXT DEFAULT 'customer' CHECK (user_role IN ('admin','operator','customer')),
  plan            TEXT DEFAULT 'starter' CHECK (plan IN ('starter','pro','agency')),
  plan_status     TEXT DEFAULT 'trialing' CHECK (plan_status IN ('trialing','active','past_due','cancelled')),
  stripe_customer_id    TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  trial_ends_at   TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  last_seen_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── CRM CONTACTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_contacts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  company     TEXT,
  role        TEXT,
  location    TEXT,
  stage       TEXT DEFAULT 'Prospect',
  score       INTEGER DEFAULT 50,
  value       TEXT,
  notes       TEXT,
  source      TEXT DEFAULT 'Manual',
  tags        TEXT[],
  linkedin    TEXT,
  last_contact TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── LEADS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  role        TEXT,
  company     TEXT,
  industry    TEXT,
  location    TEXT,
  email       TEXT,
  phone       TEXT,
  score       INTEGER DEFAULT 0,
  pain_point  TEXT,
  status      TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','converted','rejected')),
  source      TEXT DEFAULT 'AI Generated',
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── BUSINESS PROFILES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS business_profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT,
  industry      TEXT,
  stage         TEXT DEFAULT 'pre-revenue',
  target_mrr    DECIMAL(12,2),
  current_mrr   DECIMAL(12,2) DEFAULT 0,
  target_market TEXT,
  icp           TEXT,
  usp           TEXT,
  pain_points   TEXT,
  competitors   TEXT[],
  website       TEXT,
  location      TEXT DEFAULT 'Dallas, TX',
  team_size     INTEGER DEFAULT 1,
  goals         JSONB,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── WEBSITES (Builder) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS websites (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  industry    TEXT,
  template    TEXT DEFAULT 'corporate',
  content_json JSONB,
  html        TEXT,
  vercel_url  TEXT,
  status      TEXT DEFAULT 'draft',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── SCHEDULED POSTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platforms   TEXT[],
  content     TEXT NOT NULL,
  media_url   TEXT,
  schedule_at TIMESTAMPTZ NOT NULL,
  status      TEXT DEFAULT 'scheduled',
  result      JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── AGENT RUNS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_runs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agent_type  TEXT NOT NULL,
  tool        TEXT,
  input       TEXT,
  output      TEXT,
  tokens_used INTEGER DEFAULT 0,
  duration_ms INTEGER,
  status      TEXT DEFAULT 'completed',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROPOSALS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proposals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id  UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  content     TEXT,
  value       DECIMAL(10,2),
  status      TEXT DEFAULT 'draft',
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads            ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites         ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals        ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ BEGIN
  DROP POLICY IF EXISTS "own_profile"     ON profiles;
  DROP POLICY IF EXISTS "own_contacts"    ON crm_contacts;
  DROP POLICY IF EXISTS "own_leads"       ON leads;
  DROP POLICY IF EXISTS "own_biz"         ON business_profiles;
  DROP POLICY IF EXISTS "own_websites"    ON websites;
  DROP POLICY IF EXISTS "own_posts"       ON scheduled_posts;
  DROP POLICY IF EXISTS "own_agent_runs"  ON agent_runs;
  DROP POLICY IF EXISTS "own_proposals"   ON proposals;
  DROP POLICY IF EXISTS "admin_all"       ON profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create policies
CREATE POLICY "own_profile"    ON profiles         FOR ALL USING (auth.uid() = id);
CREATE POLICY "own_contacts"   ON crm_contacts     FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_leads"      ON leads            FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_biz"        ON business_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_websites"   ON websites         FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_posts"      ON scheduled_posts  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_agent_runs" ON agent_runs       FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_proposals"  ON proposals        FOR ALL USING (auth.uid() = user_id);

-- Admin can see all profiles
CREATE POLICY "admin_all" ON profiles FOR ALL
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'admin'
  ));

-- ── AUTO-CREATE PROFILE ON SIGNUP ─────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_role, plan, plan_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'customer', 'starter', 'trialing'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── INDEXES ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS crm_contacts_user_id_idx   ON crm_contacts(user_id);
CREATE INDEX IF NOT EXISTS leads_user_id_idx          ON leads(user_id);
CREATE INDEX IF NOT EXISTS websites_user_id_idx       ON websites(user_id);
CREATE INDEX IF NOT EXISTS agent_runs_user_id_idx     ON agent_runs(user_id);
CREATE INDEX IF NOT EXISTS scheduled_posts_sched_idx  ON scheduled_posts(schedule_at);

-- ── BACKFILL: create profiles for existing auth users ──────────────
INSERT INTO profiles (id, email, full_name, user_role)
SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)), 'customer'
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ── SET ADMIN ─────────────────────────────────────────────────────
UPDATE profiles SET user_role = 'admin', plan = 'agency', plan_status = 'active'
WHERE email = 'sunil.kattikar@gmail.com';

UPDATE profiles SET user_role = 'operator', plan = 'agency', plan_status = 'active'
WHERE email = 'sunil.kattikar2024@gmail.com';

-- ── VERIFY ────────────────────────────────────────────────────────
SELECT email, user_role, plan, plan_status FROM profiles ORDER BY user_role, email;
