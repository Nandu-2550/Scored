import React from 'react';

interface LiveStatusBadgeProps {
  status: 'upcoming' | 'live' | 'completed' | 'paused';
}

export const LiveStatusBadge: React.FC<LiveStatusBadgeProps> = ({ status }) => {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 shadow-xs">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
        </span>
        LIVE
      </span>
    );
  }

  if (status === 'paused') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
        PAUSED
      </span>
    );
  }

  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
        FINAL
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
      UPCOMING
    </span>
  );
};
