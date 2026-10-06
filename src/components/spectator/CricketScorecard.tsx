'use client';

import React from 'react';
import { Match, CricketScoreState } from '@/types/sports';

interface CricketScorecardProps {
  match: Match;
}

export const CricketScorecard: React.FC<CricketScorecardProps> = ({ match }) => {
  const score = match.scoreState as CricketScoreState;
  const battingTeam = match.teamA.id === score.battingTeamId ? match.teamA : match.teamB;
  const bowlingTeam = match.teamA.id === score.bowlingTeamId ? match.teamA : match.teamB;

  const batsmenList = Object.values(score.batsmen || {});
  const bowlersList = Object.values(score.bowlers || {});

  return (
    <div className="space-y-6">
      {/* 1. Batting Scorecard Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-lg">
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              {battingTeam.name} Batting
            </h3>
          </div>
          <span className="text-sm font-black font-mono text-emerald-400">
            {score.totalRuns}/{score.wickets} ({score.overs}.{score.balls} ov)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-4">Batter</th>
                <th className="py-2.5 px-3">Dismissal</th>
                <th className="py-2.5 px-3 text-right">R</th>
                <th className="py-2.5 px-3 text-right">B</th>
                <th className="py-2.5 px-3 text-right">4s</th>
                <th className="py-2.5 px-3 text-right">6s</th>
                <th className="py-2.5 px-4 text-right">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {batsmenList.map((b) => {
                const isStriker = b.playerId === score.currentStrikerId;
                const isNonStriker = b.playerId === score.currentNonStrikerId;
                const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';

                return (
                  <tr
                    key={b.playerId}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isStriker ? 'bg-emerald-500/5 text-emerald-300 font-bold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 font-sans text-sm font-semibold flex items-center gap-1.5 text-white">
                      <span>{b.name}</span>
                      {isStriker && <span className="text-emerald-400 text-xs font-bold">*</span>}
                      {isNonStriker && <span className="text-slate-400 text-xs">†</span>}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-xs capitalize font-sans">
                      {b.isOut ? (b.dismissal ? `out (${b.dismissal})` : 'out') : 'not out'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-white">{b.runs}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">{b.balls}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{b.fours}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{b.sixes}</td>
                    <td className="py-2.5 px-4 text-right text-emerald-400">{sr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Extras & Totals row */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 font-mono">
          <div>
            <strong>Extras:</strong> {score.extras.wides + score.extras.noBalls + score.extras.byes + score.extras.legByes}
            <span className="text-slate-500 ml-1">
              (wd {score.extras.wides}, nb {score.extras.noBalls}, b {score.extras.byes}, lb {score.extras.legByes})
            </span>
          </div>
          <div>
            <strong>Total:</strong> <span className="text-white font-bold">{score.totalRuns}/{score.wickets}</span>
            <span className="text-slate-500 ml-1">({score.overs}.{score.balls} Overs, RR: {((score.totalRuns / Math.max(1, (score.overs * 6) + score.balls)) * 6).toFixed(2)})</span>
          </div>
        </div>
      </div>

      {/* 2. Bowling Scorecard Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-lg">
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              {bowlingTeam.name} Bowling
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-4">Bowler</th>
                <th className="py-2.5 px-3 text-right">O</th>
                <th className="py-2.5 px-3 text-right">M</th>
                <th className="py-2.5 px-3 text-right">R</th>
                <th className="py-2.5 px-3 text-right">W</th>
                <th className="py-2.5 px-3 text-right">Econ</th>
                <th className="py-2.5 px-4 text-right">Wd/Nb</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {bowlersList.map((bw) => {
                const isCurrent = bw.playerId === score.currentBowlerId;
                const econ = bw.overs > 0 ? (bw.runsConceded / bw.overs).toFixed(2) : '0.00';

                return (
                  <tr
                    key={bw.playerId}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isCurrent ? 'bg-cyan-500/5 text-cyan-300 font-bold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 font-sans text-sm font-semibold flex items-center gap-1.5 text-white">
                      <span>{bw.name}</span>
                      {isCurrent && <span className="text-cyan-400 text-xs font-bold">●</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{bw.overs}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">{bw.maidens}</td>
                    <td className="py-2.5 px-3 text-right text-slate-200">{bw.runsConceded}</td>
                    <td className="py-2.5 px-3 text-right font-black text-cyan-400">{bw.wickets}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{econ}</td>
                    <td className="py-2.5 px-4 text-right text-slate-400">{bw.wides}/{bw.noBalls}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
