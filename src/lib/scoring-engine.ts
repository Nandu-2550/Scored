import { 
  Match, 
  CricketScoreState, 
  SetRallyScoreState, 
  KabaddiScoreState, 
  MatchEvent 
} from '@/types/sports';

// -------------------------------------------------------------
// CRICKET ACTIONS
// -------------------------------------------------------------
export type CricketAction = 
  | { type: 'BALL_RUNS'; runs: number }
  | { type: 'BALL_EXTRA'; extraType: 'wide' | 'noBall' | 'bye' | 'legBye'; runsAdded: number }
  | { type: 'WICKET'; dismissalType: 'bowled' | 'caught' | 'lbw' | 'runOut' | 'stumped'; nextBatsmanId?: string; nextBatsmanName?: string }
  | { type: 'SWITCH_STRIKE' }
  | { type: 'CHANGE_BOWLER'; bowlerId: string; bowlerName: string };

export function processCricketAction(
  match: Match,
  action: CricketAction
): { updatedMatch: Match; eventDescription: string } {
  const currentScore = { ...match.scoreState } as CricketScoreState;
  // Clone nested structures
  currentScore.extras = { ...currentScore.extras };
  currentScore.batsmen = { ...currentScore.batsmen };
  currentScore.bowlers = { ...currentScore.bowlers };
  currentScore.recentBalls = [...(currentScore.recentBalls || [])];

  const striker = currentScore.batsmen[currentScore.currentStrikerId] || {
    playerId: currentScore.currentStrikerId,
    name: 'Striker',
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut: false
  };

  const bowler = currentScore.bowlers[currentScore.currentBowlerId] || {
    playerId: currentScore.currentBowlerId,
    name: 'Bowler',
    overs: 0,
    maidens: 0,
    runsConceded: 0,
    wickets: 0,
    wides: 0,
    noBalls: 0
  };

  let eventDesc = '';
  let eventType = 'CRICKET_UPDATE';

  switch (action.type) {
    case 'BALL_RUNS': {
      const runs = action.runs;
      currentScore.totalRuns += runs;
      striker.runs += runs;
      striker.balls += 1;
      if (runs === 4) striker.fours += 1;
      if (runs === 6) striker.sixes += 1;
      bowler.runsConceded += runs;

      // Legal delivery increment
      currentScore.balls += 1;
      const ballBallText = runs === 0 ? '•' : runs.toString();
      currentScore.recentBalls.push({ text: ballBallText, runs, isWicket: false, isExtra: false });

      eventDesc = `${striker.name} scores ${runs} run${runs !== 1 ? 's' : ''}`;
      eventType = runs === 4 ? 'FOUR' : runs === 6 ? 'SIX' : runs === 0 ? 'DOT_BALL' : 'RUNS';

      // Odd runs rotate strike
      if (runs % 2 === 1) {
        const temp = currentScore.currentStrikerId;
        currentScore.currentStrikerId = currentScore.currentNonStrikerId;
        currentScore.currentNonStrikerId = temp;
      }

      // Check over completion (6 balls)
      if (currentScore.balls >= 6) {
        currentScore.overs += 1;
        currentScore.balls = 0;
        bowler.overs += 1;
        // Strike rotates at over change
        const temp = currentScore.currentStrikerId;
        currentScore.currentStrikerId = currentScore.currentNonStrikerId;
        currentScore.currentNonStrikerId = temp;
        eventDesc += ` | Over ${currentScore.overs} complete`;
      }
      break;
    }

    case 'BALL_EXTRA': {
      const { extraType, runsAdded } = action;
      currentScore.totalRuns += runsAdded;
      bowler.runsConceded += runsAdded;

      if (extraType === 'wide') {
        currentScore.extras.wides += runsAdded;
        bowler.wides += 1;
        currentScore.recentBalls.push({ text: `Wd+${runsAdded - 1}`, runs: runsAdded, isWicket: false, isExtra: true });
        eventDesc = `Wide ball! +${runsAdded} run to total`;
        // Wide ball doesn't count towards over balls
      } else if (extraType === 'noBall') {
        currentScore.extras.noBalls += runsAdded;
        bowler.noBalls += 1;
        currentScore.recentBalls.push({ text: `Nb+${runsAdded - 1}`, runs: runsAdded, isWicket: false, isExtra: true });
        eventDesc = `No Ball! Free hit upcoming. +${runsAdded} run`;
        // No ball doesn't count towards legal balls
      } else if (extraType === 'bye') {
        currentScore.extras.byes += runsAdded;
        currentScore.balls += 1;
        striker.balls += 1;
        currentScore.recentBalls.push({ text: `${runsAdded}B`, runs: runsAdded, isWicket: false, isExtra: true });
        eventDesc = `Bye: ${runsAdded} run${runsAdded > 1 ? 's' : ''}`;
        if (runsAdded % 2 === 1) {
          const temp = currentScore.currentStrikerId;
          currentScore.currentStrikerId = currentScore.currentNonStrikerId;
          currentScore.currentNonStrikerId = temp;
        }
        if (currentScore.balls >= 6) {
          currentScore.overs += 1;
          currentScore.balls = 0;
          bowler.overs += 1;
          const temp = currentScore.currentStrikerId;
          currentScore.currentStrikerId = currentScore.currentNonStrikerId;
          currentScore.currentNonStrikerId = temp;
        }
      } else if (extraType === 'legBye') {
        currentScore.extras.legByes += runsAdded;
        currentScore.balls += 1;
        striker.balls += 1;
        currentScore.recentBalls.push({ text: `${runsAdded}Lb`, runs: runsAdded, isWicket: false, isExtra: true });
        eventDesc = `Leg Bye: ${runsAdded} run${runsAdded > 1 ? 's' : ''}`;
        if (runsAdded % 2 === 1) {
          const temp = currentScore.currentStrikerId;
          currentScore.currentStrikerId = currentScore.currentNonStrikerId;
          currentScore.currentNonStrikerId = temp;
        }
        if (currentScore.balls >= 6) {
          currentScore.overs += 1;
          currentScore.balls = 0;
          bowler.overs += 1;
          const temp = currentScore.currentStrikerId;
          currentScore.currentStrikerId = currentScore.currentNonStrikerId;
          currentScore.currentNonStrikerId = temp;
        }
      }
      eventType = 'EXTRA';
      break;
    }

    case 'WICKET': {
      currentScore.wickets += 1;
      currentScore.balls += 1;
      striker.balls += 1;
      striker.isOut = true;
      striker.dismissal = action.dismissalType;
      bowler.wickets += 1;

      currentScore.recentBalls.push({ text: 'W', runs: 0, isWicket: true, isExtra: false });
      eventDesc = `WICKET! ${striker.name} dismissed (${action.dismissalType}) by ${bowler.name}`;
      eventType = 'WICKET';

      // Assign new batsman if provided
      if (action.nextBatsmanId && action.nextBatsmanName) {
        currentScore.batsmen[action.nextBatsmanId] = {
          playerId: action.nextBatsmanId,
          name: action.nextBatsmanName,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          isOut: false
        };
        currentScore.currentStrikerId = action.nextBatsmanId;
      }

      if (currentScore.balls >= 6) {
        currentScore.overs += 1;
        currentScore.balls = 0;
        bowler.overs += 1;
        const temp = currentScore.currentStrikerId;
        currentScore.currentStrikerId = currentScore.currentNonStrikerId;
        currentScore.currentNonStrikerId = temp;
      }
      break;
    }

    case 'SWITCH_STRIKE': {
      const temp = currentScore.currentStrikerId;
      currentScore.currentStrikerId = currentScore.currentNonStrikerId;
      currentScore.currentNonStrikerId = temp;
      eventDesc = 'Manual strike rotation';
      eventType = 'STRIKE_ROTATE';
      break;
    }

    case 'CHANGE_BOWLER': {
      currentScore.currentBowlerId = action.bowlerId;
      if (!currentScore.bowlers[action.bowlerId]) {
        currentScore.bowlers[action.bowlerId] = {
          playerId: action.bowlerId,
          name: action.bowlerName,
          overs: 0,
          maidens: 0,
          runsConceded: 0,
          wickets: 0,
          wides: 0,
          noBalls: 0
        };
      }
      eventDesc = `${action.bowlerName} brought into bowling attack`;
      eventType = 'BOWLER_CHANGE';
      break;
    }
  }

  // Update back
  currentScore.batsmen[striker.playerId] = striker;
  currentScore.bowlers[bowler.playerId] = bowler;

  // Trim recent balls to last 24
  if (currentScore.recentBalls.length > 24) {
    currentScore.recentBalls = currentScore.recentBalls.slice(-24);
  }

  const newEvent: MatchEvent = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    matchId: match.id,
    type: eventType,
    description: eventDesc,
    scoreSnapshot: JSON.parse(JSON.stringify(match.scoreState)) // save previous state for undo!
  };

  return {
    updatedMatch: {
      ...match,
      status: 'live',
      scoreState: currentScore,
      events: [newEvent, ...match.events],
      updatedAt: new Date().toISOString()
    },
    eventDescription: eventDesc
  };
}

// -------------------------------------------------------------
// VOLLEYBALL / SET-RALLY ACTIONS
// -------------------------------------------------------------
export type VolleyballAction = 
  | { type: 'POINT'; scoringTeam: 'teamA' | 'teamB'; actionDetail?: 'kill' | 'ace' | 'block' | 'error' }
  | { type: 'TIMEOUT'; team: 'teamA' | 'teamB' }
  | { type: 'SWITCH_SERVER'; team: 'teamA' | 'teamB' };

export function processVolleyballAction(
  match: Match,
  action: VolleyballAction
): { updatedMatch: Match; eventDescription: string } {
  const currentScore = { ...match.scoreState } as SetRallyScoreState;
  currentScore.setHistory = [...(currentScore.setHistory || [])];

  let eventDesc = '';
  let eventType = 'RALLY_POINT';

  const teamAName = match.teamA.name;
  const teamBName = match.teamB.name;

  if (action.type === 'POINT') {
    const isTeamA = action.scoringTeam === 'teamA';
    if (isTeamA) {
      currentScore.currentSetTeamAPoints += 1;
      currentScore.servingTeamId = match.teamA.id;
    } else {
      currentScore.currentSetTeamBPoints += 1;
      currentScore.servingTeamId = match.teamB.id;
    }

    const detailText = action.actionDetail ? ` via ${action.actionDetail.toUpperCase()}` : '';
    eventDesc = `Point for ${isTeamA ? teamAName : teamBName}${detailText} (${currentScore.currentSetTeamAPoints} - ${currentScore.currentSetTeamBPoints})`;
    eventType = action.actionDetail ? action.actionDetail.toUpperCase() : 'POINT';

    // Check set win condition
    const ptsA = currentScore.currentSetTeamAPoints;
    const ptsB = currentScore.currentSetTeamBPoints;
    const targetPoints = currentScore.currentSetIndex === (currentScore.bestOfSets - 1) ? 15 : currentScore.pointsToWinSet;

    const hasWonSetA = ptsA >= targetPoints && (!currentScore.mustWinByTwo || (ptsA - ptsB >= 2));
    const hasWonSetB = ptsB >= targetPoints && (!currentScore.mustWinByTwo || (ptsB - ptsA >= 2));

    if (hasWonSetA || hasWonSetB) {
      const winnerTeam = hasWonSetA ? match.teamA : match.teamB;
      if (hasWonSetA) currentScore.teamASetsWon += 1;
      if (hasWonSetB) currentScore.teamBSetsWon += 1;

      currentScore.setHistory.push({
        setNumber: currentScore.currentSetIndex + 1,
        teamAScore: ptsA,
        teamBScore: ptsB,
        winnerTeamId: winnerTeam.id
      });

      eventDesc += ` | SET ${currentScore.currentSetIndex + 1} WON by ${winnerTeam.name}!`;

      // Check if match won
      const setsNeeded = Math.ceil(currentScore.bestOfSets / 2);
      if (currentScore.teamASetsWon >= setsNeeded || currentScore.teamBSetsWon >= setsNeeded) {
        eventDesc += ` | MATCH FINISHED! ${winnerTeam.name} wins the match!`;
        return {
          updatedMatch: {
            ...match,
            status: 'completed',
            winnerTeamId: winnerTeam.id,
            resultSummary: `${winnerTeam.name} won (${currentScore.teamASetsWon} - ${currentScore.teamBSetsWon})`,
            scoreState: {
              ...currentScore,
              currentSetTeamAPoints: 0,
              currentSetTeamBPoints: 0
            },
            events: [{
              id: `ev-${Date.now()}`,
              timestamp: Date.now(),
              matchId: match.id,
              type: 'MATCH_WON',
              description: eventDesc,
              scoreSnapshot: JSON.parse(JSON.stringify(match.scoreState))
            }, ...match.events],
            updatedAt: new Date().toISOString()
          },
          eventDescription: eventDesc
        };
      } else {
        // Proceed to next set
        currentScore.currentSetIndex += 1;
        currentScore.currentSetTeamAPoints = 0;
        currentScore.currentSetTeamBPoints = 0;
        currentScore.teamATimeouts = 0;
        currentScore.teamBTimeouts = 0;
      }
    }
  } else if (action.type === 'TIMEOUT') {
    const isTeamA = action.team === 'teamA';
    if (isTeamA) currentScore.teamATimeouts += 1;
    else currentScore.teamBTimeouts += 1;
    eventDesc = `Timeout called by ${isTeamA ? teamAName : teamBName}`;
    eventType = 'TIMEOUT';
  } else if (action.type === 'SWITCH_SERVER') {
    currentScore.servingTeamId = action.team === 'teamA' ? match.teamA.id : match.teamB.id;
    eventDesc = `Service rotated to ${action.team === 'teamA' ? teamAName : teamBName}`;
    eventType = 'SERVICE_ROTATION';
  }

  const newEvent: MatchEvent = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    matchId: match.id,
    type: eventType,
    description: eventDesc,
    scoreSnapshot: JSON.parse(JSON.stringify(match.scoreState))
  };

  return {
    updatedMatch: {
      ...match,
      status: 'live',
      scoreState: currentScore,
      events: [newEvent, ...match.events],
      updatedAt: new Date().toISOString()
    },
    eventDescription: eventDesc
  };
}

// -------------------------------------------------------------
// KABADDI ACTIONS
// -------------------------------------------------------------
export type KabaddiAction =
  | { type: 'RAID_SUCCESS'; team: 'teamA' | 'teamB'; points: number; isBonus?: boolean }
  | { type: 'TACKLE_SUCCESS'; team: 'teamA' | 'teamB'; isSuperTackle?: boolean }
  | { type: 'EMPTY_RAID'; team: 'teamA' | 'teamB' }
  | { type: 'ALL_OUT'; teamAllOut: 'teamA' | 'teamB' }
  | { type: 'TOGGLE_HALF' };

export function processKabaddiAction(
  match: Match,
  action: KabaddiAction
): { updatedMatch: Match; eventDescription: string } {
  const currentScore = { ...match.scoreState } as KabaddiScoreState;
  currentScore.teamAStats = { ...currentScore.teamAStats };
  currentScore.teamBStats = { ...currentScore.teamBStats };

  let eventDesc = '';
  let eventType = 'KABADDI_EVENT';

  const teamAName = match.teamA.name;
  const teamBName = match.teamB.name;

  if (action.type === 'RAID_SUCCESS') {
    const isTeamA = action.team === 'teamA';
    const totalPts = action.points + (action.isBonus ? 1 : 0);
    if (isTeamA) {
      currentScore.teamAScore += totalPts;
      currentScore.teamAStats.raidPoints += action.points;
      if (action.isBonus) currentScore.teamAStats.bonusPoints += 1;
      // Defenders reduced
      currentScore.teamBStats.activePlayersOnMat = Math.max(1, currentScore.teamBStats.activePlayersOnMat - action.points);
      currentScore.teamAStats.activePlayersOnMat = Math.min(7, currentScore.teamAStats.activePlayersOnMat + 1);
    } else {
      currentScore.teamBScore += totalPts;
      currentScore.teamBStats.raidPoints += action.points;
      if (action.isBonus) currentScore.teamBStats.bonusPoints += 1;
      currentScore.teamAStats.activePlayersOnMat = Math.max(1, currentScore.teamAStats.activePlayersOnMat - action.points);
      currentScore.teamBStats.activePlayersOnMat = Math.min(7, currentScore.teamBStats.activePlayersOnMat + 1);
    }
    // Switch raiding team
    currentScore.activeRaidingTeamId = isTeamA ? match.teamB.id : match.teamA.id;
    eventDesc = `Successful Raid by ${isTeamA ? teamAName : teamBName}! +${totalPts} pts (${action.isBonus ? 'Bonus included' : ''})`;
    eventType = action.points >= 3 ? 'SUPER_RAID' : 'RAID_SUCCESS';
  } else if (action.type === 'TACKLE_SUCCESS') {
    const isTeamA = action.team === 'teamA';
    const pts = action.isSuperTackle ? 2 : 1;
    if (isTeamA) {
      currentScore.teamAScore += pts;
      currentScore.teamAStats.tacklePoints += pts;
      currentScore.teamAStats.activePlayersOnMat = Math.min(7, currentScore.teamAStats.activePlayersOnMat + 1);
      currentScore.teamBStats.activePlayersOnMat = Math.max(1, currentScore.teamBStats.activePlayersOnMat - 1);
    } else {
      currentScore.teamBScore += pts;
      currentScore.teamBStats.tacklePoints += pts;
      currentScore.teamBStats.activePlayersOnMat = Math.min(7, currentScore.teamBStats.activePlayersOnMat + 1);
      currentScore.teamAStats.activePlayersOnMat = Math.max(1, currentScore.teamAStats.activePlayersOnMat - 1);
    }
    currentScore.activeRaidingTeamId = isTeamA ? match.teamA.id : match.teamB.id;
    eventDesc = `${action.isSuperTackle ? 'SUPER TACKLE' : 'Tackle'} by ${isTeamA ? teamAName : teamBName}! +${pts} pts`;
    eventType = action.isSuperTackle ? 'SUPER_TACKLE' : 'TACKLE';
  } else if (action.type === 'EMPTY_RAID') {
    const isTeamA = action.team === 'teamA';
    currentScore.activeRaidingTeamId = isTeamA ? match.teamB.id : match.teamA.id;
    eventDesc = `Empty Raid by ${isTeamA ? teamAName : teamBName}. Turn turns over.`;
    eventType = 'EMPTY_RAID';
  } else if (action.type === 'ALL_OUT') {
    const isTeamAAllOut = action.teamAllOut === 'teamA';
    if (isTeamAAllOut) {
      currentScore.teamBScore += 2;
      currentScore.teamBStats.allOutPoints += 2;
      currentScore.teamAStats.activePlayersOnMat = 7;
      eventDesc = `ALL OUT! ${teamBName} inflicts an All-Out on ${teamAName} (+2 pts)! Team resets to 7 players.`;
    } else {
      currentScore.teamAScore += 2;
      currentScore.teamAStats.allOutPoints += 2;
      currentScore.teamBStats.activePlayersOnMat = 7;
      eventDesc = `ALL OUT! ${teamAName} inflicts an All-Out on ${teamBName} (+2 pts)! Team resets to 7 players.`;
    }
    eventType = 'ALL_OUT';
  } else if (action.type === 'TOGGLE_HALF') {
    currentScore.half = currentScore.half === 1 ? 2 : 1;
    eventDesc = currentScore.half === 2 ? 'Second Half commences!' : 'First Half reset';
    eventType = 'HALF_CHANGE';
  }

  const newEvent: MatchEvent = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    matchId: match.id,
    type: eventType,
    description: eventDesc,
    scoreSnapshot: JSON.parse(JSON.stringify(match.scoreState))
  };

  return {
    updatedMatch: {
      ...match,
      status: 'live',
      scoreState: currentScore,
      events: [newEvent, ...match.events],
      updatedAt: new Date().toISOString()
    },
    eventDescription: eventDesc
  };
}

// -------------------------------------------------------------
// UNIVERSAL UNDO ACTION
// -------------------------------------------------------------
export function undoLastMatchEvent(match: Match): { updatedMatch: Match; undoneDescription: string } | null {
  if (!match.events || match.events.length === 0) {
    return null;
  }

  const [lastEvent, ...remainingEvents] = match.events;
  if (!lastEvent.scoreSnapshot) {
    return null;
  }

  const restoredMatch: Match = {
    ...match,
    scoreState: lastEvent.scoreSnapshot,
    events: remainingEvents,
    updatedAt: new Date().toISOString()
  };

  return {
    updatedMatch: restoredMatch,
    undoneDescription: lastEvent.description
  };
}
