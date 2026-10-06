'use client';

import React, { useState, useEffect } from 'react';
import { useUserProfile, calculateAge } from '@/lib/user-org-store';
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
  ArrowLeftRight,
  IdCard,
  Check,
  Building2,
  ArrowRight,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, updateProfile, setRole, isLoaded } = useUserProfile();

  const [fullName, setFullName] = useState(profile.fullName);
  const [playerId, setPlayerId] = useState(profile.playerId);
  const [dob, setDob] = useState(profile.dob);
  const [gender, setGender] = useState(profile.gender);
  const [country, setCountry] = useState(profile.country);
  const [state, setState] = useState(profile.state);
  const [city, setCity] = useState(profile.city);
  const [phone, setPhone] = useState(profile.phone || '');
  const [email, setEmail] = useState(profile.email || '');
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
      setPhone(profile.phone || '');
      setEmail(profile.email || '');
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
      phone,
      email,
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

  const handleShiftMode = (targetRole: 'viewer' | 'organizer') => {
    setRole(targetRole);
    router.push('/');
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

        {/* Shift Perspective Button */}
        <button
          type="button"
          onClick={() => handleShiftMode(isOrganizer ? 'viewer' : 'organizer')}
          title={isOrganizer ? 'Shift to Viewer Mode and open Viewer Hub' : 'Shift to Organizer Mode and open Organizer Hub'}
          className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all shadow-xs group hover:scale-[1.01] active:scale-[0.99] ${
            isOrganizer
              ? 'bg-blue-50/90 border-blue-200 text-blue-900 hover:bg-blue-100 hover:border-blue-300'
              : 'bg-amber-50/90 border-amber-300 text-amber-900 hover:bg-amber-100 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isOrganizer ? 'bg-blue-200/60 text-blue-800' : 'bg-amber-200/60 text-amber-800'
            }`}>
              {isOrganizer ? (
                <Eye className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              )}
            </div>
            <div className="text-left">
              <span className={`text-[10px] uppercase font-extrabold block leading-none ${
                isOrganizer ? 'text-blue-700' : 'text-amber-700'
              }`}>
                Current: {isOrganizer ? 'Organizer Mode' : 'Viewer Mode (Default)'}
              </span>
              <span className="text-xs font-black text-slate-900 flex items-center gap-1 mt-0.5">
                {isOrganizer ? 'Shift to Viewer Mode' : 'Shift to Organizer Mode'}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
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

            {/* Unique Player ID Badge with 1-Click Copy (Permanent & Immutable) */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Unique Player ID
                </span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Permanent
                </span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
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

          {/* Perspective & Role Shift Card */}
          <div className={`glass-panel p-6 rounded-3xl shadow-lg space-y-4 border ${
            isOrganizer 
              ? 'border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white' 
              : 'border-blue-200/80 bg-gradient-to-b from-blue-50/50 to-white'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                Mode & Perspective Control
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                isOrganizer ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}>
                {isOrganizer ? 'Organizer Active' : 'Viewer Mode (Default)'}
              </span>
            </div>

            {isOrganizer ? (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Organizer Mode Active</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    You currently have access to create and manage organizations, configure sports, and operate official live scoring consoles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleShiftMode('viewer')}
                  className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Eye className="w-4 h-4 stroke-[2.5]" />
                  <span>Shift to Viewer Mode & Open Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Viewer Mode (Default)</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    You are exploring as a fan, attendee, and athlete. Shift to Organizer Mode whenever you want to host events, manage sports clubs, or score matches.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleShiftMode('organizer')}
                  className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>Shift to Organizer Mode & Open Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
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

              {/* Contact Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number (Login ID)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address (Login ID)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="player@scored.in"
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
