'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMatch } from '@/lib/match-store';
import { SportBadge } from '@/components/SportBadge';
import { LiveStatusBadge } from '@/components/LiveStatusBadge';
import { CommentaryFeed } from '@/components/spectator/CommentaryFeed';
import { CricketScorecard } from '@/components/spectator/CricketScorecard';
import { VolleyballScorecard } from '@/components/spectator/VolleyballScorecard';
import { KabaddiScorecard } from '@/components/spectator/KabaddiScorecard';
import { CricketScoreState, SetRallyScoreState, KabaddiScoreState } from '@/types/sports';
import { copyToClipboard } from '@/lib/clipboard';
import { 
  Radio, 
  ArrowLeft, 
  Share2, 
  PenTool, 
  MapPin, 
  Info, 
  ListOrdered, 
  Check
} from 'lucide-react';

export default function SpectatorMatchCenterPage() {
  const params = useParams();
  const matchId = params?.id as string;
  const { match } = useMatch(matchId);

  const [activeTab, setActiveTab] = useState<'commentary' | 'scorecard' | 'info'>('commentary');
  const [copied, setCopied] = useState(false);

  if (!match) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Radio className="w-12 h-12 text-slate-300 animate-pulse" />
        <h2 className="text-xl font-bold text-slate-800">Match Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          The requested live match could not be found or may have concluded.
        </p>
        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs"
        >
          Return to Discovery Hub
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    copyToClipboard(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* 1. TOP BROADCAST SCOREBOARD HEADER */}
      <section className="bg-white border-b border-slate-200 pt-6 pb-8 px-4 sm:px-6 shadow-xs">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Discovery Hub</span>
            </Link>

            <div className="flex items-center gap-2">
              <SportBadge sport={match.sport} size="sm" />
              <LiveStatusBadge status={match.status} />
              <button
                onClick={handleShare}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200 shadow-2xs"
                title="Share Match Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
              {copied && <span className="text-[10px] text-emerald-700 font-mono font-bold">Link Copied!</span>}
            </div>
          </div>

          {/* Tournament & Venue info */}
          <div className="text-center space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">
              {match.tournamentName} • {match.stage}
            </span>
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{match.venue}</span>
            </div>
          </div>

          {/* Center Jumbotron Scoreboard */}
          <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
            {/* Realtime stream pulse watermark */}
            <div className="absolute top-3 right-4 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              REALTIME BROADCAST
            </div>

            {/* CRICKET JUMBOTRON */}
            {match.sport === 'cricket' && (() => {
              const s = match.scoreState as CricketScoreState;
              const totalBalls = (s.overs * 6) + s.balls;
              const crr = totalBalls > 0 ? ((s.totalRuns / totalBalls) * 6).toFixed(2) : '0.00';

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    {/* Team A (Batting) */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: match.teamA.color }} />
                        <h2 className="text-xl sm:text-2xl font-black text-white">{match.teamA.name}</h2>
                        <span className="text-xs text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          BATTING
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 font-mono">
                        <span className="text-4xl sm:text-6xl font-black tracking-tight text-emerald-400">
                          {s.totalRuns}/{s.wickets}
                        </span>
                        <span className="text-sm sm:text-base text-slate-400">
                          ({s.overs}.{s.balls} / {s.maxOvers} ov)
                        </span>
                      </div>
                    </div>

                    {/* Team B */}
                    <div className="space-y-1 sm:text-right">
                      <div className="flex items-center sm:justify-end gap-2">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: match.teamB.color }} />
                        <h2 className="text-lg sm:text-xl font-bold text-slate-300">{match.teamB.name}</h2>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {s.target ? `Target: ${s.target} runs` : 'Yet to bat in Innings 2'}
                      </div>
                    </div>
                  </div>

                  {/* Cricket Match Micro-Ticker */}
                  <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span>Striker: <strong className="text-white">{s.batsmen[s.currentStrikerId]?.name || 'Striker'}</strong></span>
                      <span className="text-slate-600">•</span>
                      <span>Bowler: <strong className="text-white">{s.bowlers[s.currentBowlerId]?.name || 'Bowler'}</strong></span>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span>CRR: <strong className="text-emerald-400">{crr}</strong></span>
                      {s.target && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span>REQ: <strong className="text-amber-400">{((s.target - s.totalRuns) / Math.max(0.1, (s.maxOvers * 6 - totalBalls) / 6)).toFixed(2)}</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* VOLLEYBALL JUMBOTRON */}
            {match.sport === 'volleyball' && (() => {
              const s = match.scoreState as SetRallyScoreState;

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: match.teamA.color }} />
                        <h2 className="text-lg sm:text-xl font-bold text-white">{match.teamA.name}</h2>
                        {s.servingTeamId === match.teamA.id && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">SERVE</span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl sm:text-6xl font-black text-amber-400 font-mono">
                          {s.currentSetTeamAPoints}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-400">
                          ({s.teamASetsWon} Sets Won)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.servingTeamId === match.teamB.id && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">SERVE</span>
                        )}
                        <h2 className="text-lg sm:text-xl font-bold text-white">{match.teamB.name}</h2>
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: match.teamB.color }} />
                      </div>
                      <div className="flex items-baseline justify-end gap-3">
                        <span className="text-xs sm:text-sm text-slate-400">
                          ({s.teamBSetsWon} Sets Won)
                        </span>
                        <span className="text-4xl sm:text-6xl font-black text-cyan-400 font-mono">
                          {s.currentSetTeamBPoints}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Current: Set {s.currentSetIndex + 1} of {s.bestOfSets}</span>
                    <span className="text-cyan-400 font-bold">First to {s.pointsToWinSet} (Lead by 2)</span>
                  </div>
                </div>
              );
            })()}

            {/* KABADDI JUMBOTRON */}
            {match.sport === 'kabaddi' && (() => {
              const s = match.scoreState as KabaddiScoreState;

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: match.teamA.color }} />
                        <h2 className="text-lg sm:text-xl font-bold text-white">{match.teamA.name}</h2>
                        {s.activeRaidingTeamId === match.teamA.id && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold animate-pulse">RAID</span>
                        )}
                      </div>
                      <div className="text-4xl sm:text-6xl font-black text-amber-400 font-mono">
                        {s.teamAScore}
                      </div>
                      <div className="text-xs text-slate-400">
                        {s.teamAStats.activePlayersOnMat} Players on Mat
                      </div>
                    </div>

                    <div className="space-y-1 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.activeRaidingTeamId === match.teamB.id && (
                          <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[10px] font-mono font-bold animate-pulse">RAID</span>
                        )}
                        <h2 className="text-lg sm:text-xl font-bold text-white">{match.teamB.name}</h2>
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: match.teamB.color }} />
                      </div>
                      <div className="text-4xl sm:text-6xl font-black text-orange-400 font-mono">
                        {s.teamBScore}
                      </div>
                      <div className="text-xs text-slate-400">
                        {s.teamBStats.activePlayersOnMat} Players on Mat
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Half {s.half} of 2</span>
                    <span className="text-amber-400 font-bold">Raid Clock: 30s</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Quick link to Scorer Console */}
          <div className="flex items-center justify-end">
            <Link
              href={`/matches/${match.id}/score`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors shadow-2xs"
            >
              <PenTool className="w-4 h-4 text-blue-600" />
              <span>Switch to Scorer Console</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SPECTATOR PERSPECTIVE TABS */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('commentary')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase transition-all ${
              activeTab === 'commentary'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Live Play-by-Play</span>
          </button>

          <button
            onClick={() => setActiveTab('scorecard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase transition-all ${
              activeTab === 'scorecard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Detailed Scorecard</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase transition-all ${
              activeTab === 'info'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Match Info</span>
          </button>
        </div>

        {/* Tab 1: Live Feed */}
        {activeTab === 'commentary' && (
          <CommentaryFeed events={match.events} sport={match.sport} />
        )}

        {/* Tab 2: Sport-Specific Scorecards */}
        {activeTab === 'scorecard' && (
          <div>
            {match.sport === 'cricket' && <CricketScorecard match={match} />}
            {match.sport === 'volleyball' && <VolleyballScorecard match={match} />}
            {match.sport === 'kabaddi' && <KabaddiScorecard match={match} />}
            {match.sport !== 'cricket' && match.sport !== 'volleyball' && match.sport !== 'kabaddi' && (
              <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                Scorecard data stream active.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Match Details */}
        {activeTab === 'info' && (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-2">Match Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-1">Tournament</span>
                <strong className="text-slate-900 text-sm font-sans">{match.tournamentName}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-1">Venue</span>
                <strong className="text-slate-900 text-sm font-sans">{match.venue}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-1">Stage</span>
                <strong className="text-slate-900 text-sm font-sans">{match.stage}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-1">Toss Details</span>
                <strong className="text-emerald-700 text-sm font-sans">
                  {match.toss ? `Toss won by ${match.toss.winnerTeamId === match.teamA.id ? match.teamA.name : match.teamB.name} (chose to ${match.toss.decision})` : 'Toss not recorded'}
                </strong>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
