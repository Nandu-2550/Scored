'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  Layers, 
  Table2, 
  User 
} from 'lucide-react';
import { useUserProfile } from '@/lib/user-org-store';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { profile } = useUserProfile();

  if (!profile.isLoggedIn) {
    return null;
  }

  const navItems = [
    { label: 'Discovery', href: '/', icon: Building2 },
    { label: 'Organizations', href: '/organizations', icon: Layers },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav 
      className="fixed inset-x-3 z-40 max-w-sm mx-auto bg-[#070b1a]/90 backdrop-blur-2xl border border-white/15 rounded-2xl p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2)] md:hidden transition-all"
      style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-center justify-between gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 min-h-[46px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all tactile-btn relative ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.25)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5] scale-105' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight font-sans leading-none">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,1)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
