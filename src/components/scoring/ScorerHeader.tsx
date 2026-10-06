'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Match } from '@/types/sports';
import { SportBadge } from '@/components/SportBadge';
import { LiveStatusBadge } from '@/components/LiveStatusBadge';
import { copyToClipboard } from '@/lib/clipboard';
import { 
  RotateCcw, 
  Eye, 
  Play, 
  Pause, 
  Share2, 
  CheckCircle2, 
  ArrowLeft,
  Clock,
  Sparkles
} from 'lucide-react';

interface ScorerHeaderProps {
  match: Match;
  onUndo: () => void;
  canUndo: boolean;
  onEndMatch: () => void;
  lastActionText?: string;
}

export const ScorerHeader: React.FC<ScorerHeaderProps> = ({
  match,
  onUndo,
  canUndo,
  onEndMatch,
  lastActionText,
}) => {
  const [timerRunning, setTimerRunning] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(1420); // 23m 40s
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && match.status === 'live') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, match.status]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const spectatorUrl = `${window.location.origin}/matches/${match.id}`;
      copyToClipboard(spectatorUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#0b1329] border-b border-slate-800/80 px-4 py-3 sticky top-16 z-30 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Column: Match Details & Badges */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <SportBadge sport={match.sport} size="sm" />
              <LiveStatusBadge status={match.status} />
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                {match.stage} • {match.venue}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5 flex items-center gap-2">
              <span className="text-emerald-400 font-mono font-black">CONSOLE:</span>
              <span>{match.teamA.shortName} vs {match.teamB.shortName}</span>
            </h1>
          </div>
        </div>

        {/* Middle: Match Timer & Undo notification */}
        <div className="flex items-center gap-3">
          {/* Match Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 font-mono text-sm shadow-inner">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-emerald-400 tracking-wider">
              {formatTimer(elapsedSeconds)}
            </span>
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="ml-1 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title={timerRunning ? 'Pause Match Timer' : 'Resume Match Timer'}
            >
              {timerRunning ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
            </button>
          </div>

          {/* Undo Button with Last Action Indicator */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs border transition-all ${
              canUndo
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/40 hover:border-amber-500/60 shadow-sm shadow-amber-500/10 active:scale-95'
                : 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
            title="Undo last live scored action"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>UNDO</span>
          </button>
        </div>

        {/* Right Actions: Spectator View & End Match */}
        <div className="flex items-center gap-2">
          {/* Share / Copy Spectator Link */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            title="Copy Public Spectator Link"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{copied ? 'Copied Link!' : 'Share Live'}</span>
          </button>

          {/* Open Spectator Center */}
          <Link
            href={`/matches/${match.id}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30 transition-all hover:border-cyan-500/60"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Fan View</span>
          </Link>

          {/* Finalize Match */}
          {match.status !== 'completed' && (
            <button
              onClick={onEndMatch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 hover:border-red-500/50 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>End Match</span>
            </button>
          )}
        </div>
      </div>

      {/* Undo / Last Action Toast notification bar */}
      {lastActionText && (
        <div className="max-w-7xl mx-auto mt-2 px-3 py-1 rounded bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between font-mono animate-fade-in">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <strong className="text-slate-400">LAST EVENT:</strong> {lastActionText}
          </span>
          <span className="text-[10px] text-slate-500">Auto-saved to Local & Supabase</span>
        </div>
      )}
    </div>
  );
};
