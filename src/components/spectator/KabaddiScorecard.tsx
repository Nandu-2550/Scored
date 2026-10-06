'use client';

import React from 'react';
import { Match, KabaddiScoreState } from '@/types/sports';

interface KabaddiScorecardProps {
  match: Match;
}

export const KabaddiScorecard: React.FC<KabaddiScorecardProps> = ({ match }) => {
  const score = match.scoreState as KabaddiScoreState;
  const teamA = match.teamA;
  const teamB = match.teamB;

  return (
    <div className="space-y-6">
      {/* Head-to-Head Points Comparison Matrix */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-lg">
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Points Breakdown & Arena Analytics
          </h3>
          <span className="text-xs text-amber-400 font-mono font-bold">
            Half {score.half}
          </span>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Total Points */}
          <div className="flex items-center justify-between font-mono text-lg sm:text-2xl font-black">
            <span className="text-amber-400">{score.teamAScore}</span>
            <span className="text-xs font-sans text-slate-400 font-bold uppercase tracking-widest">
              Total Score
            </span>
            <span className="text-orange-400">{score.teamBScore}</span>
          </div>

          {/* Metric Rows */}
          {[
            { label: 'Raid Points', a: score.teamAStats.raidPoints, b: score.teamBStats.raidPoints },
            { label: 'Tackle Points', a: score.teamAStats.tacklePoints, b: score.teamBStats.tacklePoints },
            { label: 'Bonus Points', a: score.teamAStats.bonusPoints, b: score.teamBStats.bonusPoints },
            { label: 'All-Out Points', a: score.teamAStats.allOutPoints, b: score.teamBStats.allOutPoints },
            { label: 'Active on Mat', a: `${score.teamAStats.activePlayersOnMat}/7`, b: `${score.teamBStats.activePlayersOnMat}/7` },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-slate-800/60 font-mono">
              <span className="font-bold text-white w-16">{item.a}</span>
              <span className="text-xs text-slate-400 font-sans uppercase tracking-wider text-center flex-1">
                {item.label}
              </span>
              <span className="font-bold text-white w-16 text-right">{item.b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
