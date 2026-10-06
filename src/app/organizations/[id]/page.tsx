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
  X
} from 'lucide-react';

export default function OrganizationDetailPage() {
  const params = useParams();
  const orgId = params?.id as string;

  const { getOrganizationById, joinOrganizationWithCode, addSportToOrganization } = useOrganizations();
  const { profile, toggleRole } = useUserProfile();
  const { matches } = useMatches();

  const org = getOrganizationById(orgId);
  const isOrganizer = profile.role === 'organizer';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Back Link & Role Switcher Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Organization Discovery Hub</span>
        </Link>

        {/* Fluid Role Switcher Toggle */}
        <button
          onClick={toggleRole}
          title="Click to toggle between Viewer and Organizer mode"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs ${
            isOrganizer
              ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
              : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
          }`}
        >
          {isOrganizer ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Organizer Mode Active</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Viewer Mode Active</span>
            </>
          )}
          <ArrowLeftRight className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. ORGANIZATION PROFILE HEADER */}
      {/* ========================================================================= */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Org Logo & Info */}
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 border-2 border-blue-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
              {org.logoUrl ? (
                <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-10 h-10 text-blue-600" />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{org.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
                  Verified Grassroots Federation
                </span>
              </div>

              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">{org.description}</p>

              <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {org.city}, {org.state}, {org.country}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {org.creatorPhone}
                </span>
                <span>•</span>
                <span className="text-slate-500">Lead Creator: <strong className="text-slate-900">{org.creatorName}</strong></span>
              </div>
            </div>
          </div>

          {/* Org Secret Code Card (Up to 4 Organizers) */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="text-slate-500 uppercase font-bold text-[10px]">Invite Secret Code</span>
              <span className="text-[10px] font-mono text-emerald-700 font-bold">
                Capacity: {org.members.length}/{org.maxOrganizers} Organizers
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-mono font-black text-base text-blue-700 tracking-wider shadow-2xs">
                {org.secretCode}
              </div>
              <button
                onClick={handleCopySecretCode}
                title="Copy Secret Code to invite co-organizers"
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <KeyRound className="w-4 h-4 text-blue-600" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 max-w-[200px]">
              Share with up to 3 officials to co-organize & score matches.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CO-ORGANIZERS TEAM ROSTER (MAX 4 MEMBERS) */}
      {/* ========================================================================= */}
      <section className="glass-panel p-6 rounded-3xl space-y-4 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Organizer Team Roster ({org.members.length} / {org.maxOrganizers})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Co-organizers hold official scoring authority with custom organizational display titles.
            </p>
          </div>

          {canJoin && (
            <button
              onClick={() => setShowJoinInline(!showJoinInline)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-all"
            >
              {showJoinInline ? 'Cancel' : '+ Join this Organization Team'}
            </button>
          )}
        </div>

        {/* Inline Join Form */}
        {showJoinInline && (
          <form onSubmit={handleInlineJoin} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in">
            <h3 className="text-xs font-bold text-slate-900">Join as Co-Organizer for {org.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Custom Display Name (e.g. Coach Arun - Match Scorer)"
                value={inlineDisplayName}
                onChange={(e) => setInlineDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Contact Phone"
                value={inlinePhone}
                onChange={(e) => setInlinePhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            {joinMsg && (
              <p className={`text-xs font-bold ${joinMsg.success ? 'text-emerald-700' : 'text-rose-700'}`}>
                {joinMsg.text}
              </p>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs"
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
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-blue-600 shadow-2xs">
                {idx + 1}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 block truncate">{member.orgDisplayName}</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block capitalize">
                  {member.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}

          {/* Empty slot placeholders up to 4 */}
          {Array.from({ length: org.maxOrganizers - org.members.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="p-3.5 rounded-2xl border border-dashed border-slate-300 text-center flex items-center justify-center text-xs text-slate-400 font-semibold"
            >
              <span>+ Available Organizer Slot</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SPORT SEARCH & EXPLORER (DRILL-DOWN ENGINE) */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 font-mono flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <span>Conducted Sports & Fixtures Explorer</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simultaneous multi-sport programs managed by {org.name}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Organizer Mode: Add Sport */}
            {isOrganizer && availableSportsToAdd.length > 0 && (
              <button
                onClick={() => setShowAddSportModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 text-xs font-bold transition-all shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Host Another Sport</span>
              </button>
            )}

            {/* Create Match for this Org */}
            <Link
              href="/matches/new"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>+ Score Match</span>
            </Link>
          </div>
        </div>

        {/* Sport-Specific Search Bar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={sportSearchQuery}
              onChange={(e) => setSportSearchQuery(e.target.value)}
              placeholder="Search sports, tournaments, teams, or match fixtures in this organization..."
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-xs"
            />
            {sportSearchQuery && (
              <button
                onClick={() => setSportSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Conducted Sports Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedSport('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 shadow-xs ${
                selectedSport === 'all'
                  ? 'bg-blue-600 text-white shadow-blue-500/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 shadow-xs ${
                    isSelected
                      ? 'bg-blue-50 text-blue-800 border border-blue-300 ring-2 ring-blue-500/20'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>{config?.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-500'
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
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              {selectedSport === 'all' ? 'All Active Tournaments & Fixtures' : `${SPORTS_REGISTRY[selectedSport as SportType]?.name || selectedSport} Matches`}
            </span>
            <span className="font-mono">{orgMatches.length} Matches Found</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {orgMatches.map((m) => (
              <div
                key={m.id}
                className="scored-card p-5 space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Status & Sport Header */}
                  <div className="flex items-center justify-between">
                    <SportBadge sport={m.sport} size="sm" />
                    <LiveStatusBadge status={m.status} />
                  </div>

                  {/* Tournament & Stage */}
                  <div>
                    <span className="text-[10px] text-blue-700 font-mono uppercase tracking-wider block font-bold">
                      {m.tournamentName} • {m.stage}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5">
                      {m.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{m.venue}</span>
                    </p>
                  </div>

                  {/* Teams / Score Preview */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.teamA.color }} />
                        {m.teamA.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.teamB.color }} />
                        {m.teamB.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Perspective Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    href={`/matches/${m.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 transition-colors shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Spectator View</span>
                  </Link>

                  <Link
                    href={`/matches/${m.id}/score`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-colors shadow-2xs"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Scorer Console</span>
                  </Link>
                </div>
              </div>
            ))}

            {orgMatches.length === 0 && (
              <div className="col-span-full p-8 text-center rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 space-y-3 shadow-xs">
                <Trophy className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No active matches found matching your sport drill-down under {org.name}.</p>
                <Link
                  href="/matches/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Setup First Match for this Sport</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODAL: ADD SPORT TO ORGANIZATION */}
      {/* ========================================================================= */}
      {showAddSportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Sport to {org.name}</h3>
              <button
                onClick={() => setShowAddSportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select an additional sport to manage simultaneously under this organization:
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {availableSportsToAdd.map(sport => (
                <button
                  key={sport.id}
                  onClick={() => handleAddSport(sport.id)}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left text-xs font-bold text-slate-800 transition-all flex items-center justify-between shadow-2xs"
                >
                  <span>{sport.name}</span>
                  <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
