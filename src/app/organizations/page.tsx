'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useOrganizations, useUserProfile } from '@/lib/user-org-store';
import { SportType } from '@/types/sports';
import { ALL_SPORTS, SPORTS_REGISTRY } from '@/lib/sports-config';
import { SportBadge } from '@/components/SportBadge';
import { ImageUploader } from '@/components/ImageUploader';
import { copyToClipboard } from '@/lib/clipboard';
import { 
  Building2, 
  Search, 
  PlusCircle, 
  KeyRound, 
  Users, 
  MapPin, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Check,
  Layers
} from 'lucide-react';

export default function OrganizationsDirectoryPage() {
  const { organizations, createOrganization, joinOrganizationWithCode } = useOrganizations();
  const { profile } = useUserProfile();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState<string>('all');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Create Org Form State
  const [newOrgName, setNewOrgName] = useState('');
  const [newCreatorName, setNewCreatorName] = useState(profile.fullName || 'Rajesh Kumar');
  const [newCreatorPhone, setNewCreatorPhone] = useState('+91 98450 12345');
  const [newCity, setNewCity] = useState(profile.city || 'Bengaluru');
  const [newState, setNewState] = useState(profile.state || 'Karnataka');
  const [newDescription, setNewDescription] = useState('');
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [selectedSports, setSelectedSports] = useState<SportType[]>(['cricket', 'volleyball']);
  const [newOrgDisplayName, setNewOrgDisplayName] = useState('');

  // Join Org Form State
  const [joinSecretCode, setJoinSecretCode] = useState('');
  const [joinDisplayName, setJoinDisplayName] = useState('');
  const [joinPhone, setJoinPhone] = useState('');
  const [joinStatus, setJoinStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Filter organizations
  const filteredOrgs = organizations.filter(org => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      org.name.toLowerCase().includes(q) ||
      org.city.toLowerCase().includes(q) ||
      org.state.toLowerCase().includes(q) ||
      org.creatorName.toLowerCase().includes(q)
    );

    const matchesSport = selectedSportFilter === 'all'
      ? true
      : org.sports.includes(selectedSportFilter as SportType);

    return matchesSearch && matchesSport;
  });

  const toggleSportSelection = (sportId: SportType) => {
    if (selectedSports.includes(sportId)) {
      if (selectedSports.length > 1) {
        setSelectedSports(selectedSports.filter(s => s !== sportId));
      }
    } else {
      setSelectedSports([...selectedSports, sportId]);
    }
  };

  const handleCopyCode = (code: string, orgId: string) => {
    copyToClipboard(code);
    setCopiedCodeId(orgId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    createOrganization({
      name: newOrgName,
      creatorName: newCreatorName,
      creatorPhone: newCreatorPhone,
      sports: selectedSports,
      city: newCity,
      state: newState,
      description: newDescription,
      logoUrl: newLogoUrl,
      orgDisplayName: newOrgDisplayName
    });

    setShowCreateModal(false);
    setNewOrgName('');
    setNewDescription('');
    setNewLogoUrl('');
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinSecretCode.trim()) return;

    const res = joinOrganizationWithCode(
      joinSecretCode,
      joinDisplayName || profile.fullName,
      joinPhone,
      profile.id
    );

    setJoinStatus(res);
    if (res.success) {
      setTimeout(() => {
        setShowJoinModal(false);
        setJoinStatus(null);
        setJoinSecretCode('');
        setJoinDisplayName('');
      }, 1500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in pb-24 md:pb-8">
      {/* Header Banner */}
      <div className="glass-panel p-5 sm:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5 border border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Layers className="w-3.5 h-3.5" />
            <span>Organization Directory</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white font-mono tracking-tight">
            Grassroots Sports Organizations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Discover community federations and multi-sport clubs. Each organization can conduct multiple sports simultaneously with up to 4 co-organizers.
          </p>
        </div>

        {/* Action Buttons - Stacked on mobile with 46px touch targets */}
        <div className="flex items-center gap-2.5 shrink-0 flex-col sm:flex-row w-full sm:w-auto">
          <button
            onClick={() => setShowJoinModal(true)}
            className="w-full sm:w-auto min-h-[46px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 font-bold text-xs transition-all shadow-xs tactile-btn"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Join via Secret Code</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto min-h-[46px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl liquid-btn-primary text-white font-bold text-xs transition-all tactile-btn cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Create Organization</span>
          </button>
        </div>
      </div>

      {/* Search & Sport Filters */}
      <div className="space-y-3 sm:space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search organizations by name, city, state, or organizer..."
            className="w-full pl-12 pr-10 py-3 rounded-2xl glass-input text-white placeholder-slate-500 text-sm focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sport Filter Chips - Smooth Touch Swipe on phones */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 touch-scroll">
          <button
            onClick={() => setSelectedSportFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 shadow-xs tactile-btn min-h-[36px] ${
              selectedSportFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            All Sports ({organizations.length})
          </button>
          {ALL_SPORTS.map(sport => {
            const count = organizations.filter(o => o.sports.includes(sport.id)).length;
            const isSelected = selectedSportFilter === sport.id;
            return (
              <button
                key={sport.id}
                onClick={() => setSelectedSportFilter(sport.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-xs tactile-btn min-h-[36px] ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                <span>{sport.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-cyan-400/20 text-cyan-200 font-bold' : 'bg-white/10 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOrgs.map((org) => {
          const membersCount = org.members.length;
          const isCapacityFull = membersCount >= org.maxOrganizers;

          return (
            <div
              key={org.id}
              className="glass-panel p-5 sm:p-6 flex flex-col justify-between space-y-4 border border-white/10 glass-panel-hover"
            >
              <div className="space-y-3.5">
                {/* Org Header */}
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 overflow-hidden flex items-center justify-center shrink-0">
                    {org.logoUrl ? (
                      <img src={org.logoUrl} alt={org.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-cyan-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                      {org.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{org.city}, {org.state}</span>
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {org.description}
                </p>

                {/* Multi-Sport Badges */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Conducted Sports ({org.sports.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {org.sports.map(s => (
                      <SportBadge key={s} sport={s} size="sm" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Meta & Action */}
              <div className="pt-3.5 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  {/* Co-organizers capacity */}
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400">Team:</span>
                    <span className={`font-mono font-bold ${isCapacityFull ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {membersCount}/{org.maxOrganizers} Slots
                    </span>
                  </div>

                  {/* Secret code tag */}
                  <button
                    onClick={() => handleCopyCode(org.secretCode, org.id)}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-[#080d22]/90 border border-white/10 text-cyan-300 hover:border-cyan-400/40 transition-colors"
                  >
                    {copiedCodeId === org.id ? (
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    ) : (
                      <span>{org.secretCode}</span>
                    )}
                  </button>
                </div>

                <Link
                  href={`/organizations/${org.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] min-h-[44px] tactile-btn"
                >
                  <span>Explore Sports & Matches</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}

        {filteredOrgs.length === 0 && (
          <div className="col-span-full p-8 text-center glass-panel border border-white/10 space-y-3">
            <Building2 className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No Organizations Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No registered organizations matched your search filter. Create the first organization or clear your filter.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE ORGANIZATION (MOBILE BOTTOM SHEET) */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="liquid-glass w-full max-w-2xl rounded-t-3xl sm:rounded-2xl border-t sm:border border-white/20 p-5 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto mobile-bottom-sheet">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Create New Sports Organization</h2>
                <p className="text-xs text-slate-400">Establish a federation and manage multiple sports simultaneously.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Organization Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Karnataka Grassroots Athletics Federation"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Lead Organizer Name <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCreatorName}
                    onChange={(e) => setNewCreatorName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Organizer Phone <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCreatorPhone}
                    onChange={(e) => setNewCreatorPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">City</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">State</label>
                  <input
                    type="text"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Multi-Sport Checklist */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Conducted Sports (Select all that apply) <span className="text-cyan-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ALL_SPORTS.map((sport) => {
                    const isChecked = selectedSports.includes(sport.id);
                    return (
                      <button
                        type="button"
                        key={sport.id}
                        onClick={() => toggleSportSelection(sport.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all tactile-btn cursor-pointer ${
                          isChecked
                            ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {sport.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Logo upload (Cloudinary) */}
              <ImageUploader
                label="Organization Logo"
                currentUrl={newLogoUrl}
                folder="team-logos"
                onUploadSuccess={(url) => setNewLogoUrl(url)}
              />

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Tell athletes about your tournaments and mission..."
                  className="w-full p-2.5 rounded-xl glass-input text-white text-xs focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 text-xs font-bold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl liquid-btn-primary text-white font-bold text-xs tactile-btn cursor-pointer"
                >
                  Create & Launch Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: JOIN VIA SECRET CODE (MOBILE BOTTOM SHEET) */}
      {/* ========================================================================= */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="liquid-glass w-full max-w-md rounded-t-3xl sm:rounded-2xl border-t sm:border border-white/20 p-5 sm:p-8 space-y-5 mobile-bottom-sheet">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Join as Co-Organizer</h2>
              </div>
              <button
                onClick={() => { setShowJoinModal(false); setJoinStatus(null); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter the unique <strong>Organization Secret Code</strong> provided by your lead organizer. Each organization supports up to 4 co-organizers.
            </p>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Secret Code <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ORG-APEX"
                  value={joinSecretCode}
                  onChange={(e) => setJoinSecretCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl glass-input font-mono text-center tracking-widest text-lg font-black text-cyan-300 uppercase focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Custom Display Name in this Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Coach Arun (Match Scorer)"
                  value={joinDisplayName}
                  onChange={(e) => setJoinDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  This custom title will be visible on match scorecards and score sheets.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 98450 xxxxx"
                  value={joinPhone}
                  onChange={(e) => setJoinPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm focus:outline-hidden"
                />
              </div>

              {joinStatus && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  joinStatus.success
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                }`}>
                  {joinStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{joinStatus.message}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 text-xs font-bold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] tactile-btn cursor-pointer"
                >
                  Join Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
