'use client';

import React from 'react';
import { StandingsTable } from '@/components/standings/StandingsTable';
import { Trophy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function StandingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Discovery Hub</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 shadow-2xs">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Tournament Standings & Leaderboards
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Dynamic points table auto-calculating sport-specific tie-breakers (Net Run Rate, Set Ratios, Score Differentials).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Standings Table Component */}
      <StandingsTable />
    </div>
  );
}
