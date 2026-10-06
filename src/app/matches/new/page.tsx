'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SportType, Match, Team, SportScoreState } from '@/types/sports';
import { SPORTS_REGISTRY, ALL_SPORTS } from '@/lib/sports-config';
import { saveSingleMatch } from '@/lib/match-store';
import { useUserProfile, useOrganizations } from '@/lib/user-org-store';
import { SportBadge } from '@/components/SportBadge';
import { ImageUploader } from '@/components/ImageUploader';
import { 
  Trophy, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Settings2, 
  Users, 
  Flame,
  Coins,
  Lock,
  Eye,
  ShieldCheck,
  Building2
} from 'lucide-react';
import Link from 'next/link';

export default function MatchSetupWizardPage() {
  const router = useRouter();
  const { profile, isLoaded } = useUserProfile();
  const { organizations } = useOrganizations();
  const isOrganizer = profile.role === 'organizer';

  // Step state
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Host Organization state
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramOrg = urlParams.get('orgId');
      if (paramOrg) {
        setSelectedOrgId(paramOrg);
      } else if (organizations.length > 0 && !selectedOrgId) {
        setSelectedOrgId(organizations[0].id);
      }
    }
  }, [organizations, selectedOrgId]);

  // Form fields
  const [sport, setSport] = useState<SportType>('cricket');
  const [tournamentName, setTournamentName] = useState('Grassroots Super League 2026');
  const [stage, setStage] = useState('League Match');
  const [venue, setVenue] = useState('Community Sports Ground');

  // Sport parameters
  const [overs, setOvers] = useState(20);
  const [bestOfSets, setBestOfSets] = useState(3);
  const [pointsToWinSet, setPointsToWinSet] = useState(25);
  const [halfDuration, setHalfDuration] = useState(20);

  // Teams
  const [teamAName, setTeamAName] = useState('Royal Warriors');
  const [teamAShort, setTeamAShort] = useState('WAR');
  const [teamAColor, setTeamAColor] = useState('#10b981');
  const [teamALogo, setTeamALogo] = useState<string>('');
  const [teamAPlayersRaw, setTeamAPlayersRaw] = useState('Player 1, Player 2, Player 3, Player 4, Player 5, Player 6');

  const [teamBName, setTeamBName] = useState('Thunder Strikers');
  const [teamBShort, setTeamBShort] = useState('STR');
  const [teamBColor, setTeamBColor] = useState('#3b82f6');
  const [teamBLogo, setTeamBLogo] = useState<string>('');
  const [teamBPlayersRaw, setTeamBPlayersRaw] = useState('Opponent 1, Opponent 2, Opponent 3, Opponent 4, Opponent 5, Opponent 6');

  // Toss
  const [tossWinner, setTossWinner] = useState<'teamA' | 'teamB'>('teamA');
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl' | 'serve' | 'raid'>('bat');

  const selectedSportConfig = SPORTS_REGISTRY[sport];

  const handleCreateMatch = () => {
    const matchId = `${sport}-match-${Date.now()}`;
    const teamAId = `team-a-${Date.now()}`;
    const teamBId = `team-b-${Date.now()}`;

    const parsePlayers = (raw: string, teamPrefix: string) => {
      return raw.split(',').map((name, i) => ({
        id: `${teamPrefix}-p-${i + 1}`,
        name: name.trim() || `Player ${i + 1}`,
        jerseyNumber: i + 1,
        role: i === 0 ? 'Captain' : 'Player'
      }));
    };

    const teamAPlayers = parsePlayers(teamAPlayersRaw, 'ta');
    const teamBPlayers = parsePlayers(teamBPlayersRaw, 'tb');

    const teamA: Team = {
      id: teamAId,
      name: teamAName.trim() || 'Team A',
      shortName: teamAShort.trim() || 'TMA',
      logo: teamALogo || undefined,
      color: teamAColor,
      players: teamAPlayers
    };

    const teamB: Team = {
      id: teamBId,
      name: teamBName.trim() || 'Team B',
      shortName: teamBShort.trim() || 'TMB',
      logo: teamBLogo || undefined,
      color: teamBColor,
      players: teamBPlayers
    };

    // Build sport-specific score state
    let initialScoreState: SportScoreState;

    if (sport === 'cricket') {
      const isTeamABatting = (tossWinner === 'teamA' && tossDecision === 'bat') || (tossWinner === 'teamB' && tossDecision === 'bowl');
      const battingTeamId = isTeamABatting ? teamAId : teamBId;
      const bowlingTeamId = isTeamABatting ? teamBId : teamAId;
      const batRoster = isTeamABatting ? teamAPlayers : teamBPlayers;
      const bowlRoster = isTeamABatting ? teamBPlayers : teamAPlayers;

      initialScoreState = {
        sport: 'cricket',
        innings: 1,
        battingTeamId,
        bowlingTeamId,
        totalRuns: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        maxOvers: overs,
        extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
        currentStrikerId: batRoster[0]?.id || 'p-1',
        currentNonStrikerId: batRoster[1]?.id || 'p-2',
        currentBowlerId: bowlRoster[0]?.id || 'p-bowl-1',
        batsmen: {
          [batRoster[0]?.id || 'p-1']: {
            playerId: batRoster[0]?.id || 'p-1',
            name: batRoster[0]?.name || 'Batter 1',
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            isOut: false
          },
          [batRoster[1]?.id || 'p-2']: {
            playerId: batRoster[1]?.id || 'p-2',
            name: batRoster[1]?.name || 'Batter 2',
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            isOut: false
          }
        },
        bowlers: {
          [bowlRoster[0]?.id || 'p-bowl-1']: {
            playerId: bowlRoster[0]?.id || 'p-bowl-1',
            name: bowlRoster[0]?.name || 'Opening Bowler',
            overs: 0,
            maidens: 0,
            runsConceded: 0,
            wickets: 0,
            wides: 0,
            noBalls: 0
          }
        },
        recentBalls: []
      };
    } else if (sport === 'volleyball' || sport === 'badminton' || sport === 'throwball' || sport === 'table-tennis') {
      initialScoreState = {
        sport,
        bestOfSets,
        pointsToWinSet: sport === 'badminton' ? 21 : sport === 'table-tennis' ? 11 : pointsToWinSet,
        mustWinByTwo: true,
        currentSetIndex: 0,
        teamASetsWon: 0,
        teamBSetsWon: 0,
        currentSetTeamAPoints: 0,
        currentSetTeamBPoints: 0,
        servingTeamId: tossWinner === 'teamA' ? teamAId : teamBId,
        setHistory: [],
        teamATimeouts: 0,
        teamBTimeouts: 0
      };
    } else if (sport === 'kabaddi') {
      initialScoreState = {
        sport: 'kabaddi',
        half: 1,
        halfDurationMinutes: halfDuration,
        timeRemainingSeconds: halfDuration * 60,
        teamAScore: 0,
        teamBScore: 0,
        teamAStats: { raidPoints: 0, tacklePoints: 0, bonusPoints: 0, allOutPoints: 0, activePlayersOnMat: 7 },
        teamBStats: { raidPoints: 0, tacklePoints: 0, bonusPoints: 0, allOutPoints: 0, activePlayersOnMat: 7 },
        activeRaidingTeamId: tossWinner === 'teamA' ? teamAId : teamBId,
        raidTimerSeconds: 30,
        isDoOrDieRaid: false
      };
    } else {
      // Athletics default
      initialScoreState = {
        sport: 'athletics',
        eventType: '100m',
        unit: 'seconds',
        heats: [{
          heatNumber: 1,
          laneAssignments: teamAPlayers.map((p, i) => ({
            lane: i + 1,
            athleteName: p.name,
            teamName: teamAName,
            bibNumber: 100 + i,
            status: 'pending'
          }))
        }]
      };
    }

    const newMatch: Match = {
      id: matchId,
      organizationId: selectedOrgId || undefined,
      tournamentId: `t-${Date.now()}`,
      tournamentName,
      sport,
      title: `${teamAName} vs ${teamBName}`,
      stage,
      venue,
      scheduledAt: new Date().toISOString(),
      status: 'live',
      teamA,
      teamB,
      toss: {
        winnerTeamId: tossWinner === 'teamA' ? teamAId : teamBId,
        decision: tossDecision
      },
      scoreState: initialScoreState,
      events: [
        {
          id: `ev-init-${Date.now()}`,
          timestamp: Date.now(),
          matchId,
          type: 'MATCH_INITIALIZED',
          description: `Match created: ${teamAName} vs ${teamBName} (${selectedSportConfig.name}). Toss won by ${tossWinner === 'teamA' ? teamAName : teamBName} who chose to ${tossDecision}.`,
          scoreSnapshot: initialScoreState
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveSingleMatch(newMatch);
    router.push(`/matches/${matchId}/score`);
  };

  // Security & Perspective Enforcement: Viewers cannot create matches
  if (isLoaded && !isOrganizer) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-amber-500/30 bg-slate-900/90 text-white space-y-6 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Viewer Mode Active
            </span>
            <h2 className="text-xl font-bold text-white pt-2">Match Creation Restricted</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              In Viewer Mode, you can discover organizations and explore live scores across all sports. Setting up tournaments and creating live matches is restricted to Organizers.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/25"
            >
              <Eye className="w-4 h-4" />
              <span>Explore Matches</span>
            </Link>
            <Link
              href="/profile"
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Shift Mode in Profile</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Wizard Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 -z-0" />
          {[
            { num: 1, label: 'Select Sport' },
            { num: 2, label: 'Match Rules' },
            { num: 3, label: 'Teams & Rosters' },
            { num: 4, label: 'Toss & Launch' }
          ].map((s) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : isCurrent
                      ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 ring-4 ring-emerald-500/20'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                </div>
                <span className={`text-[11px] font-bold mt-1.5 hidden sm:block ${
                  isCurrent ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: SPORT SELECTION */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center max-w-lg mx-auto space-y-1">
            <h1 className="text-2xl font-black text-white">Choose Your Sport</h1>
            <p className="text-xs text-slate-400">
              Select any of the 8 supported tournament scoring engines.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ALL_SPORTS.map((sp) => {
              const isSelected = sport === sp.id;
              return (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => {
                    setSport(sp.id);
                    // auto-adjust toss decision for the sport
                    if (sp.id === 'cricket') setTossDecision('bat');
                    else if (sp.id === 'volleyball' || sp.id === 'badminton' || sp.id === 'throwball') setTossDecision('serve');
                    else if (sp.id === 'kabaddi') setTossDecision('raid');
                  }}
                  className={`p-3 sm:p-4 rounded-2xl border text-left flex flex-col justify-between transition-all tactile-btn cursor-pointer ${
                    isSelected
                      ? 'glass-panel border-cyan-400 bg-cyan-950/50 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/50'
                      : 'glass-panel border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <SportBadge sport={sp.id} size="sm" />
                      {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white mt-1">{sp.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">{sp.tagline}</p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-slate-500 font-mono">
                    Format: {sp.category}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="w-full sm:w-auto min-h-[46px] flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl liquid-btn-primary text-white font-black text-sm tactile-btn cursor-pointer"
            >
              <span>Next: Match Rules</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: MATCH PARAMETERS */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-white">Configure {selectedSportConfig.name} Rules</h2>
            <p className="text-xs text-slate-400">Match duration, overs, sets and venue configuration.</p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass border border-white/10 space-y-4 shadow-2xl">
            {/* Tournament & Venue */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Tournament / League Name</label>
                <input
                  type="text"
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  className="glass-input w-full px-3.5 py-3 rounded-xl text-white text-base sm:text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Venue / Ground</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="glass-input w-full px-3.5 py-3 rounded-xl text-white text-base sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Match Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="glass-input w-full px-3.5 py-3 rounded-xl text-white text-base sm:text-sm bg-[#0a1124]"
              >
                <option value="League Match">League Match</option>
                <option value="Quarter-Final">Quarter-Final</option>
                <option value="Semi-Final">Semi-Final</option>
                <option value="Grand Final">Grand Final</option>
              </select>
            </div>

            {/* Host Organization Association */}
            <div className="pt-1">
              <label className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Host Organization / Club</span>
              </label>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="glass-input w-full px-3.5 py-3 rounded-xl text-white text-base sm:text-sm bg-[#0a1124]"
              >
                <option value="">No Organization (Independent Exhibition)</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.city})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Associating this match with an organization places both teams directly on that organization&apos;s points table leaderboard.
              </p>
            </div>

            {/* Sport Specific Configuration Inputs */}
            {sport === 'cricket' && (
              <div className="pt-3 border-t border-white/10">
                <label className="text-xs font-bold text-slate-300 block mb-2">Overs Per Innings</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[10, 15, 20, 50].map((ov) => (
                    <button
                      key={ov}
                      type="button"
                      onClick={() => setOvers(ov)}
                      className={`min-h-[46px] py-2.5 rounded-xl text-xs font-bold border transition-all tactile-btn cursor-pointer ${
                        overs === ov
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md shadow-emerald-500/20'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {ov} Overs
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(sport === 'volleyball' || sport === 'badminton' || sport === 'throwball') && (
              <div className="pt-3 border-t border-white/10 space-y-3">
                <label className="text-xs font-bold text-slate-300 block">Sets Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {[3, 5].map((sCount) => (
                    <button
                      key={sCount}
                      type="button"
                      onClick={() => setBestOfSets(sCount)}
                      className={`min-h-[46px] py-2.5 rounded-xl text-xs font-bold border transition-all tactile-btn cursor-pointer ${
                        bestOfSets === sCount
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-md shadow-cyan-500/20'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      Best of {sCount} Sets
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sport === 'kabaddi' && (
              <div className="pt-3 border-t border-white/10">
                <label className="text-xs font-bold text-slate-300 block mb-2">Half Duration (Minutes)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 15, 20].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setHalfDuration(mins)}
                      className={`min-h-[46px] py-2.5 rounded-xl text-xs font-bold border transition-all tactile-btn cursor-pointer ${
                        halfDuration === mins
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {mins} Mins / Half
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold border border-white/10 tactile-btn cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="min-h-[48px] px-6 py-2.5 rounded-xl liquid-btn-primary text-white font-black text-sm tactile-btn cursor-pointer flex items-center gap-2"
            >
              <span>Next: Teams</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TEAMS & ROSTERS */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-white">Teams & Squad Rosters</h2>
            <p className="text-xs text-slate-400">Configure team names, jersey colors and starting player names.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Team A */}
            <div className="p-5 rounded-2xl sm:rounded-3xl liquid-glass border border-emerald-500/30 space-y-3 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Users className="w-4 h-4" /> Team A (Home)
              </h3>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Team Name</label>
                <input
                  type="text"
                  value={teamAName}
                  onChange={(e) => setTeamAName(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-white text-base sm:text-sm font-medium focus:border-emerald-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Short Code</label>
                  <input
                    type="text"
                    value={teamAShort}
                    maxLength={4}
                    onChange={(e) => setTeamAShort(e.target.value.toUpperCase())}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-white text-base sm:text-sm font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Color</label>
                  <input
                    type="color"
                    value={teamAColor}
                    onChange={(e) => setTeamAColor(e.target.value)}
                    className="w-full h-11 rounded-xl bg-white/5 border border-white/10 cursor-pointer p-1"
                  />
                </div>
              </div>
              <ImageUploader
                label="Team A Logo (Cloudinary)"
                currentUrl={teamALogo}
                folder="team-logos"
                onUploadSuccess={(url) => setTeamALogo(url)}
              />
              <div>
                <label className="text-xs text-slate-300 block mb-1">Squad Players (Comma-separated)</label>
                <textarea
                  rows={3}
                  value={teamAPlayersRaw}
                  onChange={(e) => setTeamAPlayersRaw(e.target.value)}
                  className="glass-input w-full p-3 rounded-xl text-white text-base sm:text-xs font-mono focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Team B */}
            <div className="p-5 rounded-2xl sm:rounded-3xl liquid-glass border border-blue-500/30 space-y-3 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <Users className="w-4 h-4" /> Team B (Away)
              </h3>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Team Name</label>
                <input
                  type="text"
                  value={teamBName}
                  onChange={(e) => setTeamBName(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-white text-base sm:text-sm font-medium focus:border-blue-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Short Code</label>
                  <input
                    type="text"
                    value={teamBShort}
                    maxLength={4}
                    onChange={(e) => setTeamBShort(e.target.value.toUpperCase())}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-white text-base sm:text-sm font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Color</label>
                  <input
                    type="color"
                    value={teamBColor}
                    onChange={(e) => setTeamBColor(e.target.value)}
                    className="w-full h-11 rounded-xl bg-white/5 border border-white/10 cursor-pointer p-1"
                  />
                </div>
              </div>
              <ImageUploader
                label="Team B Logo (Cloudinary)"
                currentUrl={teamBLogo}
                folder="team-logos"
                onUploadSuccess={(url) => setTeamBLogo(url)}
              />
              <div>
                <label className="text-xs text-slate-300 block mb-1">Squad Players (Comma-separated)</label>
                <textarea
                  rows={3}
                  value={teamBPlayersRaw}
                  onChange={(e) => setTeamBPlayersRaw(e.target.value)}
                  className="glass-input w-full p-3 rounded-xl text-white text-base sm:text-xs font-mono focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold border border-white/10 tactile-btn cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="min-h-[48px] px-6 py-2.5 rounded-xl liquid-btn-primary text-white font-black text-sm tactile-btn cursor-pointer flex items-center gap-2"
            >
              <span>Next: Toss & Launch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: TOSS & CONFIRM LAUNCH */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-white">Match Toss & Launch</h2>
            <p className="text-xs text-slate-400">Record pre-match coin toss and start live scoring console.</p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass border border-white/10 space-y-5 shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Coins className="w-4 h-4" />
              <span>Toss Information</span>
            </div>

            {/* Who won the toss? */}
            <div>
              <label className="text-xs text-slate-300 font-bold block mb-2">Who won the toss?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTossWinner('teamA')}
                  className={`min-h-[48px] p-3 rounded-xl border text-sm font-bold transition-all tactile-btn cursor-pointer ${
                    tossWinner === 'teamA'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {teamAName} ({teamAShort})
                </button>
                <button
                  type="button"
                  onClick={() => setTossWinner('teamB')}
                  className={`min-h-[48px] p-3 rounded-xl border text-sm font-bold transition-all tactile-btn cursor-pointer ${
                    tossWinner === 'teamB'
                      ? 'bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/20'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {teamBName} ({teamBShort})
                </button>
              </div>
            </div>

            {/* Decision */}
            <div>
              <label className="text-xs text-slate-300 font-bold block mb-2">Elected to:</label>
              <div className="grid grid-cols-2 gap-3">
                {sport === 'cricket' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setTossDecision('bat')}
                      className={`min-h-[48px] p-3 rounded-xl border text-sm font-bold transition-all tactile-btn cursor-pointer ${
                        tossDecision === 'bat'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      Bat First
                    </button>
                    <button
                      type="button"
                      onClick={() => setTossDecision('bowl')}
                      className={`min-h-[48px] p-3 rounded-xl border text-sm font-bold transition-all tactile-btn cursor-pointer ${
                        tossDecision === 'bowl'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      Bowl First
                    </button>
                  </>
                )}

                {(sport === 'volleyball' || sport === 'badminton' || sport === 'throwball') && (
                  <>
                    <button
                      type="button"
                      onClick={() => setTossDecision('serve')}
                      className={`min-h-[48px] p-3 rounded-xl border text-sm font-bold transition-all tactile-btn cursor-pointer ${
                        tossDecision === 'serve'
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      Serve First
                    </button>
                    <button
                      type="button"
                      onClick={() => setTossDecision('raid')}
                      className={`min-h-[48px] p-3 rounded-xl border text-sm font-bold transition-all tactile-btn cursor-pointer ${
                        tossDecision === 'raid'
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      Court Side
                    </button>
                  </>
                )}

                {sport === 'kabaddi' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setTossDecision('raid')}
                      className={`min-h-[48px] p-3 rounded-xl border text-sm font-bold transition-all tactile-btn cursor-pointer ${
                        tossDecision === 'raid'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      Raid First
                    </button>
                    <button
                      type="button"
                      onClick={() => setTossDecision('serve')}
                      className={`min-h-[48px] p-3 rounded-xl border text-sm font-bold transition-all tactile-btn cursor-pointer ${
                        tossDecision === 'serve'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      Court Choice
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Launch Summary Preview */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ready to Launch Live Console</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Match between <strong className="text-white">{teamAName}</strong> and <strong className="text-white">{teamBName}</strong> ({selectedSportConfig.name}) will be initialized with real-time multi-device sync.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="w-full sm:w-auto min-h-[48px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold border border-white/10 tactile-btn cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleCreateMatch}
              className="w-full sm:w-auto min-h-[52px] flex items-center justify-center gap-2 px-8 py-3 rounded-2xl liquid-btn-primary text-white font-black text-sm shadow-xl shadow-cyan-500/25 tactile-btn cursor-pointer"
            >
              <Flame className="w-5 h-5 stroke-[2.5]" />
              <span>START LIVE SCORING NOW</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
