import { Match, StandingsRow } from '@/types/sports';

export const INITIAL_MATCHES: Match[] = [
  // 1. CRICKET MATCH
  {
    id: 'cricket-match-101',
    tournamentId: 't-cricket-1',
    tournamentName: 'Apex Premier League 2026',
    organizationId: 'org-apex-01',
    sport: 'cricket',
    title: 'Match 14: Bangalore Blitzers vs Mumbai Mavericks',
    stage: 'Group Stage - Match 14',
    venue: 'Chinnaswamy Stadium, Bangalore',
    scheduledAt: '2026-10-04T19:30:00Z',
    status: 'live',
    teamA: {
      id: 'team-cricket-blr',
      name: 'Bangalore Blitzers',
      shortName: 'BLR',
      color: '#ef4444',
      players: [
        { id: 'p-c-1', name: 'Virat Roy', role: 'Batsman', jerseyNumber: 18 },
        { id: 'p-c-2', name: 'Rohan Sharma', role: 'Batsman', jerseyNumber: 45 },
        { id: 'p-c-3', name: 'Glenn Maxwell', role: 'All-Rounder', jerseyNumber: 32 },
        { id: 'p-c-4', name: 'KL Rahul', role: 'Wicket-Keeper', jerseyNumber: 1 },
        { id: 'p-c-5', name: 'Dinesh Karthik', role: 'Finisher', jerseyNumber: 19 },
        { id: 'p-c-6', name: 'Mohd Siraj', role: 'Fast Bowler', jerseyNumber: 73 },
      ]
    },
    teamB: {
      id: 'team-cricket-mum',
      name: 'Mumbai Mavericks',
      shortName: 'MUM',
      color: '#3b82f6',
      players: [
        { id: 'p-c-7', name: 'Jasprit Bumrah', role: 'Fast Bowler', jerseyNumber: 93 },
        { id: 'p-c-8', name: 'Hardik Patel', role: 'All-Rounder', jerseyNumber: 33 },
        { id: 'p-c-9', name: 'Suryakumar', role: 'Batsman', jerseyNumber: 63 },
        { id: 'p-c-10', name: 'Ishan Kishan', role: 'Wicket-Keeper', jerseyNumber: 23 },
        { id: 'p-c-11', name: 'Piyush Chawla', role: 'Leg Spinner', jerseyNumber: 11 },
      ]
    },
    toss: {
      winnerTeamId: 'team-cricket-mum',
      decision: 'bowl'
    },
    scoreState: {
      sport: 'cricket',
      innings: 1,
      battingTeamId: 'team-cricket-blr',
      bowlingTeamId: 'team-cricket-mum',
      totalRuns: 138,
      wickets: 3,
      overs: 14,
      balls: 2,
      maxOvers: 20,
      extras: {
        wides: 5,
        noBalls: 1,
        byes: 2,
        legByes: 1
      },
      currentStrikerId: 'p-c-1', // Virat Roy
      currentNonStrikerId: 'p-c-3', // Glenn Maxwell
      currentBowlerId: 'p-c-7', // Jasprit Bumrah
      batsmen: {
        'p-c-1': {
          playerId: 'p-c-1',
          name: 'Virat Roy',
          runs: 62,
          balls: 41,
          fours: 7,
          sixes: 2,
          isOut: false
        },
        'p-c-2': {
          playerId: 'p-c-2',
          name: 'Rohan Sharma',
          runs: 28,
          balls: 19,
          fours: 3,
          sixes: 1,
          isOut: true,
          dismissal: 'caught'
        },
        'p-c-3': {
          playerId: 'p-c-3',
          name: 'Glenn Maxwell',
          runs: 35,
          balls: 18,
          fours: 2,
          sixes: 3,
          isOut: false
        }
      },
      bowlers: {
        'p-c-7': {
          playerId: 'p-c-7',
          name: 'Jasprit Bumrah',
          overs: 2,
          maidens: 0,
          runsConceded: 18,
          wickets: 1,
          wides: 1,
          noBalls: 0
        },
        'p-c-8': {
          playerId: 'p-c-8',
          name: 'Hardik Patel',
          overs: 3,
          maidens: 0,
          runsConceded: 29,
          wickets: 1,
          wides: 2,
          noBalls: 1
        },
        'p-c-11': {
          playerId: 'p-c-11',
          name: 'Piyush Chawla',
          overs: 4,
          maidens: 0,
          runsConceded: 38,
          wickets: 1,
          wides: 1,
          noBalls: 0
        }
      },
      recentBalls: [
        { text: '1', runs: 1, isWicket: false, isExtra: false },
        { text: '4', runs: 4, isWicket: false, isExtra: false },
        { text: '•', runs: 0, isWicket: false, isExtra: false },
        { text: '6', runs: 6, isWicket: false, isExtra: false },
        { text: 'Wd', runs: 1, isWicket: false, isExtra: true },
        { text: '1', runs: 1, isWicket: false, isExtra: false },
        { text: '2', runs: 2, isWicket: false, isExtra: false },
        { text: '4', runs: 4, isWicket: false, isExtra: false }
      ]
    },
    events: [
      {
        id: 'ev-c-1',
        timestamp: Date.now() - 45000,
        matchId: 'cricket-match-101',
        type: 'FOUR',
        description: 'Virat Roy smashes a boundary through extra cover! Beautiful drive.',
        scoreSnapshot: {}
      },
      {
        id: 'ev-c-2',
        timestamp: Date.now() - 95000,
        matchId: 'cricket-match-101',
        type: 'SIX',
        description: 'Glenn Maxwell launches Bumrah over deep midwicket into the stands! Huge 88m six!',
        scoreSnapshot: {}
      }
    ],
    createdAt: '2026-10-04T18:00:00Z',
    updatedAt: new Date().toISOString()
  },

  // 2. VOLLEYBALL MATCH
  {
    id: 'volleyball-match-201',
    tournamentId: 't-volley-1',
    tournamentName: 'National Spikers Trophy 2026',
    organizationId: 'org-coast-03',
    sport: 'volleyball',
    title: 'Semi-Final 1: Chennai Smashers vs Hyderabad Hawks',
    stage: 'Semi-Final',
    venue: 'Jawaharlal Nehru Indoor Stadium, Chennai',
    scheduledAt: '2026-10-04T20:00:00Z',
    status: 'live',
    teamA: {
      id: 'team-vol-chn',
      name: 'Chennai Smashers',
      shortName: 'CHN',
      color: '#eab308',
      players: [
        { id: 'p-v-1', name: 'Karthik Rao', role: 'Outside Hitter', jerseyNumber: 7 },
        { id: 'p-v-2', name: 'Jerome Vinith', role: 'Opposite', jerseyNumber: 9 },
        { id: 'p-v-3', name: 'Muthusamy', role: 'Setter', jerseyNumber: 10 },
        { id: 'p-v-4', name: 'Naveen Kumar', role: 'Middle Blocker', jerseyNumber: 14 }
      ]
    },
    teamB: {
      id: 'team-vol-hyd',
      name: 'Hyderabad Hawks',
      shortName: 'HYD',
      color: '#06b6d4',
      players: [
        { id: 'p-v-5', name: 'Ashwal Rai', role: 'Middle Blocker', jerseyNumber: 12 },
        { id: 'p-v-6', name: 'Vinit Kumar', role: 'Opposite Hitter', jerseyNumber: 4 },
        { id: 'p-v-7', name: 'Ranjit Singh', role: 'Setter', jerseyNumber: 11 },
        { id: 'p-v-8', name: 'Prabhakaran', role: 'Libero', jerseyNumber: 1 }
      ]
    },
    scoreState: {
      sport: 'volleyball',
      bestOfSets: 3,
      pointsToWinSet: 25,
      mustWinByTwo: true,
      currentSetIndex: 1, // Set 2
      teamASetsWon: 1, // Chennai won set 1 (25-22)
      teamBSetsWon: 0,
      currentSetTeamAPoints: 23,
      currentSetTeamBPoints: 22,
      servingTeamId: 'team-vol-chn',
      setHistory: [
        {
          setNumber: 1,
          teamAScore: 25,
          teamBScore: 22,
          winnerTeamId: 'team-vol-chn',
          durationMinutes: 24
        }
      ],
      teamATimeouts: 1,
      teamBTimeouts: 1
    },
    events: [
      {
        id: 'ev-v-1',
        timestamp: Date.now() - 30000,
        matchId: 'volleyball-match-201',
        type: 'KILL',
        description: 'Thunderous cross-court spike by Jerome Vinith! Point for Chennai Smashers (23-22)',
        scoreSnapshot: {}
      },
      {
        id: 'ev-v-2',
        timestamp: Date.now() - 75000,
        matchId: 'volleyball-match-201',
        type: 'BLOCK',
        description: 'Monster triple block from Ashwal Rai denies the smash! Point for Hyderabad Hawks (22-22)',
        scoreSnapshot: {}
      }
    ],
    createdAt: '2026-10-04T19:00:00Z',
    updatedAt: new Date().toISOString()
  },

  // 3. KABADDI MATCH
  {
    id: 'kabaddi-match-301',
    tournamentId: 't-kabaddi-1',
    tournamentName: 'Pro Arena Kabaddi Cup 2026',
    organizationId: 'org-apex-01',
    sport: 'kabaddi',
    title: 'Match 8: Delhi Dynamos vs Jaipur Titans',
    stage: 'League - Match 8',
    venue: 'Thyagaraj Sports Complex, New Delhi',
    scheduledAt: '2026-10-04T18:30:00Z',
    status: 'live',
    teamA: {
      id: 'team-kab-del',
      name: 'Delhi Dynamos',
      shortName: 'DEL',
      color: '#f97316',
      players: [
        { id: 'p-k-1', name: 'Naveen Express', role: 'Main Raider', jerseyNumber: 10 },
        { id: 'p-k-2', name: 'Manjeet Chillar', role: 'Left Corner', jerseyNumber: 4 },
        { id: 'p-k-3', name: 'Joginder Narwal', role: 'Right Corner', jerseyNumber: 5 }
      ]
    },
    teamB: {
      id: 'team-kab-jai',
      name: 'Jaipur Titans',
      shortName: 'JAI',
      color: '#ec4899',
      players: [
        { id: 'p-k-4', name: 'Arjun Deshwal', role: 'Main Raider', jerseyNumber: 9 },
        { id: 'p-k-5', name: 'Sunil Kumar', role: 'Right Cover', jerseyNumber: 3 },
        { id: 'p-k-6', name: 'Sahul Kumar', role: 'Right Corner', jerseyNumber: 7 }
      ]
    },
    scoreState: {
      sport: 'kabaddi',
      half: 2,
      halfDurationMinutes: 20,
      timeRemainingSeconds: 420, // 7 mins remaining
      teamAScore: 32,
      teamBScore: 30,
      teamAStats: {
        raidPoints: 21,
        tacklePoints: 7,
        bonusPoints: 2,
        allOutPoints: 2,
        activePlayersOnMat: 5
      },
      teamBStats: {
        raidPoints: 19,
        tacklePoints: 8,
        bonusPoints: 3,
        allOutPoints: 0,
        activePlayersOnMat: 4
      },
      activeRaidingTeamId: 'team-kab-del',
      raidTimerSeconds: 30,
      isDoOrDieRaid: false
    },
    events: [
      {
        id: 'ev-k-1',
        timestamp: Date.now() - 20000,
        matchId: 'kabaddi-match-301',
        type: 'SUPER_RAID',
        description: 'SUPER RAID! Naveen Express eludes 3 defenders and crosses the midline! +3 points!',
        scoreSnapshot: {}
      }
    ],
    createdAt: '2026-10-04T17:30:00Z',
    updatedAt: new Date().toISOString()
  },

  // 4. BADMINTON MATCH
  {
    id: 'badminton-match-401',
    tournamentId: 't-badminton-1',
    tournamentName: 'Apex South Badminton Open 2026',
    organizationId: 'org-apex-01',
    sport: 'badminton',
    title: 'Men Singles Final: Lakshya Sen vs HS Prannoy',
    stage: 'Championship Final',
    venue: 'Kanteerava Indoor Stadium, Bengaluru',
    scheduledAt: '2026-10-05T10:00:00Z',
    status: 'live',
    teamA: {
      id: 'team-bad-sen',
      name: 'Lakshya Sen',
      shortName: 'SEN',
      color: '#06b6d4',
      players: [{ id: 'p-b-1', name: 'Lakshya Sen', role: 'Shuttler' }]
    },
    teamB: {
      id: 'team-bad-prannoy',
      name: 'HS Prannoy',
      shortName: 'PRN',
      color: '#f59e0b',
      players: [{ id: 'p-b-2', name: 'HS Prannoy', role: 'Shuttler' }]
    },
    scoreState: {
      sport: 'badminton',
      bestOfSets: 3,
      pointsToWinSet: 21,
      mustWinByTwo: true,
      currentSetIndex: 1, // Set 2
      teamASetsWon: 1, // Won Set 1: 21-18
      teamBSetsWon: 0,
      currentSetTeamAPoints: 19,
      currentSetTeamBPoints: 17,
      servingTeamId: 'team-bad-sen',
      setHistory: [
        {
          setNumber: 1,
          teamAScore: 21,
          teamBScore: 18,
          winnerTeamId: 'team-bad-sen',
          durationMinutes: 22
        }
      ],
      teamATimeouts: 0,
      teamBTimeouts: 1
    },
    events: [
      {
        id: 'ev-b-1',
        timestamp: Date.now() - 15000,
        matchId: 'badminton-match-401',
        type: 'SMASH_WINNER',
        description: 'Blistering 390 km/h jump smash down the line by Lakshya Sen! (19-17)',
        scoreSnapshot: {}
      }
    ],
    createdAt: '2026-10-05T09:30:00Z',
    updatedAt: new Date().toISOString()
  },

  // 5. KHO-KHO MATCH
  {
    id: 'khokho-match-501',
    tournamentId: 't-khokho-1',
    tournamentName: 'National Youth Kho-Kho Trophy',
    organizationId: 'org-youth-02',
    sport: 'kho-kho',
    title: 'Quarter-Final 2: Maharashtra Chasers vs Pune Panthers',
    stage: 'Quarter-Final',
    venue: 'Shiv Chhatrapati Sports Complex, Pune',
    scheduledAt: '2026-10-05T14:00:00Z',
    status: 'live',
    teamA: {
      id: 'team-kk-mah',
      name: 'Maharashtra Chasers',
      shortName: 'MAH',
      color: '#ec4899',
      players: [
        { id: 'p-kk-1', name: 'Pratik Waikar', role: 'Wazir' },
        { id: 'p-kk-2', name: 'Abhinandan Patil', role: 'Chaser' }
      ]
    },
    teamB: {
      id: 'team-kk-pun',
      name: 'Pune Panthers',
      shortName: 'PUN',
      color: '#8b5cf6',
      players: [
        { id: 'p-kk-3', name: 'Sagar Potdar', role: 'Defender' },
        { id: 'p-kk-4', name: 'Akshay Ganpule', role: 'All-Rounder' }
      ]
    },
    scoreState: {
      sport: 'kabaddi', // Reusing raid-chase polymorphic score model
      half: 1,
      halfDurationMinutes: 9,
      timeRemainingSeconds: 240, // 4 mins
      teamAScore: 18,
      teamBScore: 12,
      teamAStats: {
        raidPoints: 16,
        tacklePoints: 2,
        bonusPoints: 0,
        allOutPoints: 0,
        activePlayersOnMat: 9
      },
      teamBStats: {
        raidPoints: 10,
        tacklePoints: 2,
        bonusPoints: 0,
        allOutPoints: 0,
        activePlayersOnMat: 3
      },
      activeRaidingTeamId: 'team-kk-mah',
      raidTimerSeconds: 30,
      isDoOrDieRaid: false
    },
    events: [
      {
        id: 'ev-kk-1',
        timestamp: Date.now() - 40000,
        matchId: 'khokho-match-501',
        type: 'POLE_DIVE',
        description: 'Sensational pole dive tag by Pratik Waikar dismisses Batch 2 defender! (+2 points)',
        scoreSnapshot: {}
      }
    ],
    createdAt: '2026-10-05T13:45:00Z',
    updatedAt: new Date().toISOString()
  },

  // 6. ATHLETICS MATCH / EVENT
  {
    id: 'athletics-match-601',
    tournamentId: 't-athletics-1',
    tournamentName: 'Youth Athletics National Trials',
    organizationId: 'org-youth-02',
    sport: 'athletics',
    title: 'U-20 Men 100m Sprint Heats',
    stage: 'Heats - Heat 3',
    venue: 'Balewadi Track & Field Stadium, Pune',
    scheduledAt: '2026-10-05T16:00:00Z',
    status: 'live',
    teamA: {
      id: 'team-ath-track',
      name: 'Track Heat 3 (Lanes 1-4)',
      shortName: 'H3-A',
      color: '#e11d48',
      players: [
        { id: 'p-ath-1', name: 'Manikanta Hoblidhar', role: 'Sprinter', jerseyNumber: 104 },
        { id: 'p-ath-2', name: 'Amlan Borgohain', role: 'Sprinter', jerseyNumber: 108 }
      ]
    },
    teamB: {
      id: 'team-ath-track-b',
      name: 'Track Heat 3 (Lanes 5-8)',
      shortName: 'H3-B',
      color: '#0284c7',
      players: [
        { id: 'p-ath-3', name: 'Elakkiyadasan K.', role: 'Sprinter', jerseyNumber: 112 },
        { id: 'p-ath-4', name: 'Gurindervir Singh', role: 'Sprinter', jerseyNumber: 116 }
      ]
    },
    scoreState: {
      sport: 'athletics',
      eventType: '100m',
      unit: 'seconds',
      heats: [
        {
          heatNumber: 3,
          laneAssignments: [
            { lane: 3, athleteName: 'Manikanta H.', teamName: 'Karnataka', bibNumber: 104, result: 10.23, rank: 1, status: 'finished' },
            { lane: 4, athleteName: 'Amlan Borgohain', teamName: 'Assam', bibNumber: 108, result: 10.34, rank: 2, status: 'finished' },
            { lane: 5, athleteName: 'Elakkiyadasan K.', teamName: 'Tamil Nadu', bibNumber: 112, result: 10.42, rank: 3, status: 'finished' },
            { lane: 6, athleteName: 'Gurindervir Singh', teamName: 'Punjab', bibNumber: 116, result: 10.49, rank: 4, status: 'finished' }
          ]
        }
      ]
    },
    events: [
      {
        id: 'ev-ath-1',
        timestamp: Date.now() - 10000,
        matchId: 'athletics-match-601',
        type: 'RECORD_SPLIT',
        description: 'Manikanta crosses the line in 10.23s! Qualifies for the Championship Final with Heat Record.',
        scoreSnapshot: {}
      }
    ],
    createdAt: '2026-10-05T15:30:00Z',
    updatedAt: new Date().toISOString()
  },

  // 7. THROWBALL MATCH
  {
    id: 'throwball-match-701',
    tournamentId: 't-throwball-1',
    tournamentName: 'Coastal Women Throwball League',
    organizationId: 'org-coast-03',
    sport: 'throwball',
    title: 'League Match 6: Mangaluru Mermaids vs Udupi Waves',
    stage: 'League Round 2',
    venue: 'Mangala Stadium, Mangaluru',
    scheduledAt: '2026-10-05T17:00:00Z',
    status: 'upcoming',
    teamA: {
      id: 'team-tb-mng',
      name: 'Mangaluru Mermaids',
      shortName: 'MNG',
      color: '#3b82f6',
      players: [
        { id: 'p-tb-1', name: 'Divya Poojary', role: 'Captain' },
        { id: 'p-tb-2', name: 'Shreya Rai', role: 'Thrower' }
      ]
    },
    teamB: {
      id: 'team-tb-udp',
      name: 'Udupi Waves',
      shortName: 'UDP',
      color: '#14b8a6',
      players: [
        { id: 'p-tb-3', name: 'Bhavya Shetty', role: 'Captain' },
        { id: 'p-tb-4', name: 'Rashmi Rao', role: 'Receiver' }
      ]
    },
    scoreState: {
      sport: 'throwball',
      bestOfSets: 3,
      pointsToWinSet: 25,
      mustWinByTwo: true,
      currentSetIndex: 0,
      teamASetsWon: 0,
      teamBSetsWon: 0,
      currentSetTeamAPoints: 0,
      currentSetTeamBPoints: 0,
      servingTeamId: 'team-tb-mng',
      setHistory: [],
      teamATimeouts: 0,
      teamBTimeouts: 0
    },
    events: [],
    createdAt: '2026-10-05T16:30:00Z',
    updatedAt: new Date().toISOString()
  },

  // 8. TABLE TENNIS MATCH
  {
    id: 'tt-match-801',
    tournamentId: 't-tt-1',
    tournamentName: 'Coastal TT Invitational',
    organizationId: 'org-coast-03',
    sport: 'table-tennis',
    title: 'Men Singles Semi-Final: Sharath Kamal vs Sathiyan G.',
    stage: 'Semi-Final 2',
    venue: 'Canara Club, Mangaluru',
    scheduledAt: '2026-10-05T18:00:00Z',
    status: 'upcoming',
    teamA: {
      id: 'team-tt-kamal',
      name: 'Sharath Kamal',
      shortName: 'KAM',
      color: '#10b981',
      players: [{ id: 'p-tt-1', name: 'Sharath Kamal', role: 'Paddler' }]
    },
    teamB: {
      id: 'team-tt-sathiyan',
      name: 'Sathiyan G.',
      shortName: 'SAT',
      color: '#6366f1',
      players: [{ id: 'p-tt-2', name: 'Sathiyan G.', role: 'Paddler' }]
    },
    scoreState: {
      sport: 'table-tennis',
      bestOfSets: 5,
      pointsToWinSet: 11,
      mustWinByTwo: true,
      currentSetIndex: 0,
      teamASetsWon: 0,
      teamBSetsWon: 0,
      currentSetTeamAPoints: 0,
      currentSetTeamBPoints: 0,
      servingTeamId: 'team-tt-kamal',
      setHistory: [],
      teamATimeouts: 0,
      teamBTimeouts: 0
    },
    events: [],
    createdAt: '2026-10-05T17:00:00Z',
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_CRICKET_STANDINGS: StandingsRow[] = [
  {
    teamId: 'team-cricket-blr',
    teamName: 'Bangalore Blitzers',
    teamShort: 'BLR',
    teamColor: '#ef4444',
    played: 5,
    won: 4,
    lost: 1,
    tied: 0,
    points: 8,
    form: ['W', 'W', 'L', 'W', 'W'],
    nrr: 0.842,
    runsScored: 890,
    oversFaced: 96.4,
    runsConceded: 810,
    oversBowled: 100.0
  },
  {
    teamId: 'team-cricket-mum',
    teamName: 'Mumbai Mavericks',
    teamShort: 'MUM',
    teamColor: '#3b82f6',
    played: 5,
    won: 3,
    lost: 2,
    tied: 0,
    points: 6,
    form: ['W', 'L', 'W', 'W', 'L'],
    nrr: 0.354,
    runsScored: 845,
    oversFaced: 98.2,
    runsConceded: 812,
    oversBowled: 97.5
  },
  {
    teamId: 'team-cricket-csk',
    teamName: 'Chennai Kings',
    teamShort: 'CSK',
    teamColor: '#eab308',
    played: 5,
    won: 3,
    lost: 2,
    tied: 0,
    points: 6,
    form: ['L', 'W', 'W', 'L', 'W'],
    nrr: 0.125,
    runsScored: 820,
    oversFaced: 100.0,
    runsConceded: 815,
    oversBowled: 99.1
  },
  {
    teamId: 'team-cricket-del',
    teamName: 'Delhi Strikers',
    teamShort: 'DEL',
    teamColor: '#06b6d4',
    played: 5,
    won: 1,
    lost: 4,
    tied: 0,
    points: 2,
    form: ['L', 'L', 'L', 'W', 'L'],
    nrr: -0.678,
    runsScored: 760,
    oversFaced: 100.0,
    runsConceded: 840,
    oversBowled: 95.0
  }
];

export const INITIAL_VOLLEYBALL_STANDINGS: StandingsRow[] = [
  {
    teamId: 'team-vol-chn',
    teamName: 'Chennai Smashers',
    teamShort: 'CHN',
    teamColor: '#eab308',
    played: 4,
    won: 4,
    lost: 0,
    tied: 0,
    points: 11,
    form: ['W', 'W', 'W', 'W'],
    setsWon: 12,
    setsLost: 2,
    setRatio: 6.0,
    pointsRatio: 1.24
  },
  {
    teamId: 'team-vol-hyd',
    teamName: 'Hyderabad Hawks',
    teamShort: 'HYD',
    teamColor: '#06b6d4',
    played: 4,
    won: 3,
    lost: 1,
    tied: 0,
    points: 9,
    form: ['W', 'L', 'W', 'W'],
    setsWon: 10,
    setsLost: 5,
    setRatio: 2.0,
    pointsRatio: 1.12
  },
  {
    teamId: 'team-vol-ker',
    teamName: 'Kochi Spikers',
    teamShort: 'KOC',
    teamColor: '#10b981',
    played: 4,
    won: 1,
    lost: 3,
    tied: 0,
    points: 4,
    form: ['L', 'W', 'L', 'L'],
    setsWon: 5,
    setsLost: 10,
    setRatio: 0.5,
    pointsRatio: 0.91
  },
  {
    teamId: 'team-vol-kol',
    teamName: 'Kolkata Aces',
    teamShort: 'KOL',
    teamColor: '#a855f7',
    played: 4,
    won: 0,
    lost: 4,
    tied: 0,
    points: 1,
    form: ['L', 'L', 'L', 'L'],
    setsWon: 2,
    setsLost: 12,
    setRatio: 0.16,
    pointsRatio: 0.82
  }
];

export const INITIAL_KABADDI_STANDINGS: StandingsRow[] = [
  {
    teamId: 'team-kab-del',
    teamName: 'Delhi Dynamos',
    teamShort: 'DEL',
    teamColor: '#f97316',
    played: 4,
    won: 3,
    lost: 1,
    tied: 0,
    points: 16,
    form: ['W', 'W', 'L', 'W'],
    scoreDiff: 28
  },
  {
    teamId: 'team-kab-jai',
    teamName: 'Jaipur Titans',
    teamShort: 'JAI',
    teamColor: '#ec4899',
    played: 4,
    won: 2,
    lost: 1,
    tied: 1,
    points: 13,
    form: ['W', 'T', 'W', 'L'],
    scoreDiff: 14
  },
  {
    teamId: 'team-kab-pat',
    teamName: 'Patna Pirates',
    teamShort: 'PAT',
    teamColor: '#10b981',
    played: 4,
    won: 2,
    lost: 2,
    tied: 0,
    points: 10,
    form: ['L', 'W', 'L', 'W'],
    scoreDiff: -4
  },
  {
    teamId: 'team-kab-pun',
    teamName: 'Puneri Paltan',
    teamShort: 'PUN',
    teamColor: '#eab308',
    played: 4,
    won: 0,
    lost: 3,
    tied: 1,
    points: 4,
    form: ['L', 'T', 'L', 'L'],
    scoreDiff: -38
  }
];
