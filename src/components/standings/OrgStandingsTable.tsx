'use client';

import React, { useState, useEffect } from 'react';
import { SportType, StandingsRow } from '@/types/sports';
import { useMatches } from '@/lib/match-store';
import { calculateOrganizationStandings } from '@/lib/org-standings';
import { SPORTS_REGISTRY } from '@/lib/sports-config';
import { SportBadge } from '@/components/SportBadge';
import { Trophy, ShieldCheck, PlusCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface OrgStandingsTableProps {
  organizationId: string;
  organizationName: string;
  sports: SportType[];
  initialSport?: SportType;
  isOrganizer?: boolean;
}

export const OrgStandingsTable: React.FC<OrgStandingsTableProps> = ({
  organizationId,
  organizationName,
  sports,
  initialSport,
  isOrganizer = false,
}) => {
  const { matches } = useMatches();
  const defaultSport = initialSport || (sports.length > 0 ? sports[0] : 'cricket');
  const [activeSport, setActiveSport] = useState<SportType>(defaultSport);

  // Keep activeSport aligned if sports prop updates
  useEffect(() => {
    if (initialSport && sports.includes(initialSport)) {
      setActiveSport(initialSport);
    } else if (!sports.includes(activeSport) && sports.length > 0) {
      setActiveSport(sports[0]);
    }
  }, [initialSport, sports, activeSport]);

  const rows: StandingsRow[] = calculateOrganizationStandings(organizationId, activeSport, matches);
  const currentSportConfig = SPORTS_REGISTRY[activeSport];

  const getTieBreakerNote = (sport: SportType) => {
    switch (sport) {
      case 'cricket':
        return 'Rankings sorted by: Points > Net Run Rate (NRR) > Head-to-Head';
      case 'volleyball':
        return 'Rankings sorted by: Points > Set Ratio (SW / SL) > Points Ratio';
      case 'kabaddi':
        return 'Rankings sorted by: Match Points (5 pts for Win) > Score Differential';
      default:
        return 'Rankings sorted by: Total Points > Matches Won';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Subtext */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="text-base sm:text-lg font-black text-white font-mono tracking-tight">
              {organizationName} — Points Table
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Leaderboard calculated strictly between teams registered and competing within {organizationName}.
          </p>
        </div>

        {/* Playoff Qualifier Pill */}
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] inline-block" />
          <span>Playoff Zone (Top 2)</span>
        </div>
      </div>

      {/* Sport Category Filter Tabs (Exclusively for this organization's sports) */}
      {sports.length > 1 && (
        <div className="flex items-center gap-2 p-1.5 rounded-2xl liquid-glass border border-white/10 overflow-x-auto no-scrollbar touch-scroll">
          {sports.map((sp) => {
            const isSelected = activeSport === sp;
            return (
              <button
                key={sp}
                type="button"
                onClick={() => setActiveSport(sp)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap tactile-btn min-h-[38px] cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <SportBadge sport={sp} size="sm" />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Standings Table or Empty State */}
      <div className="liquid-glass rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#080d22]/70">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-400">
              {currentSportConfig?.name || activeSport} Tournament Table
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">
              {rows.length} {rows.length === 1 ? 'Team' : 'Teams'} in Organization
            </span>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            {getTieBreakerNote(activeSport)}
          </p>
        </div>

        {rows.length > 0 ? (
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-[#080d22]/90 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3 sm:px-4 w-10 text-center">#</th>
                  <th className="py-3 px-3 sm:px-4">Team</th>
                  <th className="py-3 px-2 sm:px-3 text-center">P</th>
                  <th className="py-3 px-2 sm:px-3 text-center">W</th>
                  <th className="py-3 px-2 sm:px-3 text-center">L</th>
                  <th className="py-3 px-2 sm:px-3 text-center">T</th>
                  {activeSport === 'cricket' && (
                    <th className="py-3 px-3 sm:px-4 text-right">NRR</th>
                  )}
                  {activeSport === 'volleyball' && (
                    <>
                      <th className="py-3 px-2 sm:px-3 text-center">SW</th>
                      <th className="py-3 px-2 sm:px-3 text-center">SL</th>
                      <th className="py-3 px-3 sm:px-4 text-right">Ratio</th>
                    </>
                  )}
                  {activeSport === 'kabaddi' && (
                    <th className="py-3 px-3 sm:px-4 text-right">Score Diff</th>
                  )}
                  <th className="py-3 px-3 sm:px-4 text-right font-black">PTS</th>
                  <th className="py-3 px-3 sm:px-4 text-center">Form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {rows.map((row, index) => {
                  const isPlayoffZone = index < 2;

                  return (
                    <tr
                      key={row.teamId}
                      className={`hover:bg-white/5 transition-colors ${
                        isPlayoffZone ? 'bg-emerald-950/20' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-3 sm:px-4 text-center font-bold text-white relative">
                        {isPlayoffZone && (
                          <span className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-r shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        )}
                        {index + 1}
                      </td>

                      {/* Team Name with Color Badge */}
                      <td className="py-3.5 px-3 sm:px-4 font-sans font-bold text-xs sm:text-sm text-white flex items-center gap-2.5 whitespace-nowrap">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: row.teamColor || '#3b82f6' }}
                        />
                        <span className="truncate max-w-[140px] sm:max-w-none">{row.teamName}</span>
                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">({row.teamShort})</span>
                      </td>

                      {/* Stats */}
                      <td className="py-3.5 px-2 sm:px-3 text-center text-slate-300 font-medium">{row.played}</td>
                      <td className="py-3.5 px-2 sm:px-3 text-center text-emerald-400 font-bold">{row.won}</td>
                      <td className="py-3.5 px-2 sm:px-3 text-center text-rose-400 font-medium">{row.lost}</td>
                      <td className="py-3.5 px-2 sm:px-3 text-center text-slate-400">{row.tied}</td>

                      {/* Cricket NRR */}
                      {activeSport === 'cricket' && (
                        <td className={`py-3.5 px-3 sm:px-4 text-right font-bold ${
                          (row.nrr ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {(row.nrr ?? 0) > 0 ? `+${row.nrr?.toFixed(3)}` : row.nrr?.toFixed(3)}
                        </td>
                      )}

                      {/* Volleyball Sets */}
                      {activeSport === 'volleyball' && (
                        <>
                          <td className="py-3.5 px-2 sm:px-3 text-center text-slate-300">{row.setsWon}</td>
                          <td className="py-3.5 px-2 sm:px-3 text-center text-slate-400">{row.setsLost}</td>
                          <td className="py-3.5 px-3 sm:px-4 text-right font-bold text-cyan-400">
                            {row.setRatio ? row.setRatio.toFixed(2) : '0.00'}
                          </td>
                        </>
                      )}

                      {/* Kabaddi Score Diff */}
                      {activeSport === 'kabaddi' && (
                        <td className={`py-3.5 px-3 sm:px-4 text-right font-bold ${
                          (row.scoreDiff ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {(row.scoreDiff ?? 0) > 0 ? `+${row.scoreDiff}` : row.scoreDiff}
                        </td>
                      )}

                      {/* Total Points */}
                      <td className="py-3.5 px-3 sm:px-4 text-right font-black text-sm text-cyan-400 font-mono">
                        {row.points}
                      </td>

                      {/* Recent Form */}
                      <td className="py-3.5 px-3 sm:px-4 text-center">
                        <div className="flex items-center justify-center gap-1 font-sans">
                          {row.form && row.form.length > 0 ? (
                            row.form.map((f, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                                  f === 'W'
                                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-[0_0_6px_rgba(52,211,153,0.4)]'
                                    : f === 'L'
                                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-[0_0_6px_rgba(244,63,94,0.4)]'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}
                              >
                                {f}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">No matches</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
            <p>
              No teams have matches or results under <strong className="text-white">{organizationName}</strong> for <strong className="text-cyan-400">{currentSportConfig?.name || activeSport}</strong> yet.
            </p>
            {isOrganizer && (
              <Link
                href={`/matches/new?orgId=${organizationId}&sport=${activeSport}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl liquid-btn-primary text-white font-bold text-xs tactile-btn cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Score First Match for {currentSportConfig?.name || activeSport}</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
