'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  Layers, 
  Table2, 
  User, 
  ShieldCheck, 
  Eye,
  PlusCircle
} from 'lucide-react';
import { useUserProfile } from '@/lib/user-org-store';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { profile, toggleRole } = useUserProfile();
  const isOrganizer = profile.role === 'organizer';

  if (!profile.isLoggedIn) {
    return null;
  }

  const navItems = [
    { label: 'Discovery', href: '/', icon: Building2 },
    { label: 'Directory', href: '/organizations', icon: Layers },
    { label: 'Standings', href: '/standings', icon: Table2 },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 md:hidden shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* Quick Role Toggle in Mobile Bottom Bar */}
        <button
          onClick={toggleRole}
          title="Click to toggle Viewer / Organizer Mode"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            isOrganizer ? 'text-amber-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          {isOrganizer ? (
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          ) : (
            <Eye className="w-5 h-5 stroke-[1.75]" />
          )}
          <span className="text-[10px] mt-0.5 tracking-tight">
            {isOrganizer ? 'Organizer' : 'Viewer'}
          </span>
        </button>
      </div>
    </nav>
  );
};
