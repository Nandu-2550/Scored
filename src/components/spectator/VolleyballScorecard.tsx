'use client';

import React from 'react';
import { Match, SetRallyScoreState } from '@/types/sports';

interface VolleyballScorecardProps {
  match: Match;
}

export const VolleyballScorecard: React.FC<VolleyballScorecardProps> = ({ match }) => {
  const score = match.scoreState as SetRallyScoreState;
  const teamA = match.teamA;
  const teamB = match.teamB;

  return (
    <div className="space-y-6">
      {/* Set Summary Matrix */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-lg">
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Set-by-Set Progression
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Best of {score.bestOfSets} Sets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Team</th>
                {Array.from({ length: score.bestOfSets }).map((_, i) => (
                  <th key={i} className="py-3 px-3 text-center">Set {i + 1}</th>
                ))}
                <th className="py-3 px-4 text-right">Sets Won</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {/* Team A */}
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-sans text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  {teamA.name}
                </td>
                {Array.from({ length: score.bestOfSets }).map((_, i) => {
                  const setPast = score.setHistory.find(s => s.setNumber === i + 1);
                  const isCurrent = score.currentSetIndex === i && match.status !== 'completed';
                  return (
                    <td key={i} className="py-3 px-3 text-center font-bold">
                      {setPast ? (
                        <span className={setPast.winnerTeamId === teamA.id ? 'text-amber-400 text-sm' : 'text-slate-400'}>
                          {setPast.teamAScore}
                        </span>
                      ) : isCurrent ? (
                        <span className="text-amber-400 text-base font-black animate-pulse">
                          {score.currentSetTeamAPoints}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  );
                })}
                <td className="py-3 px-4 text-right text-base font-black text-amber-400">
                  {score.teamASetsWon}
                </td>
              </tr>

              {/* Team B */}
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-sans text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  {teamB.name}
                </td>
                {Array.from({ length: score.bestOfSets }).map((_, i) => {
                  const setPast = score.setHistory.find(s => s.setNumber === i + 1);
                  const isCurrent = score.currentSetIndex === i && match.status !== 'completed';
                  return (
                    <td key={i} className="py-3 px-3 text-center font-bold">
                      {setPast ? (
                        <span className={setPast.winnerTeamId === teamB.id ? 'text-cyan-400 text-sm' : 'text-slate-400'}>
                          {setPast.teamBScore}
                        </span>
                      ) : isCurrent ? (
                        <span className="text-cyan-400 text-base font-black animate-pulse">
                          {score.currentSetTeamBPoints}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  );
                })}
                <td className="py-3 px-4 text-right text-base font-black text-cyan-400">
                  {score.teamBSetsWon}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Roster & Lineups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Team A Roster */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
            {teamA.name} Squad
          </h4>
          <div className="space-y-1.5">
            {teamA.players.map(p => (
              <div key={p.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900 border border-slate-800/60">
                <span className="text-white font-medium">#{p.jerseyNumber} {p.name}</span>
                <span className="text-slate-400">{p.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team B Roster */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">
            {teamB.name} Squad
          </h4>
          <div className="space-y-1.5">
            {teamB.players.map(p => (
              <div key={p.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900 border border-slate-800/60">
                <span className="text-white font-medium">#{p.jerseyNumber} {p.name}</span>
                <span className="text-slate-400">{p.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
