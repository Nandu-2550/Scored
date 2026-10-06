'use client';

import React, { useState } from 'react';
import { Match, CricketScoreState } from '@/types/sports';
import { CricketAction } from '@/lib/scoring-engine';
import { 
  ArrowLeftRight, 
  UserCheck, 
  AlertCircle, 
  Flame, 
  ShieldAlert, 
  TrendingUp, 
  Plus, 
  X 
} from 'lucide-react';

interface CricketScorerProps {
  match: Match;
  onAction: (action: CricketAction) => void;
}

export const CricketScorer: React.FC<CricketScorerProps> = ({ match, onAction }) => {
  const score = match.scoreState as CricketScoreState;
  const [wicketModalOpen, setWicketModalOpen] = useState(false);
  const [bowlerModalOpen, setBowlerModalOpen] = useState(false);
  const [dismissalType, setDismissalType] = useState<'bowled' | 'caught' | 'lbw' | 'runOut' | 'stumped'>('caught');
  const [newBatsmanName, setNewBatsmanName] = useState('');

  const battingTeam = match.teamA.id === score.battingTeamId ? match.teamA : match.teamB;
  const bowlingTeam = match.teamA.id === score.bowlingTeamId ? match.teamA : match.teamB;

  const striker = score.batsmen[score.currentStrikerId] || {
    playerId: 'p-default-1',
    name: 'Striker',
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut: false
  };

  const nonStriker = score.batsmen[score.currentNonStrikerId] || {
    playerId: 'p-default-2',
    name: 'Non-Striker',
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut: false
  };

  const bowler = score.bowlers[score.currentBowlerId] || {
    playerId: 'p-bowler-1',
    name: 'Current Bowler',
    overs: 0,
    maidens: 0,
    runsConceded: 0,
    wickets: 0,
    wides: 0,
    noBalls: 0
  };

  // Calculations
  const totalBallsBowled = (score.overs * 6) + score.balls;
  const currentRunRate = totalBallsBowled > 0 ? ((score.totalRuns / totalBallsBowled) * 6).toFixed(2) : '0.00';
  const projectedTotal = totalBallsBowled > 0 ? Math.round((score.totalRuns / totalBallsBowled) * score.maxOvers * 6) : score.totalRuns;

  const handleWicketSubmit = () => {
    const nextId = `p-b-${Date.now()}`;
    const nameToUse = newBatsmanName.trim() || `Batter #${score.wickets + 2}`;
    onAction({
      type: 'WICKET',
      dismissalType,
      nextBatsmanId: nextId,
      nextBatsmanName: nameToUse
    });
    setNewBatsmanName('');
    setWicketModalOpen(false);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12">
      {/* 1. TOP LIVE SCOREBOARD HUD */}
      <div className="rounded-2xl bg-gradient-to-b from-[#131b2e] to-[#0c1220] border border-slate-800 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
                1st Innings • Batting
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-mono">Max {score.maxOvers} Overs</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {battingTeam.name}
            </h2>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
              {score.totalRuns}
              <span className="text-emerald-400">/{score.wickets}</span>
            </span>
            <div className="flex flex-col text-right">
              <span className="text-lg sm:text-xl font-bold font-mono text-slate-300">
                ({score.overs}.{score.balls} ov)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                CRR: <strong className="text-emerald-400">{currentRunRate}</strong> | Proj: {projectedTotal}
              </span>
            </div>
          </div>
        </div>

        {/* Batsmen and Bowler Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {/* Batting Pair */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider px-2">
              <span>Batters</span>
              <button
                onClick={() => onAction({ type: 'SWITCH_STRIKE' })}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 active:scale-95 transition-all"
                title="Swap Striker and Non-Striker"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span>Rotate Strike</span>
              </button>
            </div>

            {/* Striker */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <span className="text-sm font-bold text-white flex items-center gap-1">
                    {striker.name} <span className="text-emerald-400 font-bold">*</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {striker.fours}x4, {striker.sixes}x6 • SR: {striker.balls > 0 ? ((striker.runs / striker.balls) * 100).toFixed(1) : '0.0'}
                  </span>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-base font-black text-emerald-400">{striker.runs}</span>
                <span className="text-xs text-slate-400"> ({striker.balls})</span>
              </div>
            </div>

            {/* Non-Striker */}
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-300">{nonStriker.name}</span>
                <div className="text-[11px] text-slate-500 font-mono">
                  {nonStriker.fours}x4, {nonStriker.sixes}x6
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-base font-bold text-slate-300">{nonStriker.runs}</span>
                <span className="text-xs text-slate-500"> ({nonStriker.balls})</span>
              </div>
            </div>
          </div>

          {/* Current Bowler & Recent Over Deliveries */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider px-2">
              <span>Bowling ({bowlingTeam.shortName})</span>
              <button
                onClick={() => setBowlerModalOpen(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 active:scale-95 transition-all"
              >
                Change Bowler
              </button>
            </div>

            {/* Bowler Details */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white">{bowler.name}</span>
                <div className="text-[11px] text-slate-400 font-mono">
                  Econ: {bowler.overs > 0 ? (bowler.runsConceded / bowler.overs).toFixed(1) : (bowler.runsConceded * 6).toFixed(1)} • {bowler.maidens} M
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-base font-black text-cyan-400">{bowler.wickets}-{bowler.runsConceded}</span>
                <span className="text-xs text-slate-400"> ({bowler.overs}.{score.balls})</span>
              </div>
            </div>

            {/* This Over Deliveries */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5 tracking-wider">
                This Over Deliveries:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap min-h-8">
                {score.recentBalls && score.recentBalls.length > 0 ? (
                  score.recentBalls.slice(-6).map((ball, idx) => {
                    let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
                    if (ball.isWicket) badgeColor = 'bg-red-500 text-white border-red-400 font-black animate-bounce';
                    else if (ball.runs === 4) badgeColor = 'bg-blue-600 text-white border-blue-400 font-bold';
                    else if (ball.runs === 6) badgeColor = 'bg-purple-600 text-white border-purple-400 font-bold';
                    else if (ball.isExtra) badgeColor = 'bg-amber-600 text-white border-amber-400';
                    else if (ball.runs === 0) badgeColor = 'bg-slate-900 text-slate-500 border-slate-800';

                    return (
                      <span
                        key={idx}
                        className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-mono font-bold shadow-sm ${badgeColor}`}
                      >
                        {ball.text}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-600 italic">Over starting...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN TACTILE RUNS ACTION GRID */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#0e1628] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Field Scorer Input Panel (Touch-Ready)
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Ball-by-ball Realtime Log</span>
        </div>

        {/* Primary Run Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {[
            { label: '0', sub: 'DOT', runs: 0, bg: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' },
            { label: '1', sub: 'SINGLE', runs: 1, bg: 'bg-slate-800/90 hover:bg-slate-700 text-slate-100 border-slate-700' },
            { label: '2', sub: 'DOUBLE', runs: 2, bg: 'bg-slate-800/90 hover:bg-slate-700 text-slate-100 border-slate-700' },
            { label: '3', sub: 'TRIPLE', runs: 3, bg: 'bg-slate-800/90 hover:bg-slate-700 text-slate-100 border-slate-700' },
            { label: '4', sub: 'FOUR', runs: 4, bg: 'bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20' },
            { label: '6', sub: 'SIX', runs: 6, bg: 'bg-gradient-to-b from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20' },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => onAction({ type: 'BALL_RUNS', runs: btn.runs })}
              className={`tactile-btn flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${btn.bg}`}
            >
              <span className="text-2xl sm:text-3xl font-black font-mono leading-none">{btn.label}</span>
              <span className="text-[10px] font-bold tracking-wider mt-1 opacity-80">{btn.sub}</span>
            </button>
          ))}
        </div>

        {/* Extras & Wicket Action Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 pt-2">
          {/* Wide */}
          <button
            onClick={() => onAction({ type: 'BALL_EXTRA', extraType: 'wide', runsAdded: 1 })}
            className="tactile-btn p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm flex flex-col items-center justify-center text-center"
          >
            <span className="font-mono text-base font-black">WIDE</span>
            <span className="text-[10px] text-amber-400/80 font-mono">+1 Run</span>
          </button>

          {/* No Ball */}
          <button
            onClick={() => onAction({ type: 'BALL_EXTRA', extraType: 'noBall', runsAdded: 1 })}
            className="tactile-btn p-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold text-sm flex flex-col items-center justify-center text-center"
          >
            <span className="font-mono text-base font-black">NO BALL</span>
            <span className="text-[10px] text-orange-400/80 font-mono">+1 Run & Free Hit</span>
          </button>

          {/* Bye */}
          <button
            onClick={() => onAction({ type: 'BALL_EXTRA', extraType: 'bye', runsAdded: 1 })}
            className="tactile-btn p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-sm flex flex-col items-center justify-center text-center"
          >
            <span className="font-mono text-base font-black">BYE (1B)</span>
            <span className="text-[10px] text-slate-400 font-mono">Counts ball</span>
          </button>

          {/* Leg Bye */}
          <button
            onClick={() => onAction({ type: 'BALL_EXTRA', extraType: 'legBye', runsAdded: 1 })}
            className="tactile-btn p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-sm flex flex-col items-center justify-center text-center"
          >
            <span className="font-mono text-base font-black">LEG BYE (1Lb)</span>
            <span className="text-[10px] text-slate-400 font-mono">Counts ball</span>
          </button>

          {/* WICKET TRIGGER BUTTON */}
          <button
            onClick={() => setWicketModalOpen(true)}
            className="tactile-btn col-span-2 sm:col-span-1 p-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm flex flex-col items-center justify-center text-center shadow-lg shadow-red-600/30 border border-red-400"
          >
            <span className="font-mono text-base font-black tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-4 h-4" /> WICKET
            </span>
            <span className="text-[10px] opacity-90 font-sans uppercase">Out Event</span>
          </button>
        </div>
      </div>

      {/* WICKET MODAL */}
      {wicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-red-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-lg text-white">Record Dismissal</h3>
              </div>
              <button
                onClick={() => setWicketModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Dismissing batsman: <strong className="text-white">{striker.name}</strong> ({striker.runs} off {striker.balls} balls)
            </p>

            {/* Dismissal Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">How was the batsman dismissed?</label>
              <div className="grid grid-cols-3 gap-2">
                {(['caught', 'bowled', 'lbw', 'runOut', 'stumped'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDismissalType(type)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold uppercase border transition-all ${
                      dismissalType === type
                        ? 'bg-red-500 text-white border-red-400 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Incoming Batsman */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Next Batsman Name</label>
              <input
                type="text"
                placeholder="e.g. Dinesh Karthik"
                value={newBatsmanName}
                onChange={(e) => setNewBatsmanName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500 font-medium"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setWicketModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleWicketSubmit}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30"
              >
                Confirm Wicket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE BOWLER MODAL */}
      {bowlerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-cyan-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Select Next Bowler</h3>
              <button
                onClick={() => setBowlerModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {bowlingTeam.players.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onAction({ type: 'CHANGE_BOWLER', bowlerId: p.id, bowlerName: p.name });
                    setBowlerModalOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    score.currentBowlerId === p.id
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-white'
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold block">{p.name}</span>
                    <span className="text-xs text-slate-400">{p.role || 'Bowler'} #{p.jerseyNumber || ''}</span>
                  </div>
                  {score.bowlers[p.id] && (
                    <span className="text-xs font-mono text-slate-400">
                      {score.bowlers[p.id].wickets} wkts / {score.bowlers[p.id].overs} ov
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
