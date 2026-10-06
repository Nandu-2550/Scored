'use client';

import React, { useState } from 'react';
import { StandingsRow, SportType } from '@/types/sports';
import { 
  INITIAL_CRICKET_STANDINGS, 
  INITIAL_VOLLEYBALL_STANDINGS, 
  INITIAL_KABADDI_STANDINGS 
} from '@/lib/initial-data';
import { SportBadge } from '@/components/SportBadge';
import { Trophy } from 'lucide-react';

export const StandingsTable: React.FC = () => {
  const [activeSport, setActiveSport] = useState<SportType>('cricket');

  const getStandingsData = (): { rows: StandingsRow[]; title: string; tieBreakerNote: string } => {
    switch (activeSport) {
      case 'volleyball':
        return {
          rows: INITIAL_VOLLEYBALL_STANDINGS,
          title: 'National Spikers Trophy 2026 - Standings',
          tieBreakerNote: 'Rankings sorted by: Match Points > Set Ratio (SW / SL) > Points Ratio'
        };
      case 'kabaddi':
        return {
          rows: INITIAL_KABADDI_STANDINGS,
          title: 'Pro Arena Kabaddi Cup 2026 - Standings',
          tieBreakerNote: 'Rankings sorted by: Match Points (5 for Win, 3 for Tie) > Score Differential'
        };
      case 'cricket':
      default:
        return {
          rows: INITIAL_CRICKET_STANDINGS,
          title: 'Apex Premier League 2026 - Group Stage',
          tieBreakerNote: 'Rankings sorted by: Total Points > Net Run Rate (NRR) > Head-to-Head'
        };
    }
  };

  const { rows, title, tieBreakerNote } = getStandingsData();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Sport Category Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 overflow-x-auto shadow-xs">
        {(['cricket', 'volleyball', 'kabaddi'] as SportType[]).map((sp) => (
          <button
            key={sp}
            onClick={() => setActiveSport(sp)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase transition-all whitespace-nowrap ${
              activeSport === sp
                ? 'bg-blue-50 text-blue-800 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <SportBadge sport={sp} size="sm" />
          </button>
        ))}
      </div>

      {/* Standings Table Card */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <h2 className="text-base sm:text-lg font-black text-slate-900">{title}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{tieBreakerNote}</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block" />
            <span>Playoff Qualification Zone (Top 2)</span>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-3 text-center">P</th>
                <th className="py-3 px-3 text-center">W</th>
                <th className="py-3 px-3 text-center">L</th>
                <th className="py-3 px-3 text-center">T</th>
                {activeSport === 'cricket' && (
                  <th className="py-3 px-4 text-right">NRR</th>
                )}
                {activeSport === 'volleyball' && (
                  <>
                    <th className="py-3 px-3 text-center">SW</th>
                    <th className="py-3 px-3 text-center">SL</th>
                    <th className="py-3 px-4 text-right">Set Ratio</th>
                  </>
                )}
                {activeSport === 'kabaddi' && (
                  <th className="py-3 px-4 text-right">Score Diff</th>
                )}
                <th className="py-3 px-4 text-right font-black">PTS</th>
                <th className="py-3 px-4 text-center">Recent Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {rows.map((row, index) => {
                const isPlayoffZone = index < 2;

                return (
                  <tr
                    key={row.teamId}
                    className={`hover:bg-slate-50 transition-colors ${
                      isPlayoffZone ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900 relative">
                      {isPlayoffZone && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 rounded-r" />
                      )}
                      {index + 1}
                    </td>

                    {/* Team Name */}
                    <td className="py-3.5 px-4 font-sans font-bold text-sm text-slate-900 flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: row.teamColor }}
                      />
                      <span>{row.teamName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({row.teamShort})</span>
                    </td>

                    {/* Stats */}
                    <td className="py-3.5 px-3 text-center text-slate-700 font-medium">{row.played}</td>
                    <td className="py-3.5 px-3 text-center text-emerald-700 font-bold">{row.won}</td>
                    <td className="py-3.5 px-3 text-center text-red-600 font-medium">{row.lost}</td>
                    <td className="py-3.5 px-3 text-center text-slate-500">{row.tied}</td>

                    {/* Cricket NRR */}
                    {activeSport === 'cricket' && (
                      <td className={`py-3.5 px-4 text-right font-bold ${
                        (row.nrr ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        {(row.nrr ?? 0) > 0 ? `+${row.nrr?.toFixed(3)}` : row.nrr?.toFixed(3)}
                      </td>
                    )}

                    {/* Volleyball Sets */}
                    {activeSport === 'volleyball' && (
                      <>
                        <td className="py-3.5 px-3 text-center text-slate-700">{row.setsWon}</td>
                        <td className="py-3.5 px-3 text-center text-slate-500">{row.setsLost}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-blue-700">{row.setRatio?.toFixed(2)}</td>
                      </>
                    )}

                    {/* Kabaddi Score Diff */}
                    {activeSport === 'kabaddi' && (
                      <td className={`py-3.5 px-4 text-right font-bold ${
                        (row.scoreDiff ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        {(row.scoreDiff ?? 0) > 0 ? `+${row.scoreDiff}` : row.scoreDiff}
                      </td>
                    )}

                    {/* Total Points */}
                    <td className="py-3.5 px-4 text-right font-black text-sm text-slate-900 font-mono">
                      {row.points}
                    </td>

                    {/* Recent Form */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1 font-sans">
                        {row.form.map((f, i) => (
                          <span
                            key={i}
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                              f === 'W'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : f === 'L'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
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
