'use client';

import React, { useState, useEffect } from 'react';
import { useUserProfile, calculateAge, generatePlayerId } from '@/lib/user-org-store';
import { copyToClipboard } from '@/lib/clipboard';
import { ImageUploader } from '@/components/ImageUploader';
import { 
  User, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Eye, 
  CheckCircle2, 
  Copy, 
  RefreshCw, 
  ArrowLeftRight,
  IdCard,
  Check,
  Building2,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { profile, updateProfile, toggleRole, isLoaded } = useUserProfile();

  const [fullName, setFullName] = useState(profile.fullName);
  const [playerId, setPlayerId] = useState(profile.playerId);
  const [dob, setDob] = useState(profile.dob);
  const [gender, setGender] = useState(profile.gender);
  const [country, setCountry] = useState(profile.country);
  const [state, setState] = useState(profile.state);
  const [city, setCity] = useState(profile.city);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Sync state when loaded
  useEffect(() => {
    if (isLoaded) {
      setFullName(profile.fullName);
      setPlayerId(profile.playerId);
      setDob(profile.dob);
      setGender(profile.gender);
      setCountry(profile.country);
      setState(profile.state);
      setCity(profile.city);
      setAvatarUrl(profile.avatarUrl || '');
    }
  }, [isLoaded, profile]);

  const computedAge = calculateAge(dob);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      playerId,
      dob,
      gender,
      country,
      state,
      city,
      avatarUrl,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopyId = () => {
    copyToClipboard(playerId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleRegenerateId = () => {
    const newId = generatePlayerId();
    setPlayerId(newId);
  };

  const isOrganizer = profile.role === 'organizer';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            <IdCard className="w-3.5 h-3.5" />
            <span>Digital Athlete Profile</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 font-mono tracking-tight">
            Athlete & Organizer Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal sports identity, demographic credentials, and role permissions.
          </p>
        </div>

        {/* Fluid Role Toggle Button */}
        <button
          type="button"
          onClick={toggleRole}
          className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all shadow-xs ${
            isOrganizer
              ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
              : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
          }`}
        >
          <div className="flex items-center gap-2">
            {isOrganizer ? (
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            ) : (
              <Eye className="w-5 h-5 text-blue-600" />
            )}
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-500 block leading-none">
                Active Perspective
              </span>
              <span className="text-sm font-black capitalize">
                {profile.role} Mode
              </span>
            </div>
          </div>
          <ArrowLeftRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Athlete ID Card & Avatar */}
        <div className="space-y-6">
          {/* Digital Sports Card */}
          <div className="glass-panel p-6 rounded-3xl space-y-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                Scored Pass
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isOrganizer ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {profile.role.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-blue-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-slate-900 truncate">{fullName}</h3>
                <p className="text-xs text-slate-500">{city}, {state}</p>
              </div>
            </div>

            {/* Unique Player ID Badge with 1-Click Copy */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Unique Player ID
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-black text-blue-700 tracking-wider">
                  {playerId}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCopyId}
                    title="Copy Player ID"
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 shadow-2xs"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateId}
                    title="Generate New ID"
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 shadow-2xs"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-bold">Auto Age</span>
                <span className="text-base font-black text-slate-900 font-mono">{computedAge} yrs</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-bold">Gender</span>
                <span className="text-sm font-bold text-slate-900">{gender}</span>
              </div>
            </div>
          </div>

          {/* Cloudinary Media Upload Component */}
          <div className="glass-panel p-6 rounded-3xl shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Profile Photo</h3>
            <ImageUploader
              label="Athlete Avatar (Cloudinary)"
              currentUrl={avatarUrl}
              folder="player-profiles"
              onUploadSuccess={(url) => setAvatarUrl(url)}
            />
          </div>
        </div>

        {/* Right Column: Profile Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Demographic & Player Details</h2>
                <p className="text-xs text-slate-500">Auto-calculates tournament age eligibility from date of birth.</p>
              </div>
              {saveSuccess && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile Saved!</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Athlete Name <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Date of Birth <span className="text-blue-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Auto-Calculated Age
                  </label>
                  <div className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-mono text-sm font-bold flex items-center justify-between">
                    <span>{computedAge} Years Old</span>
                    <span className="text-[10px] text-blue-600 font-sans font-semibold uppercase">Auto System</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e: any) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
