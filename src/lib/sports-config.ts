import { SportConfig, SportType } from '@/types/sports';

export const SPORTS_REGISTRY: Record<SportType, SportConfig> = {
  cricket: {
    id: 'cricket',
    name: 'Cricket',
    category: 'batting-bowling',
    tagline: 'Overs, balls, wickets, run-rate & fall of wickets',
    icon: 'Trophy',
    accentColor: '#059669', // emerald
    accentBorder: 'border-emerald-200',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    defaultSettings: {
      overs: 20,
      playersPerTeam: 11,
      ballsPerOver: 6,
      wideRuns: 1,
      noBallRuns: 1,
    },
    rulesSummary: [
      '6 legal balls per over',
      'Wides & No-balls add +1 run and don’t count as legal deliveries',
      'Net Run Rate (NRR) tie-breaker in standings'
    ]
  },
  volleyball: {
    id: 'volleyball',
    name: 'Volleyball',
    category: 'set-rally',
    tagline: 'Sets, rally points, rotations & timeout tracking',
    icon: 'Activity',
    accentColor: '#0284c7', // cyan / sky
    accentBorder: 'border-sky-200',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-800',
    defaultSettings: {
      bestOfSets: 3,
      pointsToWinSet: 25,
      decidingSetPoints: 15,
      mustWinByTwo: true,
      timeoutsPerSet: 2,
    },
    rulesSummary: [
      'Best of 3 or 5 sets',
      'First to 25 points with a 2-point lead (15 in decider)',
      'Set ratio & point ratio tie-breaker'
    ]
  },
  kabaddi: {
    id: 'kabaddi',
    name: 'Kabaddi',
    category: 'raid-chase',
    tagline: 'Raids, tackles, bonus points, do-or-die & all-outs',
    icon: 'Zap',
    accentColor: '#d97706', // amber
    accentBorder: 'border-amber-200',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    defaultSettings: {
      halfDurationMinutes: 20,
      playersOnMat: 7,
      raidTimerSeconds: 30,
      allOutPoints: 2,
    },
    rulesSummary: [
      '2 halves of 20 minutes',
      '30-second raid clock with Do-or-Die raids',
      'All-Out grants +2 bonus points',
      'Score differential tie-breaker'
    ]
  },
  badminton: {
    id: 'badminton',
    name: 'Badminton',
    category: 'set-rally',
    tagline: 'Best of 3 sets to 21 points, rallies & service change',
    icon: 'Target',
    accentColor: '#7c3aed', // purple
    accentBorder: 'border-purple-200',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800',
    defaultSettings: {
      bestOfSets: 3,
      pointsToWinSet: 21,
      mustWinByTwo: true,
      maxPointsCap: 30,
    },
    rulesSummary: [
      'Rally point system to 21 points',
      'Leading team at 11 points triggers 60s interval',
      'Best of 3 games format'
    ]
  },
  'kho-kho': {
    id: 'kho-kho',
    name: 'Kho-Kho',
    category: 'raid-chase',
    tagline: 'Chasers, defenders, turn timers & pole dives',
    icon: 'Timer',
    accentColor: '#db2777', // pink
    accentBorder: 'border-pink-200',
    badgeBg: 'bg-pink-50',
    badgeText: 'text-pink-800',
    defaultSettings: {
      innings: 2,
      turnsPerInning: 2,
      turnMinutes: 9,
      defendersPerBatch: 3,
    },
    rulesSummary: [
      '4 turns of 9 minutes each',
      '3 defenders per batch on field',
      'Fast-paced pursuit tag system'
    ]
  },
  throwball: {
    id: 'throwball',
    name: 'Throwball',
    category: 'set-rally',
    tagline: 'Quick release, court rotation & sets to 25 points',
    icon: 'Flame',
    accentColor: '#2563eb', // blue
    accentBorder: 'border-blue-200',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    defaultSettings: {
      bestOfSets: 3,
      pointsToWinSet: 25,
      playersOnCourt: 9,
    },
    rulesSummary: [
      'Ball must be released within 3 seconds',
      'Sets to 25 points with best of 3 format',
      'Two-handed catch and one-handed throw'
    ]
  },
  'table-tennis': {
    id: 'table-tennis',
    name: 'Table Tennis',
    category: 'set-rally',
    tagline: 'Games to 11 points, alternate serves & deuce battles',
    icon: 'Disc',
    accentColor: '#0d9488', // teal
    accentBorder: 'border-teal-200',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-800',
    defaultSettings: {
      bestOfSets: 5,
      pointsToWinSet: 11,
      servesPerRotation: 2,
      mustWinByTwo: true,
    },
    rulesSummary: [
      '11 points per game (best of 5 or 7)',
      'Service switches every 2 points',
      'Deuce at 10-10 requires 2-point lead'
    ]
  },
  athletics: {
    id: 'athletics',
    name: 'Athletics',
    category: 'metric-timed',
    tagline: 'Track heats, lane timing, sprint splits & field distance',
    icon: 'Footprints',
    accentColor: '#e11d48', // rose
    accentBorder: 'border-rose-200',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    defaultSettings: {
      eventType: '100m',
      lanesCount: 8,
      precisionDecimals: 2,
    },
    rulesSummary: [
      'Heat-based lane assignments',
      'Split-second digital stopwatch logs',
      'Qualifying times for finals'
    ]
  }
};

export const ALL_SPORTS = Object.values(SPORTS_REGISTRY);
