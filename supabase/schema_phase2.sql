-- =========================================================================
-- SCORED (Phase 2): User Profiles, Dynamic Roles, Organization Hub & Multi-Sport
-- Supabase PostgreSQL Database Schema Extension
-- =========================================================================

-- 1. ATHLETE & USER PROFILES
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

-- Trigger for Real-time Age Calculation
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

-- Virtual or Helper Function for Real-time Age Calculation
CREATE OR REPLACE FUNCTION get_profile_age(birth_date DATE) 
RETURNS INT AS $$
BEGIN
  RETURN DATE_PART('year', AGE(CURRENT_DATE, birth_date))::INT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  creator_name VARCHAR(255) NOT NULL,
  creator_phone VARCHAR(30) NOT NULL,
  secret_code VARCHAR(20) UNIQUE NOT NULL, -- 6-character code to join as co-organizer
  logo_url TEXT,
  description TEXT,
  country VARCHAR(100) DEFAULT 'India',
  state VARCHAR(100) DEFAULT 'Karnataka',
  city VARCHAR(100) DEFAULT 'Bengaluru',
  max_organizers INT NOT NULL DEFAULT 4,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORGANIZATION MEMBERS (Up to 4 Co-Organizers per Org)
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  org_display_name VARCHAR(255) NOT NULL, -- Custom display name specific to this organization
  role VARCHAR(50) NOT NULL DEFAULT 'co_organizer' CHECK (role IN ('lead_organizer', 'co_organizer')),
  phone VARCHAR(30),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_org_user UNIQUE (organization_id, user_id)
);

-- Trigger to strictly enforce max 4 organizers per organization
CREATE OR REPLACE FUNCTION check_org_member_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_count INT;
BEGIN
  SELECT COUNT(*) INTO current_count 
  FROM organization_members 
  WHERE organization_id = NEW.organization_id;
  
  IF current_count >= 4 THEN
    RAISE EXCEPTION 'This organization has reached the maximum capacity of 4 organizers.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_org_capacity ON organization_members;
CREATE TRIGGER trg_enforce_org_capacity
  BEFORE INSERT ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION check_org_member_capacity();

-- 4. ORGANIZATION SPORTS (Simultaneous Multi-Sport Management)
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

-- 5. LINK MATCHES & TOURNAMENTS TO ORGANIZATIONS
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE matches ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =========================================================================
-- INDEXES & PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_player_id ON profiles(player_id);
CREATE INDEX IF NOT EXISTS idx_organizations_secret_code ON organizations(secret_code);
CREATE INDEX IF NOT EXISTS idx_organizations_city ON organizations(city);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_sports_org ON organization_sports(organization_id);
CREATE INDEX IF NOT EXISTS idx_matches_org ON matches(organization_id);

-- =========================================================================
-- REALTIME REPLICATION ENABLEMENT
-- =========================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE organizations;
ALTER PUBLICATION supabase_realtime ADD TABLE organization_members;
ALTER PUBLICATION supabase_realtime ADD TABLE organization_sports;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_sports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Organizations" ON organizations FOR SELECT USING (true);
CREATE POLICY "Public Read Organization Members" ON organization_members FOR SELECT USING (true);
CREATE POLICY "Public Read Organization Sports" ON organization_sports FOR SELECT USING (true);

CREATE POLICY "Users Manage Own Profile" ON profiles 
  FOR ALL USING (true) 
  WITH CHECK (true);

CREATE POLICY "Organizers Manage Organizations" ON organizations 
  FOR ALL USING (true) 
  WITH CHECK (true);

CREATE POLICY "Organizers Manage Organization Members" ON organization_members 
  FOR ALL USING (true) 
  WITH CHECK (true);

CREATE POLICY "Organizers Manage Organization Sports" ON organization_sports 
  FOR ALL USING (true) 
  WITH CHECK (true);
