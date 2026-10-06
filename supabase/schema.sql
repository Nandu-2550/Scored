-- =========================================================================
-- SCORED: Multi-Sport Grassroots Tournament & Real-time Live Scoring Hub
-- Supabase PostgreSQL Database Schema
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
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

CREATE TYPE match_status AS ENUM (
  'upcoming',
  'live',
  'paused',
  'completed',
  'abandoned'
);

-- 2. TOURNAMENTS TABLE
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  sport sport_type NOT NULL,
  category VARCHAR(100) DEFAULT 'Open', -- e.g. U-19, Men, Women, Corporate
  organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  venue VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE,
  banner_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb, -- overs, set rules, points system
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEAMS TABLE
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(10) NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(20) DEFAULT '#06b6d4',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PLAYERS TABLE
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  jersey_number INT,
  role VARCHAR(50), -- 'Batsman', 'Bowler', 'Raider', 'Setter', 'Spiker'
  phone VARCHAR(20),
  profile_pic_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MATCHES TABLE (Realtime Enabled)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  sport sport_type NOT NULL,
  title VARCHAR(255) NOT NULL, -- e.g. "Match 4 - Group A"
  stage VARCHAR(100) DEFAULT 'League',
  venue VARCHAR(255),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status match_status DEFAULT 'upcoming',
  team_a_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  team_b_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  toss JSONB DEFAULT '{}'::jsonb, -- { winner_team_id, decision: 'bat'|'bowl'|'serve'|'court' }
  score_state JSONB NOT NULL DEFAULT '{}'::jsonb, -- Multi-sport polymorphic live state JSON
  winner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  result_summary TEXT,
  scorer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MATCH EVENTS / TIMELINE (Realtime Enabled)
CREATE TABLE IF NOT EXISTS match_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sequence_no INT NOT NULL,
  event_type VARCHAR(100) NOT NULL, -- 'RUN', 'WICKET', 'ACE', 'RAID_SUCCESS', etc.
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  points_or_runs INT DEFAULT 0,
  score_snapshot JSONB NOT NULL, -- For instantaneous timeline playback and 100% undo accuracy
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TOURNAMENT STANDINGS
CREATE TABLE IF NOT EXISTS tournament_standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  played INT DEFAULT 0,
  won INT DEFAULT 0,
  lost INT DEFAULT 0,
  tied INT DEFAULT 0,
  no_result INT DEFAULT 0,
  points INT DEFAULT 0,
  sport_metrics JSONB DEFAULT '{}'::jsonb, -- { nrr, sets_won, sets_lost, score_diff, etc. }
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_tournament_team UNIQUE (tournament_id, team_id)
);

-- =========================================================================
-- INDEXES & PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_match_events_match ON match_events(match_id, sequence_no DESC);
CREATE INDEX IF NOT EXISTS idx_standings_points ON tournament_standings(tournament_id, points DESC);

-- =========================================================================
-- REALTIME SUBSCRIPTIONS
-- =========================================================================
-- Enable Supabase Realtime Replication on live updates
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE match_events;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================================================
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_standings ENABLE ROW LEVEL SECURITY;

-- Public can read all tournament and match records for live spectator tracking
CREATE POLICY "Public Read Tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public Read Teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public Read Players" ON players FOR SELECT USING (true);
CREATE POLICY "Public Read Matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public Read Match Events" ON match_events FOR SELECT USING (true);
CREATE POLICY "Public Read Standings" ON tournament_standings FOR SELECT USING (true);

-- Authenticated scorers / organizers can insert and update
CREATE POLICY "Organizers Manage Matches" ON matches 
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Organizers Manage Events" ON match_events 
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);
