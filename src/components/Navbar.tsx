'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Building2, 
  User, 
  Layers 
} from 'lucide-react';
import { useUserProfile } from '@/lib/user-org-store';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, logoutUser } = useUserProfile();

  const navLinks = [
    { label: 'Discovery Hub', href: '/', icon: Building2 },
    { label: 'Organizations', href: '/organizations', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070b19]/90 backdrop-blur-xl shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 sm:h-20">
          
          {/* ============================================================ */}
          {/* LEFT SECTION: Desktop Navigation or Mobile Menu Trigger      */}
          {/* ============================================================ */}
          <div className="flex items-center gap-2 sm:gap-4 z-10">
            {/* Mobile menu trigger */}
            {profile.isLoggedIn && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 sm:hidden rounded-xl text-slate-300 hover:text-white bg-white/5 border border-white/10 tactile-btn cursor-pointer"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            {/* Desktop Navigation Links (Left Side) */}
            {profile.isLoggedIn && (
              <nav className="hidden lg:flex items-center gap-1.5">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-white/10 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                          : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* ============================================================ */}
          {/* CENTER SECTION: SCORED Official Logo (Perfect Center)        */}
          {/* ============================================================ */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20 pointer-events-auto">
            <Link href="/" className="flex items-center justify-center group py-1" aria-label="SCORED Home">
              <div className="relative flex items-center justify-center">
                {/* Subtle Neon Backlight Aura */}
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full scale-125 pointer-events-none -z-10 group-hover:bg-cyan-400/35 group-hover:scale-135 transition-all duration-300" />
                <img
                  src="/scored-logo.png"
                  alt="SCORED - All Sports, All Scores, One Place"
                  className="h-11 sm:h-14 md:h-16 w-auto object-contain drop-shadow-[0_0_18px_rgba(6,182,212,0.6)] group-hover:scale-105 transition-all duration-300"
                />
              </div>
            </Link>
          </div>

          {/* ============================================================ */}
          {/* RIGHT SECTION: User Profile / Actions                        */}
          {/* ============================================================ */}
          <div className="flex items-center gap-2 sm:gap-3 z-10">
            {profile.isLoggedIn ? (
              <>
                {/* Desktop Profile Pill */}
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/profile"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all glass-panel ${
                      pathname === '/profile'
                        ? 'bg-cyan-950/40 border-cyan-400/50 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/30'
                        : 'border-white/10 text-slate-200 hover:border-cyan-400/40 hover:bg-white/10'
                    }`}
                  >
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName}
                        className="w-5 h-5 rounded-full object-cover border border-cyan-500/30"
                      />
                    ) : (
                      <User className="w-4 h-4 text-cyan-400" />
                    )}
                    <span className="font-mono text-[11px] text-cyan-300 font-bold">{profile.playerId}</span>
                  </Link>
                  <button
                    onClick={logoutUser}
                    title="Sign Out / Switch Profile"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all text-xs cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Mobile Profile Icon Button */}
                <Link
                  href="/profile"
                  className="sm:hidden flex items-center gap-1.5 p-1.5 rounded-xl bg-white/5 border border-white/10 text-cyan-300 text-xs font-mono font-bold tactile-btn"
                  title="My Profile"
                >
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-6 h-6 rounded-full object-cover border border-cyan-400/40"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                  )}
                </Link>
              </>
            ) : (
              <div className="w-6 sm:w-8" aria-hidden="true" />
            )}
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown - Only visible when logged in */}
      {profile.isLoggedIn && mobileMenuOpen && (
        <div className="sm:hidden border-b border-white/10 bg-[#080d22]/95 backdrop-blur-2xl px-4 pt-2 pb-4 space-y-2 shadow-2xl animate-fade-in">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              Role: <strong className="text-white capitalize">{profile.role}</strong>
            </span>
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-cyan-400 font-bold hover:underline"
            >
              Profile Settings
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
