export type SportType = 
  | 'cricket'
  | 'kabaddi'
  | 'kho-kho'
  | 'volleyball'
  | 'throwball'
  | 'badminton'
  | 'table-tennis'
  | 'athletics';

export type SportCategory = 
  | 'batting-bowling'   // Cricket
  | 'raid-chase'        // Kabaddi, Kho-Kho
  | 'set-rally'         // Volleyball, Throwball, Badminton, Table Tennis
  | 'metric-timed';     // Athletics

export interface SportConfig {
  id: SportType;
  name: string;
  category: SportCategory;
  tagline: string;
  icon: string;
  accentColor: string; // Tailwind color class or hex
  accentBorder: string;
  badgeBg: string;
  badgeText: string;
  defaultSettings: Record<string, any>;
  rulesSummary: string[];
}

export interface Player {
  id: string;
  name: string;
  jerseyNumber?: number;
  role?: string; // Batsman, Bowler, All-rounder, Raider, Defender, Setter, Spiker, Sprinter
  stats?: Record<string, any>;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  color: string;
  players: Player[];
}

export interface MatchEvent {
  id: string;
  timestamp: number;
  matchId: string;
  type: string; // e.g., 'RUN', 'WICKET', 'EXTRA', 'RAID_SUCCESS', 'TACKLE', 'SET_POINT', etc.
  description: string;
  teamId?: string;
  playerId?: string;
  scoreSnapshot: any; // snapshot of score state after this event for 100% accurate undo
  meta?: Record<string, any>;
}

// -------------------------------------------------------------
// SPORT SPECIFIC SCORE STATES
// -------------------------------------------------------------

// 1. Cricket
export interface CricketBatsmanStats {
  playerId: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  dismissal?: string;
}

export interface CricketBowlerStats {
  playerId: string;
  name: string;
  overs: number; // e.g. 2.4
  maidens: number;
  runsConceded: number;
  wickets: number;
  wides: number;
  noBalls: number;
}

export interface CricketScoreState {
  sport: 'cricket';
  innings: 1 | 2;
  battingTeamId: string;
  bowlingTeamId: string;
  totalRuns: number;
  wickets: number;
  overs: number; // completed overs
  balls: number; // balls in current over (0 to 5)
  maxOvers: number;
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
  };
  currentStrikerId: string;
  currentNonStrikerId: string;
  currentBowlerId: string;
  batsmen: Record<string, CricketBatsmanStats>;
  bowlers: Record<string, CricketBowlerStats>;
  recentBalls: Array<{
    text: string;
    runs: number;
    isWicket: boolean;
    isExtra: boolean;
    type?: string;
  }>;
  target?: number;
}

// 2. Volleyball / Badminton / Table Tennis (Set & Rally)
export interface SetScore {
  setNumber: number;
  teamAScore: number;
  teamBScore: number;
  winnerTeamId?: string;
  durationMinutes?: number;
}

export interface SetRallyScoreState {
  sport: 'volleyball' | 'badminton' | 'throwball' | 'table-tennis';
  bestOfSets: number; // 3 or 5
  pointsToWinSet: number; // 25 for Volleyball, 21 for Badminton, 11 for TT
  mustWinByTwo: boolean;
  currentSetIndex: number; // 0, 1, 2...
  teamASetsWon: number;
  teamBSetsWon: number;
  currentSetTeamAPoints: number;
  currentSetTeamBPoints: number;
  servingTeamId: string;
  setHistory: SetScore[];
  teamATimeouts: number;
  teamBTimeouts: number;
  playerStats?: Record<string, {
    aces?: number;
    blocks?: number;
    kills?: number;
    errors?: number;
  }>;
}

// 3. Kabaddi (Raid & Chase)
export interface KabaddiScoreState {
  sport: 'kabaddi';
  half: 1 | 2;
  halfDurationMinutes: number;
  timeRemainingSeconds: number;
  teamAScore: number;
  teamBScore: number;
  teamAStats: {
    raidPoints: number;
    tacklePoints: number;
    bonusPoints: number;
    allOutPoints: number;
    activePlayersOnMat: number;
  };
  teamBStats: {
    raidPoints: number;
    tacklePoints: number;
    bonusPoints: number;
    allOutPoints: number;
    activePlayersOnMat: number;
  };
  activeRaidingTeamId: string;
  currentRaiderId?: string;
  raidTimerSeconds: number; // 30 seconds default
  isDoOrDieRaid: boolean;
}

// 4. Athletics (Metric / Timed)
export interface AthleticsScoreState {
  sport: 'athletics';
  eventType: '100m' | '200m' | '400m' | '800m' | '4x100m Relay' | 'Long Jump' | 'Shot Put';
  unit: 'seconds' | 'meters';
  heats: Array<{
    heatNumber: number;
    laneAssignments: Array<{
      lane: number;
      athleteName: string;
      teamName: string;
      bibNumber: number;
      result?: number; // time in secs or distance in meters
      rank?: number;
      status: 'pending' | 'started' | 'finished' | 'dns' | 'dq';
    }>;
  }>;
}

export type SportScoreState = 
  | CricketScoreState 
  | SetRallyScoreState 
  | KabaddiScoreState 
  | AthleticsScoreState;

export interface Match {
  id: string;
  tournamentId: string;
  tournamentName: string;
  organizationId?: string;
  sport: SportType;
  title: string;
  stage: string; // 'League Match 4', 'Quarter-Final', 'Semi-Final', 'Final'
  venue: string;
  scheduledAt: string;
  status: 'upcoming' | 'live' | 'completed' | 'paused';
  teamA: Team;
  teamB: Team;
  toss?: {
    winnerTeamId: string;
    decision: 'bat' | 'bowl' | 'court' | 'serve' | 'raid';
  };
  scoreState: SportScoreState;
  events: MatchEvent[];
  resultSummary?: string;
  winnerTeamId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StandingsRow {
  teamId: string;
  teamName: string;
  teamShort: string;
  teamColor: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  points: number;
  form: Array<'W' | 'L' | 'T' | 'D'>;
  // Cricket specific
  nrr?: number;
  runsScored?: number;
  oversFaced?: number;
  runsConceded?: number;
  oversBowled?: number;
  // Volleyball / Set sports specific
  setsWon?: number;
  setsLost?: number;
  setRatio?: number;
  pointsRatio?: number;
  // Kabaddi specific
  scoreDiff?: number;
}
