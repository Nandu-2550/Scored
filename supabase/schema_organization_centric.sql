-- =========================================================================
-- SCORED: Organization-Centric Multi-Sport Architecture Migration
-- Supabase REST URL: https://jpnadsckarieaxrhmgep.supabase.co
-- Cloudinary Config: CLOUDINARY_URL=cloudinary://597917962679226:BV4oRy2SltB9MKZh3OjVYyCFBOQ@dd3etpbjs
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------------------
-- 1. ENUMS
-- -------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE sport_type AS ENUM (
    'cricket',
    'kabaddi',
    'kho-kho',
    'volleyball',
    'throwball',
    'badminton',
    'table-tennis',
    'athletics'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM ('viewer', 'organizer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE match_status AS ENUM (
    'upcoming',
    'live',
    'paused',
    'completed',
    'abandoned'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- -------------------------------------------------------------------------
-- 2. USER & ATHLETE PROFILES
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'SCR-77491'
  full_name VARCHAR(255) NOT NULL,
  dob DATE NOT NULL,
  age INT, -- Auto-calculated from DOB via trigger
  gender VARCHAR(30) NOT NULL DEFAULT 'Male' CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  state VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
  city VARCHAR(100) NOT NULL DEFAULT 'Bengaluru',
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'organizer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time Age Calculation Trigger
CREATE OR REPLACE FUNCTION calculate_profile_age()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dob IS NOT NULL THEN
    NEW.age := DATE_PART('year', AGE(CURRENT_DATE, NEW.dob))::INT;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_profile_age ON profiles;
CREATE TRIGGER trg_calculate_profile_age
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_profile_age();

-- Helper function for virtual queries
CREATE OR REPLACE FUNCTION get_profile_age(birth_date DATE) 
RETURNS INT AS $$
BEGIN
  RETURN DATE_PART('year', AGE(CURRENT_DATE, birth_date))::INT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- -------------------------------------------------------------------------
-- 3. ORGANIZATIONS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  creator_name VARCHAR(255) NOT NULL,
  creator_phone VARCHAR(30) NOT NULL,
  secret_code VARCHAR(20) UNIQUE NOT NULL, -- Unique 6-character code used to invite co-organizers
  logo_url TEXT,
  description TEXT,
  country VARCHAR(100) DEFAULT 'India',
  state VARCHAR(100) DEFAULT 'Karnataka',
  city VARCHAR(100) DEFAULT 'Bengaluru',
  max_organizers INT NOT NULL DEFAULT 4, -- Strictly capped at 4 organizers
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- 4. ORGANIZATION MEMBERS (UP TO 4 CO-ORGANIZERS)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  org_display_name VARCHAR(255) NOT NULL, -- Custom organization-specific display name (e.g. 'Coach Rajesh - Lead Scorer')
  role VARCHAR(50) NOT NULL DEFAULT 'co_organizer' CHECK (role IN ('lead_organizer', 'co_organizer')),
  phone VARCHAR(30),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_org_user UNIQUE (organization_id, user_id)
);

-- Capacity Enforcement Trigger: Enforces <= 4 organizers per organization
CREATE OR REPLACE FUNCTION check_org_member_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_count INT;
BEGIN
  SELECT COUNT(*) INTO current_count 
  FROM organization_members 
  WHERE organization_id = NEW.organization_id;
  
  IF current_count >= 4 THEN
    RAISE EXCEPTION 'This organization has reached its maximum capacity of 4 organizers.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_org_capacity ON organization_members;
CREATE TRIGGER trg_enforce_org_capacity
  BEFORE INSERT ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION check_org_member_capacity();

-- -------------------------------------------------------------------------
-- 5. ORGANIZATION SPORTS (SIMULTANEOUS MULTI-SPORT MANAGEMENT)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization_sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sport sport_type NOT NULL, -- cricket, kabaddi, kho-kho, volleyball, throwball, badminton, table-tennis, athletics
  is_active BOOLEAN DEFAULT true,
  tournaments_count INT DEFAULT 0,
  matches_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_org_sport UNIQUE (organization_id, sport)
);

-- -------------------------------------------------------------------------
-- 6. TOURNAMENTS & MATCHES LINKAGE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  sport sport_type NOT NULL,
  category VARCHAR(100) DEFAULT 'Open',
  organizer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  venue VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE,
  banner_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(10) NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(20) DEFAULT '#06b6d4',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  jersey_number INT,
  role VARCHAR(50),
  phone VARCHAR(20),
  profile_pic_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  sport sport_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  stage VARCHAR(100) DEFAULT 'League',
  venue VARCHAR(255),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status match_status DEFAULT 'upcoming',
  team_a_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  team_b_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  toss JSONB DEFAULT '{}'::jsonb,
  score_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  winner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  result_summary TEXT,
  scorer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sequence_no INT NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  points_or_runs INT DEFAULT 0,
  score_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- 7. PERFORMANCE INDEXES
-- -------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_player_id ON profiles(player_id);
CREATE INDEX IF NOT EXISTS idx_organizations_secret_code ON organizations(secret_code);
CREATE INDEX IF NOT EXISTS idx_organizations_city ON organizations(city);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_sports_org ON organization_sports(organization_id);
CREATE INDEX IF NOT EXISTS idx_matches_org ON matches(organization_id);
CREATE INDEX IF NOT EXISTS idx_matches_sport ON matches(sport);
CREATE INDEX IF NOT EXISTS idx_tournaments_org ON tournaments(organization_id);

-- -------------------------------------------------------------------------
-- 8. REALTIME REPLICATION ENABLEMENT
-- -------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE organizations;
ALTER PUBLICATION supabase_realtime ADD TABLE organization_members;
ALTER PUBLICATION supabase_realtime ADD TABLE organization_sports;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE match_events;

-- -------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS)
-- -------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Organizations" ON organizations FOR SELECT USING (true);
CREATE POLICY "Public Read Organization Members" ON organization_members FOR SELECT USING (true);
CREATE POLICY "Public Read Organization Sports" ON organization_sports FOR SELECT USING (true);
CREATE POLICY "Public Read Tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public Read Teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public Read Players" ON players FOR SELECT USING (true);
CREATE POLICY "Public Read Matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public Read Match Events" ON match_events FOR SELECT USING (true);

-- Authenticated Users & Organizers Management Policies
CREATE POLICY "Users Manage Profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Organizers Manage Organizations" ON organizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Organizers Manage Organization Members" ON organization_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Organizers Manage Organization Sports" ON organization_sports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Organizers Manage Matches" ON matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Organizers Manage Events" ON match_events FOR ALL USING (true) WITH CHECK (true);

-- -------------------------------------------------------------------------
-- 10. SEED INITIAL ORGANIZATIONS & MULTI-SPORT FIXTURES
-- -------------------------------------------------------------------------
INSERT INTO organizations (id, name, slug, creator_name, creator_phone, secret_code, city, state, description)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'Apex Grassroots Sports Academy',
    'apex-sports-academy',
    'Rajesh Kumar',
    '+91 98450 12345',
    'ORG-APEX',
    'Bengaluru',
    'Karnataka',
    'Premier sports academy hosting grassroots tournaments across South Bengaluru courts and fields.'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'National Youth Athletics & Kho-Kho Federation',
    'youth-athletics-kho-kho',
    'Vikram Deshmukh',
    '+91 97654 32109',
    'ORG-YOUTH',
    'Pune',
    'Maharashtra',
    'Fostering track athletics, sprint heats, and traditional rural Kho-Kho championships.'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Coastal Arena Sports Club',
    'coastal-arena-sports',
    'Kiran Shetty',
    '+91 98801 23456',
    'ORG-COAST',
    'Mangaluru',
    'Karnataka',
    'Coastal Karnataka league managing beach volleyball, throwball rallies, and Kabaddi leagues.'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Organization Multi-Sports
INSERT INTO organization_sports (organization_id, sport)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'cricket'),
  ('00000000-0000-0000-0000-000000000001', 'kabaddi'),
  ('00000000-0000-0000-0000-000000000001', 'volleyball'),
  ('00000000-0000-0000-0000-000000000001', 'badminton'),
  ('00000000-0000-0000-0000-000000000002', 'athletics'),
  ('00000000-0000-0000-0000-000000000002', 'kho-kho'),
  ('00000000-0000-0000-0000-000000000002', 'throwball'),
  ('00000000-0000-0000-0000-000000000003', 'volleyball'),
  ('00000000-0000-0000-0000-000000000003', 'throwball'),
  ('00000000-0000-0000-0000-000000000003', 'table-tennis'),
  ('00000000-0000-0000-0000-000000000003', 'kabaddi')
ON CONFLICT DO NOTHING;
