'use client';

import React, { useState } from 'react';
import { Match, SetRallyScoreState } from '@/types/sports';
import { VolleyballAction } from '@/lib/scoring-engine';
import { 
  Zap, 
  ShieldCheck, 
  RotateCw, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Flame,
  Award
} from 'lucide-react';

interface VolleyballScorerProps {
  match: Match;
  onAction: (action: VolleyballAction) => void;
}

export const VolleyballScorer: React.FC<VolleyballScorerProps> = ({ match, onAction }) => {
  const score = match.scoreState as SetRallyScoreState;
  const [selectedModifier, setSelectedModifier] = useState<'kill' | 'ace' | 'block' | 'error' | undefined>(undefined);

  const teamA = match.teamA;
  const teamB = match.teamB;

  const targetPoints = score.currentSetIndex === (score.bestOfSets - 1) ? 15 : score.pointsToWinSet;
  const isSetPointA = score.currentSetTeamAPoints >= targetPoints - 1 && score.currentSetTeamAPoints > score.currentSetTeamBPoints;
  const isSetPointB = score.currentSetTeamBPoints >= targetPoints - 1 && score.currentSetTeamBPoints > score.currentSetTeamAPoints;

  const handlePoint = (team: 'teamA' | 'teamB') => {
    onAction({
      type: 'POINT',
      scoringTeam: team,
      actionDetail: selectedModifier
    });
    // Reset modifier after scoring
    setSelectedModifier(undefined);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12">
      {/* 1. BROADCAST SCOREBOARD HUD */}
      <div className="rounded-2xl bg-gradient-to-b from-[#101b30] to-[#09101d] border border-cyan-500/30 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-extrabold text-xs tracking-wider uppercase">
              SET {score.currentSetIndex + 1} OF {score.bestOfSets}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Target: {targetPoints} pts (Must win by 2)
            </span>
          </div>

          {(isSetPointA || isSetPointB) && (
            <span className="animate-pulse flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500 text-amber-300 font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20">
              <Flame className="w-3.5 h-3.5" />
              SET POINT
            </span>
          )}
        </div>

        {/* Live Set & Points Duel */}
        <div className="grid grid-cols-2 gap-4 text-center items-center">
          {/* Team A Score Column */}
          <div className={`p-4 rounded-2xl border transition-all ${
            score.servingTeamId === teamA.id 
              ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10' 
              : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-base sm:text-xl font-black text-white">{teamA.name}</span>
              {score.servingTeamId === teamA.id && (
                <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                  SERVE
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 font-mono mb-2">
              Sets Won: <strong className="text-white text-sm">{score.teamASetsWon}</strong>
            </div>
            <div className="text-5xl sm:text-7xl font-black font-mono tracking-tight text-amber-400">
              {score.currentSetTeamAPoints}
            </div>
          </div>

          {/* Team B Score Column */}
          <div className={`p-4 rounded-2xl border transition-all ${
            score.servingTeamId === teamB.id 
              ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10' 
              : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-base sm:text-xl font-black text-white">{teamB.name}</span>
              {score.servingTeamId === teamB.id && (
                <span className="px-2 py-0.5 rounded bg-cyan-400 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                  SERVE
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 font-mono mb-2">
              Sets Won: <strong className="text-white text-sm">{score.teamBSetsWon}</strong>
            </div>
            <div className="text-5xl sm:text-7xl font-black font-mono tracking-tight text-cyan-400">
              {score.currentSetTeamBPoints}
            </div>
          </div>
        </div>

        {/* Set History Breakdown */}
        {score.setHistory && score.setHistory.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-4 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Previous Sets:</span>
            {score.setHistory.map((sh) => (
              <span
                key={sh.setNumber}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-mono text-slate-300"
              >
                Set {sh.setNumber}: <strong className="text-white">{sh.teamAScore} - {sh.teamBScore}</strong>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. POINT MODIFIER ATTRIBUTION PILLS */}
      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Point Type Tag (Optional):
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['kill', 'ace', 'block', 'error'] as const).map((mod) => (
            <button
              key={mod}
              onClick={() => setSelectedModifier(selectedModifier === mod ? undefined : mod)}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                selectedModifier === mod
                  ? 'bg-emerald-500 text-slate-950 border border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* 3. BIG TOUCH-FRIENDLY SCORER POINT BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* +1 Point Team A */}
        <button
          onClick={() => handlePoint('teamA')}
          className="tactile-btn p-6 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-2 border-amber-400 shadow-xl shadow-amber-600/20 flex flex-col items-center justify-center gap-2 group"
        >
          <span className="text-sm font-extrabold uppercase tracking-wider opacity-90">
            POINT FOR
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white group-hover:scale-105 transition-transform">
            {teamA.name}
          </span>
          <span className="text-3xl sm:text-4xl font-mono font-black mt-1">
            +1 POINT
          </span>
        </button>

        {/* +1 Point Team B */}
        <button
          onClick={() => handlePoint('teamB')}
          className="tactile-btn p-6 rounded-2xl bg-gradient-to-br from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white border-2 border-cyan-400 shadow-xl shadow-cyan-600/20 flex flex-col items-center justify-center gap-2 group"
        >
          <span className="text-sm font-extrabold uppercase tracking-wider opacity-90">
            POINT FOR
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white group-hover:scale-105 transition-transform">
            {teamB.name}
          </span>
          <span className="text-3xl sm:text-4xl font-mono font-black mt-1">
            +1 POINT
          </span>
        </button>
      </div>

      {/* 4. SERVICE & TIMEOUT CONTROLS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {/* Toggle Server */}
        <button
          onClick={() => onAction({ type: 'SWITCH_SERVER', team: score.servingTeamId === teamA.id ? 'teamB' : 'teamA' })}
          className="tactile-btn p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex flex-col items-center justify-center gap-1"
        >
          <RotateCw className="w-4 h-4 text-cyan-400" />
          <span>Switch Server</span>
        </button>

        {/* Timeout Team A */}
        <button
          onClick={() => onAction({ type: 'TIMEOUT', team: 'teamA' })}
          className="tactile-btn p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex flex-col items-center justify-center gap-1"
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Timeout {teamA.shortName} ({score.teamATimeouts}/2)</span>
        </button>

        {/* Timeout Team B */}
        <button
          onClick={() => onAction({ type: 'TIMEOUT', team: 'teamB' })}
          className="tactile-btn p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex flex-col items-center justify-center gap-1"
        >
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Timeout {teamB.shortName} ({score.teamBTimeouts}/2)</span>
        </button>

        {/* Quick Rule Info */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex flex-col items-center justify-center text-center">
          <span className="font-bold text-slate-300">Set Tie-break</span>
          <span>Best of {score.bestOfSets} Sets</span>
        </div>
      </div>
    </div>
  );
};
