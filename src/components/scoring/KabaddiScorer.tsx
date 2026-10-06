'use client';

import React, { useState, useEffect } from 'react';
import { Match, KabaddiScoreState } from '@/types/sports';
import { KabaddiAction } from '@/lib/scoring-engine';
import { 
  Zap, 
  ShieldAlert, 
  RotateCw, 
  Users, 
  Flame, 
  AlertCircle,
  Timer,
  Play,
  Pause
} from 'lucide-react';

interface KabaddiScorerProps {
  match: Match;
  onAction: (action: KabaddiAction) => void;
}

export const KabaddiScorer: React.FC<KabaddiScorerProps> = ({ match, onAction }) => {
  const score = match.scoreState as KabaddiScoreState;
  const [raidTimer, setRaidTimer] = useState(30);
  const [raidTimerActive, setRaidTimerActive] = useState(false);

  const teamA = match.teamA;
  const teamB = match.teamB;
  const isTeamARaiding = score.activeRaidingTeamId === teamA.id;

  // 30 second raid clock
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (raidTimerActive && raidTimer > 0) {
      interval = setInterval(() => {
        setRaidTimer((prev) => {
          if (prev <= 1) {
            setRaidTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [raidTimerActive, raidTimer]);

  const resetRaidClock = () => {
    setRaidTimer(30);
    setRaidTimerActive(true);
  };

  const handleRaidSuccess = (points: number, isBonus: boolean = false) => {
    onAction({
      type: 'RAID_SUCCESS',
      team: isTeamARaiding ? 'teamA' : 'teamB',
      points,
      isBonus
    });
    resetRaidClock();
  };

  const handleTackle = (isSuperTackle: boolean = false) => {
    // Tackle is done by the defending team!
    onAction({
      type: 'TACKLE_SUCCESS',
      team: isTeamARaiding ? 'teamB' : 'teamA',
      isSuperTackle
    });
    resetRaidClock();
  };

  const handleEmptyRaid = () => {
    onAction({
      type: 'EMPTY_RAID',
      team: isTeamARaiding ? 'teamA' : 'teamB'
    });
    resetRaidClock();
  };

  const defendersOnMat = isTeamARaiding 
    ? score.teamBStats.activePlayersOnMat 
    : score.teamAStats.activePlayersOnMat;
  const canSuperTackle = defendersOnMat <= 3;

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12">
      {/* 1. KABADDI SCOREBOARD HUD */}
      <div className="rounded-2xl sm:rounded-3xl liquid-glass border border-white/10 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Amber glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 font-extrabold text-xs tracking-wider uppercase shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              {score.half === 1 ? '1st Half' : '2nd Half'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Pro Arena Standard
            </span>
          </div>

          {/* 30s Raid Clock */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-amber-500/50">
            <Timer className="w-4 h-4 text-amber-400" />
            <span className={`font-mono font-black text-sm tracking-wider ${raidTimer <= 5 ? 'text-red-500 animate-ping' : 'text-amber-400'}`}>
              RAID CLOCK: {raidTimer}s
            </span>
            <button
              onClick={() => setRaidTimerActive(!raidTimerActive)}
              className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
            >
              {raidTimerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
            </button>
            <button
              onClick={resetRaidClock}
              className="text-[10px] uppercase font-bold text-amber-400 hover:underline px-1"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Teams Matchup Duel */}
        <div className="grid grid-cols-2 gap-4 text-center items-center">
          {/* Team A */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isTeamARaiding 
              ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/15 ring-1 ring-amber-500' 
              : 'bg-slate-900/50 border-slate-800'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-base sm:text-xl font-black text-white">{teamA.name}</span>
              {isTeamARaiding && (
                <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" /> RAIDER
                </span>
              )}
            </div>
            {/* Mat Active Players */}
            <div className="text-xs text-slate-400 font-mono mb-2 flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Mat: <strong className="text-white">{score.teamAStats.activePlayersOnMat}/7</strong></span>
            </div>
            <div className="text-5xl sm:text-7xl font-black font-mono tracking-tight text-amber-400">
              {score.teamAScore}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-mono">
              Raid: {score.teamAStats.raidPoints} | Tackle: {score.teamAStats.tacklePoints}
            </div>
          </div>

          {/* Team B */}
          <div className={`p-4 rounded-2xl border transition-all ${
            !isTeamARaiding 
              ? 'bg-orange-500/15 border-orange-500 shadow-lg shadow-orange-500/15 ring-1 ring-orange-500' 
              : 'bg-slate-900/50 border-slate-800'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-base sm:text-xl font-black text-white">{teamB.name}</span>
              {!isTeamARaiding && (
                <span className="px-2 py-0.5 rounded bg-orange-500 text-slate-950 font-black text-[10px] tracking-wider uppercase flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" /> RAIDER
                </span>
              )}
            </div>
            {/* Mat Active Players */}
            <div className="text-xs text-slate-400 font-mono mb-2 flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-orange-400" />
              <span>Mat: <strong className="text-white">{score.teamBStats.activePlayersOnMat}/7</strong></span>
            </div>
            <div className="text-5xl sm:text-7xl font-black font-mono tracking-tight text-orange-400">
              {score.teamBScore}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-mono">
              Raid: {score.teamBStats.raidPoints} | Tackle: {score.teamBStats.tacklePoints}
            </div>
          </div>
        </div>
      </div>

      {/* 2. RAIDER ATTACK ACTION GRID */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            Active Raid Actions: {isTeamARaiding ? teamA.name : teamB.name}
          </h3>
          <span className="text-xs text-slate-400">Touch & Bonus Points</span>
        </div>

        {/* Raid Success Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => handleRaidSuccess(1)}
            className="tactile-btn p-4 rounded-xl bg-gradient-to-b from-amber-600 to-amber-700 text-white font-black border border-amber-400 shadow-md shadow-amber-600/20 flex flex-col items-center justify-center"
          >
            <span className="text-2xl font-mono">+1</span>
            <span className="text-[10px] uppercase tracking-wider">1 Touch Point</span>
          </button>

          <button
            onClick={() => handleRaidSuccess(2)}
            className="tactile-btn p-4 rounded-xl bg-gradient-to-b from-amber-600 to-amber-700 text-white font-black border border-amber-400 shadow-md shadow-amber-600/20 flex flex-col items-center justify-center"
          >
            <span className="text-2xl font-mono">+2</span>
            <span className="text-[10px] uppercase tracking-wider">2 Touch Points</span>
          </button>

          <button
            onClick={() => handleRaidSuccess(3)}
            className="tactile-btn p-4 rounded-xl bg-gradient-to-b from-red-600 to-amber-600 text-white font-black border border-red-400 shadow-lg shadow-red-600/20 flex flex-col items-center justify-center"
          >
            <span className="text-2xl font-mono">+3</span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-200">SUPER RAID</span>
          </button>

          <button
            onClick={() => handleRaidSuccess(1, true)}
            className="tactile-btn p-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-black border border-amber-500/50 flex flex-col items-center justify-center"
          >
            <span className="text-2xl font-mono">+2</span>
            <span className="text-[10px] uppercase tracking-wider">Bonus + 1 Touch</span>
          </button>
        </div>

        {/* Empty Raid & Bonus only */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => handleRaidSuccess(0, true)}
            className="tactile-btn p-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-amber-400 text-xs font-bold"
          >
            Bonus Point Only (+1)
          </button>
          <button
            onClick={handleEmptyRaid}
            className="tactile-btn p-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold"
          >
            Empty Raid (0 Pts)
          </button>
        </div>
      </div>

      {/* 3. DEFENSE TACKLE & ALL-OUT ACTIONS */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass border border-white/10 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4" />
          Defending Team ({isTeamARaiding ? teamB.name : teamA.name}) Tackles
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleTackle(false)}
            className="tactile-btn p-4 rounded-xl bg-gradient-to-b from-cyan-600 to-cyan-700 text-white font-black border border-cyan-400 shadow-md shadow-cyan-600/20 flex flex-col items-center justify-center"
          >
            <span className="text-2xl font-mono">+1</span>
            <span className="text-xs uppercase tracking-wider">Successful Tackle</span>
          </button>

          <button
            onClick={() => handleTackle(true)}
            className={`tactile-btn p-4 rounded-xl text-white font-black border flex flex-col items-center justify-center ${
              canSuperTackle
                ? 'bg-gradient-to-b from-purple-600 to-pink-600 border-purple-400 shadow-lg shadow-purple-600/30'
                : 'bg-slate-800 border-slate-700 opacity-60'
            }`}
          >
            <span className="text-2xl font-mono">+2</span>
            <span className="text-xs uppercase tracking-wider">
              SUPER TACKLE ({canSuperTackle ? 'Active' : '≤ 3 on mat'})
            </span>
          </button>

          <button
            onClick={() => onAction({ type: 'ALL_OUT', teamAllOut: isTeamARaiding ? 'teamB' : 'teamA' })}
            className="tactile-btn p-4 rounded-xl bg-gradient-to-b from-rose-600 to-red-700 text-white font-black border border-rose-400 shadow-lg shadow-rose-600/30 flex flex-col items-center justify-center"
          >
            <span className="text-2xl font-mono">+2</span>
            <span className="text-xs uppercase tracking-wider">Inflict ALL-OUT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
