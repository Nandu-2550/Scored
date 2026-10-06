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
    <div className="liquid-glass backdrop-blur-xl bg-[#060a18]/90 border-b border-white/10 px-3 sm:px-4 py-2 sm:py-3 sticky top-14 sm:top-16 z-30 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-3">
        {/* Row 1: Back + Teams + Live Badges + Clock */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <SportBadge sport={match.sport} size="sm" />
                <LiveStatusBadge status={match.status} />
                <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                  {match.stage} • {match.venue}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5 truncate flex items-center gap-1.5">
                <span className="text-emerald-400 font-mono font-black text-xs sm:text-sm">CONSOLE:</span>
                <span className="truncate">{match.teamA.shortName} vs {match.teamB.shortName}</span>
              </h1>
            </div>
          </div>

          {/* Inline Clock on Mobile / Desktop */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0c142b] border border-white/10 font-mono text-xs sm:text-sm shrink-0 shadow-inner">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
            <span className="font-bold text-emerald-400 tracking-wider">
              {formatTimer(elapsedSeconds)}
            </span>
            <button
              type="button"
              onClick={() => setTimerRunning(!timerRunning)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={timerRunning ? 'Pause Match Timer' : 'Resume Match Timer'}
            >
              {timerRunning ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Row 2: Actions Bar (Touch-friendly horizontal row on mobile) */}
        <div className="flex items-center justify-between sm:justify-end gap-2 overflow-x-auto touch-scroll no-scrollbar pt-1 sm:pt-0">
          {/* Undo Button with Last Action Indicator */}
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition-all tactile-btn cursor-pointer shrink-0 ${
              canUndo
                ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/15 active:scale-95'
                : 'bg-white/5 text-slate-600 border-white/5 cursor-not-allowed opacity-50'
            }`}
            title="Undo last live scored action"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>UNDO</span>
          </button>

          {/* Share / Copy Spectator Link */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-colors shrink-0 cursor-pointer"
            title="Copy Public Spectator Link"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>

          {/* Open Spectator Center */}
          <Link
            href={`/matches/${match.id}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition-all hover:border-cyan-500/60 shrink-0 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Fan View</span>
          </Link>

          {/* Finalize Match */}
          {match.status !== 'completed' && (
            <button
              type="button"
              onClick={onEndMatch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-bold border border-red-500/30 hover:border-red-500/50 transition-colors shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>End</span>
            </button>
          )}
        </div>
      </div>

      {/* Undo / Last Action Toast notification bar */}
      {lastActionText && (
        <div className="max-w-7xl mx-auto mt-1.5 px-3 py-1 rounded-xl bg-[#091024]/90 border border-white/10 text-[11px] text-slate-300 flex items-center justify-between font-mono animate-fade-in">
          <span className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <strong className="text-slate-400 shrink-0">LAST:</strong> <span className="truncate">{lastActionText}</span>
          </span>
          <span className="text-[10px] text-cyan-400/80 shrink-0 ml-2 hidden sm:inline">Synced</span>
        </div>
      )}
    </div>
  );
};
