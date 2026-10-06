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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Organization Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
            Grassroots Sports Organizations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Discover community federations and multi-sport clubs. Each organization can conduct multiple sports simultaneously with up to 4 co-organizers.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition-all shadow-xs"
          >
            <KeyRound className="w-4 h-4 text-blue-600" />
            <span>Join via Secret Code</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Create Organization</span>
          </button>
        </div>
      </div>

      {/* Search & Sport Filters */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search organizations by name, city, state, or organizer..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sport Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedSportFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 shadow-xs ${
              selectedSportFilter === 'all'
                ? 'bg-blue-600 text-white shadow-blue-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-xs ${
                  isSelected
                    ? 'bg-blue-50 text-blue-800 border border-blue-300 ring-2 ring-blue-500/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{sport.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrgs.map((org) => {
          const membersCount = org.members.length;
          const isCapacityFull = membersCount >= org.maxOrganizers;

          return (
            <div
              key={org.id}
              className="scored-card p-6 flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-4">
                {/* Org Header */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 overflow-hidden flex items-center justify-center shrink-0">
                    {org.logoUrl ? (
                      <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-7 h-7 text-blue-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {org.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{org.city}, {org.state}</span>
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-2">
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
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  {/* Co-organizers capacity */}
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-600 font-medium">Team:</span>
                    <span className={`font-mono font-bold ${isCapacityFull ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {membersCount}/{org.maxOrganizers} Organizers
                    </span>
                  </div>

                  {/* Secret code tag */}
                  <button
                    onClick={() => handleCopyCode(org.secretCode, org.id)}
                    className="font-mono text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-600"
                  >
                    {copiedCodeId === org.id ? (
                      <span className="text-emerald-600 font-bold">Copied!</span>
                    ) : (
                      <span>{org.secretCode}</span>
                    )}
                  </button>
                </div>

                <Link
                  href={`/organizations/${org.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-800 font-bold text-xs border border-slate-200 hover:border-blue-600 transition-all shadow-2xs group/btn"
                >
                  <span>Explore Sports & Matches</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}

        {filteredOrgs.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Organizations Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No registered organizations matched your search filter. Create the first organization or clear your filter.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE ORGANIZATION (LIGHT THEME) */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Create New Sports Organization</h2>
                <p className="text-xs text-slate-500">Establish a federation and manage multiple sports simultaneously.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Organization Name <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Karnataka Grassroots Athletics Federation"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Lead Organizer Name <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCreatorName}
                    onChange={(e) => setNewCreatorName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Organizer Phone <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCreatorPhone}
                    onChange={(e) => setNewCreatorPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Multi-Sport Checklist */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Conducted Sports (Select all that apply) <span className="text-blue-600">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ALL_SPORTS.map((sport) => {
                    const isChecked = selectedSports.includes(sport.id);
                    return (
                      <button
                        type="button"
                        key={sport.id}
                        onClick={() => toggleSportSelection(sport.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                          isChecked
                            ? 'bg-blue-50 border-blue-400 text-blue-800 ring-2 ring-blue-500/20'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
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
                label="Organization Logo (Cloudinary)"
                currentUrl={newLogoUrl}
                folder="team-logos"
                onUploadSuccess={(url) => setNewLogoUrl(url)}
              />

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Tell athletes about your tournaments and mission..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  Create & Launch Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: JOIN VIA SECRET CODE */}
      {/* ========================================================================= */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">Join as Co-Organizer</h2>
              </div>
              <button
                onClick={() => { setShowJoinModal(false); setJoinStatus(null); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Enter the unique <strong>Organization Secret Code</strong> provided by your lead organizer. Each organization supports up to 4 co-organizers.
            </p>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Secret Code <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ORG-APEX"
                  value={joinSecretCode}
                  onChange={(e) => setJoinSecretCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-blue-700 font-mono text-center tracking-widest text-lg font-black focus:border-blue-500 focus:bg-white focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Custom Display Name in this Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Coach Arun (Match Scorer)"
                  value={joinDisplayName}
                  onChange={(e) => setJoinDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  This custom title will be visible on match scorecards and score sheets.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 98450 xxxxx"
                  value={joinPhone}
                  onChange={(e) => setJoinPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              {joinStatus && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  joinStatus.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                  {joinStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{joinStatus.message}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
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
