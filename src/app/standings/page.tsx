'use client';

import React from 'react';
import Link from 'next/link';
import { useOrganizations } from '@/lib/user-org-store';
import { useMatches } from '@/lib/match-store';
import { SportBadge } from '@/components/SportBadge';
import { Trophy, ArrowLeft, Building2, ChevronRight, ShieldCheck, Users, Flame } from 'lucide-react';
import { SportType } from '@/types/sports';

export default function StandingsDirectoryPage() {
  const { organizations } = useOrganizations();
  const { matches } = useMatches();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in pb-24 md:pb-8">
      {/* Header */}
      <div className="glass-panel p-5 sm:p-7 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Discovery Hub</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
                Organization Leaderboards & Standings
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Standings and tournament points are calculated inside each Organization between affiliated teams.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/organizations"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl liquid-btn-primary text-white font-bold text-xs tactile-btn"
        >
          <Building2 className="w-4 h-4" />
          <span>All Organizations Hub</span>
        </Link>
      </div>

      {/* Info Notice Card */}
      <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20 bg-cyan-950/20 flex items-start gap-3 text-xs text-cyan-200">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p>
          To maintain tournament integrity, leaderboards and points tables are strictly scoped to each Club / Organization. 
          Select an organization below to view its sport-by-sport standings, NRR, set ratios, and recent team form.
        </p>
      </div>

      {/* Organizations Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {organizations.map((org) => {
          const orgMatches = matches.filter(m => m.organizationId === org.id);
          const uniqueTeams = new Set<string>();
          orgMatches.forEach(m => {
            uniqueTeams.add(m.teamA.id);
            uniqueTeams.add(m.teamB.id);
          });

          return (
            <div
              key={org.id}
              className="glass-panel p-5 space-y-4 border border-white/10 glass-panel-hover flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {org.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {org.city}, {org.state}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {org.description}
                </p>

                {/* Sports tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {org.sports.map((sp) => (
                    <SportBadge key={sp} sport={sp as SportType} size="sm" />
                  ))}
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Affiliated Teams</span>
                    <span className="font-bold text-white font-mono flex items-center gap-1.5 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      {uniqueTeams.size > 0 ? `${uniqueTeams.size} Teams` : 'Teams Active'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Conducted Matches</span>
                    <span className="font-bold text-white font-mono flex items-center gap-1.5 mt-0.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      {orgMatches.length} Matches
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href={`/organizations/${org.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl liquid-btn-primary text-white font-bold text-xs tactile-btn"
                >
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span>View Organization Leaderboard</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
