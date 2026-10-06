'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMatch } from '@/lib/match-store';
import { ScorerHeader } from '@/components/scoring/ScorerHeader';
import { CricketScorer } from '@/components/scoring/CricketScorer';
import { VolleyballScorer } from '@/components/scoring/VolleyballScorer';
import { KabaddiScorer } from '@/components/scoring/KabaddiScorer';
import { 
  processCricketAction, 
  processVolleyballAction, 
  processKabaddiAction, 
  undoLastMatchEvent,
  CricketAction,
  VolleyballAction,
  KabaddiAction
} from '@/lib/scoring-engine';
import { useUserProfile } from '@/lib/user-org-store';
import { ArrowLeft, AlertCircle, Eye, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';

export default function MatchScorerConsolePage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params?.id as string;
  const { match, updateMatch } = useMatch(matchId);
  const { profile, isLoaded } = useUserProfile();
  const [lastActionText, setLastActionText] = useState<string | undefined>(undefined);

  const isOrganizer = profile.role === 'organizer';

  // Security & Perspective Enforcement: Viewers cannot make any score changes
  if (isLoaded && !isOrganizer) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-amber-500/30 bg-slate-900/90 text-white space-y-6 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Viewer Mode Active
            </span>
            <h2 className="text-xl font-bold text-white pt-2">Scorer Console Restricted</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              In Viewer Mode, you can only spectate live match scores. Making score adjustments and operating the referee console is reserved exclusively for Organizers.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href={`/matches/${matchId}`}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/25"
            >
              <Eye className="w-4 h-4" />
              <span>Open Spectator View</span>
            </Link>
            <Link
              href="/profile"
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Shift Mode in Profile</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-500" />
        <h2 className="text-xl font-bold text-white">Match Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          The requested match ID <code className="text-emerald-400">{matchId}</code> could not be located in live memory or storage.
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  // Action Dispatchers
  const handleCricketAction = (action: CricketAction) => {
    const { updatedMatch, eventDescription } = processCricketAction(match, action);
    updateMatch(updatedMatch);
    setLastActionText(eventDescription);
  };

  const handleVolleyballAction = (action: VolleyballAction) => {
    const { updatedMatch, eventDescription } = processVolleyballAction(match, action);
    updateMatch(updatedMatch);
    setLastActionText(eventDescription);
  };

  const handleKabaddiAction = (action: KabaddiAction) => {
    const { updatedMatch, eventDescription } = processKabaddiAction(match, action);
    updateMatch(updatedMatch);
    setLastActionText(eventDescription);
  };

  const handleUndo = () => {
    const res = undoLastMatchEvent(match);
    if (res) {
      updateMatch(res.updatedMatch);
      setLastActionText(`UNDONE: ${res.undoneDescription}`);
    }
  };

  const handleEndMatch = () => {
    if (window.confirm('Are you sure you want to conclude and finalize this live match?')) {
      const updated = {
        ...match,
        status: 'completed' as const,
        updatedAt: new Date().toISOString()
      };
      updateMatch(updated);
      setLastActionText('Match declared officially completed');
    }
  };

  const canUndo = Boolean(match.events && match.events.length > 0);

  return (
    <div className="min-h-screen bg-[#070b14]">
      {/* Sticky Header with Timer & Undo */}
      <ScorerHeader
        match={match}
        onUndo={handleUndo}
        canUndo={canUndo}
        onEndMatch={handleEndMatch}
        lastActionText={lastActionText}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Sport-Specific Scorer Engines */}
        {match.sport === 'cricket' && (
          <CricketScorer match={match} onAction={handleCricketAction} />
        )}

        {(match.sport === 'volleyball' || match.sport === 'badminton' || match.sport === 'throwball' || match.sport === 'table-tennis') && (
          <VolleyballScorer match={match} onAction={handleVolleyballAction} />
        )}

        {match.sport === 'kabaddi' && (
          <KabaddiScorer match={match} onAction={handleKabaddiAction} />
        )}

        {match.sport === 'athletics' && (
          <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
            <h3 className="text-lg font-bold text-white mb-2">Athletics Track Scorer</h3>
            <p className="text-xs">Heat timers and distance measurement entries are active in spectator view.</p>
          </div>
        )}
      </div>
    </div>
  );
}
