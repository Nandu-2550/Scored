import { Match, StandingsRow, SportType } from '@/types/sports';
import { 
  INITIAL_CRICKET_STANDINGS, 
  INITIAL_VOLLEYBALL_STANDINGS, 
  INITIAL_KABADDI_STANDINGS 
} from '@/lib/initial-data';

export interface OrgTeamInfo {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

/**
 * Returns all distinct teams that have matches under a specific organization and sport.
 */
export function getOrganizationTeamsForSport(
  orgId: string, 
  sport: SportType, 
  matches: Match[]
): Map<string, OrgTeamInfo> {
  const teams = new Map<string, OrgTeamInfo>();

  // Filter matches that belong to this organization and match this sport
  const orgMatches = matches.filter(m => 
    (m.organizationId ? m.organizationId === orgId : (orgId === 'org-apex-01' && !m.organizationId)) && 
    m.sport === sport
  );

  orgMatches.forEach(m => {
    if (m.teamA?.id) {
      teams.set(m.teamA.id, {
        id: m.teamA.id,
        name: m.teamA.name,
        shortName: m.teamA.shortName || m.teamA.name.slice(0, 3).toUpperCase(),
        color: m.teamA.color || '#3b82f6'
      });
    }
    if (m.teamB?.id) {
      teams.set(m.teamB.id, {
        id: m.teamB.id,
        name: m.teamB.name,
        shortName: m.teamB.shortName || m.teamB.name.slice(0, 3).toUpperCase(),
        color: m.teamB.color || '#ef4444'
      });
    }
  });

  return teams;
}

/**
 * Calculates official league standings exclusively for teams present in the given organization.
 */
export function calculateOrganizationStandings(
  orgId: string,
  sport: SportType,
  matches: Match[]
): StandingsRow[] {
  // 1. Find all teams present in this organization for this sport
  const orgTeams = getOrganizationTeamsForSport(orgId, sport, matches);
  if (orgTeams.size === 0) {
    return [];
  }

  // Baseline seed table lookup
  const seedLookup = new Map<string, StandingsRow>();
  if (sport === 'cricket') {
    INITIAL_CRICKET_STANDINGS.forEach(row => seedLookup.set(row.teamId, row));
  } else if (sport === 'volleyball') {
    INITIAL_VOLLEYBALL_STANDINGS.forEach(row => seedLookup.set(row.teamId, row));
  } else if (sport === 'kabaddi') {
    INITIAL_KABADDI_STANDINGS.forEach(row => seedLookup.set(row.teamId, row));
  }

  // 2. Initialize rows ONLY for teams present in this organization
  const standingsMap = new Map<string, StandingsRow>();

  orgTeams.forEach((team, teamId) => {
    if (seedLookup.has(teamId)) {
      // Use established seed stats for known teams in this organization
      standingsMap.set(teamId, { ...seedLookup.get(teamId)! });
    } else {
      // Initialize fresh row for new teams in this organization
      standingsMap.set(teamId, {
        teamId,
        teamName: team.name,
        teamShort: team.shortName,
        teamColor: team.color,
        played: 0,
        won: 0,
        lost: 0,
        tied: 0,
        points: 0,
        form: [],
        nrr: 0,
        runsScored: 0,
        oversFaced: 0,
        runsConceded: 0,
        oversBowled: 0,
        setsWon: 0,
        setsLost: 0,
        setRatio: 0,
        scoreDiff: 0
      });
    }
  });

  // 3. Process matches in this organization that are completed
  const orgMatches = matches.filter(m => 
    (m.organizationId ? m.organizationId === orgId : (orgId === 'org-apex-01' && !m.organizationId)) && 
    m.sport === sport
  );

  orgMatches.forEach(m => {
    // Only process dynamic/new matches or completed matches
    const isSeedMatch = 
      m.id === 'cricket-match-101' || 
      m.id === 'volleyball-match-201' || 
      m.id === 'kabaddi-match-301' || 
      m.id === 'badminton-match-401' || 
      m.id === 'khokho-match-501';

    if (isSeedMatch) {
      // Seed matches already have their points reflected in seedLookup
      return;
    }

    const teamARow = standingsMap.get(m.teamA.id);
    const teamBRow = standingsMap.get(m.teamB.id);

    if (m.status === 'completed' && teamARow && teamBRow) {
      teamARow.played += 1;
      teamBRow.played += 1;

      const winPts = sport === 'kabaddi' ? 5 : sport === 'volleyball' ? 3 : 2;

      if (m.winnerTeamId === m.teamA.id) {
        teamARow.won += 1;
        teamARow.points += winPts;
        teamARow.form = (['W', ...teamARow.form].slice(0, 5)) as ('W' | 'L' | 'T' | 'D')[];

        teamBRow.lost += 1;
        teamBRow.form = (['L', ...teamBRow.form].slice(0, 5)) as ('W' | 'L' | 'T' | 'D')[];
      } else if (m.winnerTeamId === m.teamB.id) {
        teamBRow.won += 1;
        teamBRow.points += winPts;
        teamBRow.form = (['W', ...teamBRow.form].slice(0, 5)) as ('W' | 'L' | 'T' | 'D')[];

        teamARow.lost += 1;
        teamARow.form = (['L', ...teamARow.form].slice(0, 5)) as ('W' | 'L' | 'T' | 'D')[];
      } else {
        teamARow.tied += 1;
        teamBRow.tied += 1;
        teamARow.points += 1;
        teamBRow.points += 1;
        teamARow.form = (['T', ...teamARow.form].slice(0, 5)) as ('W' | 'L' | 'T' | 'D')[];
        teamBRow.form = (['T', ...teamBRow.form].slice(0, 5)) as ('W' | 'L' | 'T' | 'D')[];
      }
    }
  });

  // 4. Sort strictly according to the sport tie-breaking rules
  const rows = Array.from(standingsMap.values());
  rows.sort((a, b) => {
    // 1. Primary: Points
    if (b.points !== a.points) return b.points - a.points;

    // 2. Sport-specific tiebreaker
    if (sport === 'cricket' && a.nrr !== undefined && b.nrr !== undefined) {
      return (b.nrr ?? 0) - (a.nrr ?? 0);
    }
    if (sport === 'volleyball' && a.setRatio !== undefined && b.setRatio !== undefined) {
      return (b.setRatio ?? 0) - (a.setRatio ?? 0);
    }
    if (sport === 'kabaddi' && a.scoreDiff !== undefined && b.scoreDiff !== undefined) {
      return (b.scoreDiff ?? 0) - (a.scoreDiff ?? 0);
    }

    // 3. Fallback: Wins
    return b.won - a.won;
  });

  return rows;
}
