'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useOrganizations, useUserProfile } from '@/lib/user-org-store';
import { useMatches } from '@/lib/match-store';
import { SportType, Match } from '@/types/sports';
import { Organization, OrganizationMember } from '@/types/user-org';
import { ALL_SPORTS, SPORTS_REGISTRY } from '@/lib/sports-config';
import { SportBadge } from '@/components/SportBadge';
import { LiveStatusBadge } from '@/components/LiveStatusBadge';
import { copyToClipboard } from '@/lib/clipboard';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Users, 
  KeyRound, 
  Search, 
  PlusCircle, 
  Eye, 
  PenTool, 
  ArrowLeft,
  Trophy,
  ShieldCheck,
  ArrowLeftRight,
  Check,
  X,
  Flame,
  Table2
} from 'lucide-react';
import { OrgStandingsTable } from '@/components/standings/OrgStandingsTable';

export default function OrganizationDetailPage() {
  const params = useParams();
  const orgId = params?.id as string;

  const { getOrganizationById, joinOrganizationWithCode, addSportToOrganization } = useOrganizations();
  const { profile, toggleRole } = useUserProfile();
  const { matches } = useMatches();

  const org = getOrganizationById(orgId);
  const isOrganizer = profile.role === 'organizer';

  // View Mode: 'standings' (points table) or 'fixtures' (matches feed)
  const [viewSection, setViewSection] = useState<'standings' | 'fixtures'>('standings');

  // Sport exploration state
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('all');
  const [sportSearchQuery, setSportSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Quick join dialog state
  const [showJoinInline, setShowJoinInline] = useState(false);
  const [inlineDisplayName, setInlineDisplayName] = useState('');
  const [inlinePhone, setInlinePhone] = useState('');
  const [joinMsg, setJoinMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Add Sport modal
  const [showAddSportModal, setShowAddSportModal] = useState(false);

  if (!org) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in">
        <Building2 className="w-12 h-12 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-800">Organization Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested organization ID could not be found or has been removed.
        </p>
        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs"
        >
          Return to Discovery Hub
        </Link>
      </div>
    );
  }

  // Filter sports conducted by this org based on search query
  const conductedSports = (org.sports as SportType[]).filter((sportId: SportType) => {
    const config = SPORTS_REGISTRY[sportId];
    const q = sportSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return config?.name.toLowerCase().includes(q) ||
           config?.tagline.toLowerCase().includes(q);
  });

  // Sports that can be newly added to this organization
  const availableSportsToAdd = ALL_SPORTS.filter(s => !org.sports.includes(s.id));

  // Matches drill-down with intelligent multi-field search
  const orgMatches = matches.filter((m: Match) => {
    // Check if match belongs to this organization
    const belongsToOrg = m.organizationId ? m.organizationId === org.id : org.sports.includes(m.sport);
    if (!belongsToOrg) return false;

    // Filter by selected sport tab
    if (selectedSport !== 'all' && m.sport !== selectedSport) return false;

    // Filter by sport search query (matches sport name, tournament name, team names, or match title)
    if (sportSearchQuery.trim()) {
      const q = sportSearchQuery.toLowerCase().trim();
      const sportName = SPORTS_REGISTRY[m.sport]?.name.toLowerCase() || '';
      const tournamentName = m.tournamentName.toLowerCase();
      const matchTitle = m.title.toLowerCase();
      const teamAName = m.teamA.name.toLowerCase();
      const teamBName = m.teamB.name.toLowerCase();
      const venue = m.venue.toLowerCase();
      return (
        sportName.includes(q) || 
        tournamentName.includes(q) || 
        matchTitle.includes(q) || 
        teamAName.includes(q) || 
        teamBName.includes(q) ||
        venue.includes(q)
      );
    }

    return true;
  });

  const handleCopySecretCode = () => {
    copyToClipboard(org.secretCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleInlineJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = joinOrganizationWithCode(
      org.secretCode,
      inlineDisplayName || profile.fullName,
      inlinePhone,
      profile.id
    );
    setJoinMsg({ success: res.success, text: res.message });
    if (res.success) {
      setTimeout(() => {
        setShowJoinInline(false);
        setJoinMsg(null);
      }, 1500);
    }
  };

  const handleAddSport = (sportId: SportType) => {
    addSportToOrganization(org.id, sportId);
    setShowAddSportModal(false);
  };

  const isMember = org.members.some((m: OrganizationMember) => m.userId === profile.id);
  const canJoin = !isMember && org.members.length < org.maxOrganizers;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in pb-24 md:pb-8">
      {/* Back Link & Role Switcher Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery Hub</span>
        </Link>

        {/* Fluid Role Switcher Toggle */}
        <button
          onClick={toggleRole}
          title="Click to toggle between Viewer and Organizer mode"
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs tactile-btn ${
            isOrganizer
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
              : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
          }`}
        >
          {isOrganizer ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Organizer Mode Active</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Viewer Mode Active</span>
            </>
          )}
          <ArrowLeftRight className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. ORGANIZATION PROFILE HEADER */}
      {/* ========================================================================= */}
      <div className="glass-panel p-5 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Org Logo & Info */}
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 overflow-hidden flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
              {org.logoUrl ? (
                <img src={org.logoUrl} alt={org.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-3xl font-black text-white font-mono">{org.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  Verified Grassroots Federation
                </span>
              </div>

              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{org.description}</p>

              <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {org.city}, {org.state}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {org.creatorPhone}
                </span>
                <span>•</span>
                <span className="text-slate-400">Lead Creator: <strong className="text-white">{org.creatorName}</strong></span>
              </div>
            </div>
          </div>

          {/* Org Secret Code Card (Up to 4 Organizers) */}
          <div className="p-4 rounded-2xl bg-[#080d22]/90 border border-white/10 space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="text-slate-400 uppercase font-bold text-[10px]">Invite Secret Code</span>
              <span className="text-[10px] font-mono text-cyan-300 font-bold">
                Capacity: {org.members.length}/{org.maxOrganizers} Slots
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 font-mono font-black text-base text-cyan-400 tracking-wider">
                {org.secretCode}
              </div>
              <button
                onClick={handleCopySecretCode}
                title="Copy Secret Code to invite co-organizers"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/15 transition-colors tactile-btn"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <KeyRound className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 max-w-[200px]">
              Share with up to 3 officials to co-organize & score matches.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CO-ORGANIZERS TEAM ROSTER (MAX 4 MEMBERS) */}
      {/* ========================================================================= */}
      <section className="glass-panel p-5 sm:p-6 rounded-3xl space-y-4 shadow-2xl border border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Organizer Team Roster ({org.members.length} / {org.maxOrganizers})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Co-organizers hold official scoring authority with custom organizational display titles.
            </p>
          </div>

          {canJoin && (
            <button
              onClick={() => setShowJoinInline(!showJoinInline)}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-bold transition-all tactile-btn"
            >
              {showJoinInline ? 'Cancel' : '+ Join this Organization Team'}
            </button>
          )}
        </div>

        {/* Inline Join Form */}
        {showJoinInline && (
          <form onSubmit={handleInlineJoin} className="p-4 rounded-2xl bg-[#080d22]/90 border border-white/15 space-y-3 animate-fade-in">
            <h3 className="text-xs font-bold text-white">Join as Co-Organizer for {org.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Custom Display Name (e.g. Coach Arun - Match Scorer)"
                value={inlineDisplayName}
                onChange={(e) => setInlineDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs focus:outline-hidden"
              />
              <input
                type="text"
                placeholder="Contact Phone"
                value={inlinePhone}
                onChange={(e) => setInlinePhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs focus:outline-hidden"
              />
            </div>
            {joinMsg && (
              <p className={`text-xs font-bold ${joinMsg.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                {joinMsg.text}
              </p>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl liquid-btn-primary text-white font-bold text-xs tactile-btn cursor-pointer"
            >
              Confirm & Join Roster
            </button>
          </form>
        )}

        {/* Member cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {org.members.map((member: OrganizationMember, idx: number) => (
            <div
              key={member.id}
              className="p-3.5 rounded-2xl bg-[#080d22]/70 border border-white/10 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center font-bold text-xs text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                {idx + 1}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white block truncate">{member.orgDisplayName}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block capitalize">
                  {member.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}

          {/* Empty slot placeholders up to 4 */}
          {Array.from({ length: org.maxOrganizers - org.members.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="p-3.5 rounded-2xl border border-dashed border-white/15 text-center flex items-center justify-center text-xs text-slate-500 font-semibold"
            >
              <span>+ Available Organizer Slot</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ORGANIZATION TOURNAMENT HUB: LEADERBOARDS & FIXTURES */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-black text-white font-mono flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>{org.name} Tournament Hub</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Official inter-team standings and match fixtures conducted under {org.name}.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Organizer Mode: Add Sport */}
            {isOrganizer && availableSportsToAdd.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAddSportModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/15 text-xs font-bold transition-all shadow-xs tactile-btn min-h-[42px] cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-cyan-400" />
                <span>+ Host Another Sport</span>
              </button>
            )}

            {/* Create Match for this Org - Organizers Only */}
            {isOrganizer && (
              <Link
                href={`/matches/new?orgId=${org.id}${selectedSport !== 'all' ? `&sport=${selectedSport}` : ''}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl liquid-btn-primary text-white font-bold text-xs tactile-btn min-h-[42px] cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>+ Score Match</span>
              </Link>
            )}
          </div>
        </div>

        {/* View Mode Toggle Bar (Leaderboard vs Fixtures) */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl liquid-glass border border-white/10 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setViewSection('standings')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all tactile-btn cursor-pointer min-h-[40px] ${
              viewSection === 'standings'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Leaderboard & Points Table</span>
          </button>
          <button
            type="button"
            onClick={() => setViewSection('fixtures')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all tactile-btn cursor-pointer min-h-[40px] ${
              viewSection === 'fixtures'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Flame className="w-4 h-4 text-cyan-400" />
            <span>Matches & Fixtures ({orgMatches.length})</span>
          </button>
        </div>

        {/* View 1: Organization Leaderboard Standings Table */}
        {viewSection === 'standings' && (
          <OrgStandingsTable
            organizationId={org.id}
            organizationName={org.name}
            sports={org.sports as SportType[]}
            initialSport={selectedSport !== 'all' ? selectedSport : undefined}
            isOrganizer={isOrganizer}
          />
        )}

        {/* View 2: Matches & Fixtures Feed */}
        {viewSection === 'fixtures' && (
          <div className="space-y-5 animate-fade-in">

        {/* Sport-Specific Search Bar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={sportSearchQuery}
              onChange={(e) => setSportSearchQuery(e.target.value)}
              placeholder="Search sports, tournaments, teams, or match fixtures in this organization..."
              className="w-full pl-10 pr-10 py-3 rounded-xl glass-input text-white placeholder-slate-500 text-xs focus:outline-hidden"
            />
            {sportSearchQuery && (
              <button
                onClick={() => setSportSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Conducted Sports Selector Tabs - Mobile touch momentum */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 touch-scroll">
            <button
              onClick={() => setSelectedSport('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 shadow-xs tactile-btn min-h-[38px] ${
                selectedSport === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              All Conducted Sports ({org.sports.length})
            </button>

            {conductedSports.map((sportId: SportType) => {
              const config = SPORTS_REGISTRY[sportId];
              const isSelected = selectedSport === sportId;
              const sportMatchesCount = matches.filter((m: Match) => 
                (m.organizationId === org.id || org.sports.includes(m.sport)) && m.sport === sportId
              ).length;

              return (
                <button
                  key={sportId}
                  onClick={() => setSelectedSport(sportId)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 shadow-xs tactile-btn min-h-[38px] ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span>{config?.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-cyan-400/20 text-cyan-200 font-bold' : 'bg-white/10 text-slate-400'
                  }`}>
                    {sportMatchesCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Matches & Tournaments Feed under this Organization */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>
              {selectedSport === 'all' ? 'All Active Tournaments & Fixtures' : `${SPORTS_REGISTRY[selectedSport as SportType]?.name || selectedSport} Matches`}
            </span>
            <span className="font-mono text-cyan-400 font-bold">{orgMatches.length} Matches Found</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {orgMatches.map((m) => (
              <div
                key={m.id}
                className="glass-panel p-5 space-y-4 flex flex-col justify-between border border-white/10 glass-panel-hover"
              >
                <div className="space-y-3">
                  {/* Status & Sport Header */}
                  <div className="flex items-center justify-between">
                    <SportBadge sport={m.sport} size="sm" />
                    <LiveStatusBadge status={m.status} />
                  </div>

                  {/* Tournament & Stage */}
                  <div>
                    <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block font-bold">
                      {m.tournamentName} • {m.stage}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">
                      {m.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span className="truncate">{m.venue}</span>
                    </p>
                  </div>

                  {/* Teams / Score Preview */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.teamA.color }} />
                        {m.teamA.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.teamB.color }} />
                        {m.teamB.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Perspective Actions */}
                <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                  <Link
                    href={`/matches/${m.id}`}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/50 text-cyan-300 font-bold text-xs border border-cyan-500/40 transition-colors shadow-2xs tactile-btn min-h-[42px] ${
                      isOrganizer ? 'flex-1' : 'w-full'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Spectator View</span>
                  </Link>

                  {isOrganizer && (
                    <Link
                      href={`/matches/${m.id}/score`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl liquid-btn-primary text-white font-bold text-xs transition-colors tactile-btn min-h-[42px]"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Scorer Console</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {orgMatches.length === 0 && (
              <div className="col-span-full p-8 text-center rounded-2xl glass-panel border border-white/10 text-xs text-slate-400 space-y-3">
                <Trophy className="w-8 h-8 text-slate-500 mx-auto" />
                <p>No active matches found matching your sport drill-down under {org.name}.</p>
                {isOrganizer && (
                  <Link
                    href="/matches/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl liquid-btn-primary text-white font-bold text-xs tactile-btn"
                  >
                    <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                    <span>Setup First Match for this Sport</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </section>

      {/* ========================================================================= */}
      {/* MODAL: ADD SPORT TO ORGANIZATION (MOBILE BOTTOM SHEET) */}
      {/* ========================================================================= */}
      {showAddSportModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="liquid-glass w-full max-w-md rounded-t-3xl sm:rounded-2xl border-t sm:border border-white/20 p-5 sm:p-6 space-y-4 mobile-bottom-sheet">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Add Sport to {org.name}</h3>
              <button
                onClick={() => setShowAddSportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select an additional sport to manage simultaneously under this organization:
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {availableSportsToAdd.map(sport => (
                <button
                  key={sport.id}
                  onClick={() => handleAddSport(sport.id)}
                  className="p-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-left text-xs font-bold text-white transition-all flex items-center justify-between shadow-xs tactile-btn cursor-pointer min-h-[44px]"
                >
                  <span>{sport.name}</span>
                  <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
