'use client';

import React from 'react';
import { MatchEvent } from '@/types/sports';
import { MessageSquare, Flame, ShieldAlert, Award, Clock } from 'lucide-react';

interface CommentaryFeedProps {
  events: MatchEvent[];
  sport: string;
}

export const CommentaryFeed: React.FC<CommentaryFeedProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900/40 border border-slate-800">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
        <p className="text-sm">No live commentary events logged yet.</p>
        <p className="text-xs text-slate-600 mt-1">Actions performed in the Scorer Console appear here instantly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>Real-time Play-by-Play Feed</span>
        </div>
        <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live WebSocket Stream
        </span>
      </div>

      <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
        {events.map((ev, index) => {
          const isLatest = index === 0;
          let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
          let icon = <Clock className="w-3.5 h-3.5" />;

          if (ev.type === 'WICKET' || ev.type === 'ALL_OUT') {
            badgeColor = 'bg-red-500/20 text-red-400 border-red-500/40 font-black';
            icon = <ShieldAlert className="w-3.5 h-3.5 text-red-400" />;
          } else if (ev.type === 'SIX' || ev.type === 'SUPER_RAID' || ev.type === 'MATCH_WON') {
            badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-black';
            icon = <Flame className="w-3.5 h-3.5 text-purple-400" />;
          } else if (ev.type === 'FOUR' || ev.type === 'KILL' || ev.type === 'ACE') {
            badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold';
            icon = <Award className="w-3.5 h-3.5 text-blue-400" />;
          } else if (ev.type === 'SUPER_TACKLE' || ev.type === 'BLOCK') {
            badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
          }

          const timeString = new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

          return (
            <div
              key={ev.id || index}
              className={`p-3.5 rounded-xl border transition-all ${
                isLatest
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${badgeColor}`}>
                    {icon}
                    {ev.type.replace('_', ' ')}
                  </span>
                  {isLatest && (
                    <span className="text-[10px] font-black uppercase text-emerald-400 font-mono tracking-widest animate-pulse">
                      • JUST NOW
                    </span>
                  )}
                </div>
                <span suppressHydrationWarning className="text-[11px] text-slate-500 font-mono">
                  {timeString}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">{ev.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
