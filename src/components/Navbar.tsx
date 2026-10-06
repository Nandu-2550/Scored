'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  PlusCircle, 
  Table2, 
  Menu, 
  X, 
  Flame, 
  Building2, 
  User, 
  Eye, 
  ShieldCheck, 
  ArrowLeftRight,
  Layers 
} from 'lucide-react';
import { useUserProfile } from '@/lib/user-org-store';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, toggleRole, logoutUser } = useUserProfile();

  const isOrganizer = profile.role === 'organizer';

  const navLinks = [
    { label: 'Discovery Hub', href: '/', icon: Building2 },
    { label: 'Directory', href: '/organizations', icon: Layers },
    { label: 'Points Tables', href: '/standings', icon: Table2 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/60 bg-white/75 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-wider text-slate-900 font-mono flex items-center gap-0.5">
                  SCORED<span className="text-blue-600">.</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 -mt-1">
                  Multi-Sport Hub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Only visible when logged in */}
            {profile.isLoggedIn && (
              <nav className="hidden lg:flex items-center gap-1 pl-4 border-l border-slate-200/80">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Header Elements - Only visible when logged in */}
          {profile.isLoggedIn && (
            <div className="hidden sm:flex items-center gap-3">
              {/* Dynamic Role Switcher Pill */}
              <button
                onClick={toggleRole}
                title="Click to toggle between Viewer and Organizer mode"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs group ${
                  isOrganizer
                    ? 'bg-amber-50/90 border-amber-300 text-amber-800 hover:bg-amber-100'
                    : 'bg-blue-50/90 border-blue-200 text-blue-700 hover:bg-blue-100'
                }`}
              >
                {isOrganizer ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Organizer Mode</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Viewer Mode</span>
                  </>
                )}
                <ArrowLeftRight className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
              </button>

              {/* User Profile Badge */}
              <div className="flex items-center gap-1.5">
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all glass-panel ${
                    pathname === '/profile'
                      ? 'bg-blue-50/90 border-blue-400 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-white/60 text-slate-700 hover:border-slate-300 hover:bg-white/90'
                  }`}
                >
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-5 h-5 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <User className="w-4 h-4 text-slate-500" />
                  )}
                  <span className="font-mono text-[11px] text-blue-700 font-bold">{profile.playerId}</span>
                </Link>
                <button
                  onClick={logoutUser}
                  title="Sign Out / Switch Profile"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Score New Match CTA */}
              <Link
                href="/matches/new"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  isOrganizer
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
                    : 'bg-white/80 hover:bg-white text-slate-800 border border-slate-200'
                }`}
              >
                <PlusCircle className={`w-4 h-4 stroke-[2.5] ${isOrganizer ? 'text-white' : 'text-blue-600'}`} />
                <span>{isOrganizer ? '+ Score Match' : 'New Match'}</span>
              </Link>
            </div>
          )}

          {/* Mobile menu trigger - Only visible when logged in */}
          {profile.isLoggedIn && (
            <div className="flex items-center gap-2 sm:hidden">
              <button
                onClick={toggleRole}
                className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                  isOrganizer
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}
              >
                {isOrganizer ? 'Organizer' : 'Viewer'}
              </button>
              <Link
                href="/profile"
                className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-blue-600"
              >
                <User className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown - Only visible when logged in */}
      {profile.isLoggedIn && mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg animate-fade-in">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Role: <strong className="text-slate-900 capitalize">{profile.role}</strong>
            </span>
            <Link
              href="/matches/new"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              + Score Match
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
