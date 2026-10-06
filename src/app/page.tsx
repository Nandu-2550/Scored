'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { useOrganizations, useUserProfile, calculateAge } from '@/lib/user-org-store';
import { SportType } from '@/types/sports';
import { UserRole } from '@/types/user-org';
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
  ShieldCheck,
  ArrowRight,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeftRight,
  Table2,
  Check,
  Layers,
  Sparkles,
  Trophy,
  Flame,
  Calendar,
  User,
  Compass,
  Activity,
  LogOut,
  RefreshCw,
  Phone,
  Mail,
  ChevronRight,
  Lock
} from 'lucide-react';

export default function HomeDashboard() {
  const { organizations, createOrganization, joinOrganizationWithCode } = useOrganizations();
  const { profile, toggleRole, setRole, loginUser, loginWithCredentials, registerUser, logoutUser, isLoaded } = useUserProfile();

  // Auth / Registration Portal State
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [regFullName, setRegFullName] = useState('');
  const [regDob, setRegDob] = useState('2002-05-18');
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Male');
  const [regCountry, setRegCountry] = useState('India');
  const [regState, setRegState] = useState('Karnataka');
  const [regCity, setRegCity] = useState('Bengaluru');
  const [regPhone, setRegPhone] = useState('+91 ');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Sign In Form State (Phone or Email + Password)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Search & Filters for Viewer / Organizer Hubs
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState<string>('all');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Create Org Form State
  const [newOrgName, setNewOrgName] = useState('');
  const [newCreatorName, setNewCreatorName] = useState(profile.fullName || 'Rajesh Kumar');
  const [newCreatorPhone, setNewCreatorPhone] = useState(profile.phone || '+91 ');
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

  // Calculate live age for registration form
  const calculatedLiveAge = calculateAge(regDob);

  // Extract unique cities
  const uniqueCities = Array.from(new Set(organizations.map(o => o.city).filter(Boolean)));

  // Filter organizations
  const filteredOrgs = organizations.filter(org => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      org.name.toLowerCase().includes(q) ||
      org.city.toLowerCase().includes(q) ||
      org.state.toLowerCase().includes(q) ||
      org.creatorName.toLowerCase().includes(q) ||
      org.sports.some(s => s.toLowerCase().includes(q) || SPORTS_REGISTRY[s]?.name.toLowerCase().includes(q))
    );

    const matchesSport = selectedSportFilter === 'all'
      ? true
      : org.sports.includes(selectedSportFilter as SportType);

    const matchesCity = selectedCityFilter === 'all'
      ? true
      : org.city.toLowerCase() === selectedCityFilter.toLowerCase();

    return matchesSearch && matchesSport && matchesCity;
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
    setNewOrgDisplayName('');
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinSecretCode.trim() || !joinDisplayName.trim()) {
      setJoinStatus({ success: false, message: 'Please provide both the secret code and your display name.' });
      return;
    }

    const result = joinOrganizationWithCode(joinSecretCode.trim(), joinDisplayName.trim(), joinPhone.trim());
    setJoinStatus(result);

    if (result.success) {
      setTimeout(() => {
        setShowJoinModal(false);
        setJoinSecretCode('');
        setJoinDisplayName('');
        setJoinPhone('');
        setJoinStatus(null);
      }, 1500);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!regFullName.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }
    if (!regPhone.trim() && !regEmail.trim()) {
      setAuthError('Please enter either a phone number or an email address.');
      return;
    }
    if (!regPassword.trim() || regPassword.length < 4) {
      setAuthError('Please set a password of at least 4 characters.');
      return;
    }

    registerUser({
      fullName: regFullName.trim(),
      dob: regDob,
      gender: regGender,
      country: regCountry,
      state: regState,
      city: regCity,
      phone: regPhone.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: 'viewer'
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!loginIdentifier.trim()) {
      setAuthError('Please enter your registered phone number or email address.');
      return;
    }
    if (!loginPassword) {
      setAuthError('Please enter your account password.');
      return;
    }

    const res = loginWithCredentials(loginIdentifier.trim(), loginPassword);
    if (!res.success) {
      setAuthError(res.message || 'Login failed. Please check your credentials.');
    }
  };

  // -------------------------------------------------------------------------
  // STEP 1: INITIAL ENTRY POINT — LOGIN / REGISTRATION PORTAL
  // -------------------------------------------------------------------------
  if (isLoaded && !profile.isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-3.5 sm:px-4 py-4 sm:py-16">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10 space-y-3 sm:space-y-4">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/25 blur-2xl rounded-full scale-125 pointer-events-none" />
              <img
                src="/scored-logo.png"
                alt="SCORED Logo"
                className="h-24 sm:h-36 w-auto object-contain drop-shadow-[0_0_35px_rgba(6,182,212,0.6)] animate-fade-in relative z-10"
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-pulse" />
            <span>Grassroots Multi-Sport Platform</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Welcome to <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]">SCORED</span>
          </h1>
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed px-1">
            The next-generation tournament engine for grassroots sports. Register your profile to discover organizations, manage sports, and track live scorecards.
          </p>
        </div>

        {/* Glassmorphic Portal Card */}
        <div className="liquid-glass p-4 sm:p-10 max-w-2xl mx-auto border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative overflow-hidden rounded-2xl sm:rounded-3xl">
          {/* Subtle Ambient Refractive Highlights */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-purple-500/15 blur-2xl pointer-events-none" />

          {authMode === 'register' ? (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 sm:space-y-5 relative z-10">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-1">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>Registration</span>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400">Create your account to access tournaments, organizations, and match scorecards.</p>
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Nandeesh Gavayi"
                  className="w-full px-3.5 py-2.5 sm:py-2.5 rounded-xl glass-input text-base sm:text-sm font-medium text-white placeholder:text-slate-500 focus:outline-hidden"
                />
              </div>

              {/* Date of Birth & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Date of Birth *
                    </label>
                    <span className="text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                      Age: {calculatedLiveAge} Yrs
                    </span>
                  </div>
                  <input
                    type="date"
                    required
                    value={regDob}
                    onChange={(e) => setRegDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-base sm:text-sm text-white focus:outline-hidden [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Gender *
                  </label>
                  <select
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-base sm:text-sm font-medium text-white focus:outline-hidden [&>option]:bg-[#080d22] [&>option]:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={regCountry}
                    onChange={(e) => setRegCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-base sm:text-sm font-medium text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-base sm:text-sm font-medium text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-base sm:text-sm font-medium text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Contact Info (Used for Login) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    placeholder="+91 81237 97004"
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-base sm:text-sm font-medium text-white placeholder:text-slate-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="player@scored.in"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-base sm:text-sm font-medium text-white placeholder:text-slate-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Set Account Password */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    Set Account Password *
                  </span>
                  <span className="text-[10px] font-normal text-slate-400">Min. 4 characters</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    minLength={4}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Choose a password to secure account"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl glass-input text-base sm:text-sm font-medium text-white placeholder:text-slate-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1.5"
                    title={showRegPassword ? "Hide password" : "Show password"}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Player ID Assignment Note */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-2.5 text-xs text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-[11px] sm:text-xs leading-relaxed">
                  A unique, permanent <strong className="text-white">Player ID</strong> will be automatically generated upon completing registration and visible in your <strong className="text-white">Profile</strong>.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl liquid-btn-primary font-bold text-sm sm:text-base tactile-btn flex items-center justify-center gap-2 mt-4 cursor-pointer min-h-[48px]"
              >
                <span>Complete Registration & Enter</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-white/10 text-center">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(null); }}
                  className="text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors py-1 inline-block"
                >
                  Already have an account? <span className="text-cyan-400 underline underline-offset-4">Sign In</span>
                </button>
              </div>
            </form>
          ) : (
            /* Sign In with Phone or Email + Password */
            <div className="space-y-5 sm:space-y-6 relative z-10">
              <div className="space-y-1 pb-3 border-b border-white/10">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>Sign In to Scored</span>
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">Log in using your registered phone number or email address.</p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    Phone Number or Email Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. +91 8123797004 or player@scored.in"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-base sm:text-sm font-medium text-white placeholder:text-slate-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl glass-input text-base sm:text-sm font-medium text-white placeholder:text-slate-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1.5"
                      title={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl liquid-btn-primary font-bold text-sm sm:text-base tactile-btn flex items-center justify-center gap-2 cursor-pointer mt-4 min-h-[48px]"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-3 border-t border-white/10 text-center">
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(null); }}
                  className="text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors py-1 inline-block"
                >
                  ← Don't have an account? <span className="text-cyan-400 underline underline-offset-4">Register Now</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // STEP 2: POST-REGISTRATION WELCOME HUB
  // -------------------------------------------------------------------------
  const isOrganizer = profile.role === 'organizer';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 animate-fade-in">
      {/* Website Logo, Description, and Introduction Banner */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-cyan-500/25 blur-xl rounded-2xl scale-110 pointer-events-none" />
                <img
                  src="/scored-logo.png"
                  alt="SCORED Logo"
                  className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] relative z-10"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                    SCORED<span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">.</span>
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    Grassroots Ecosystem
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Multi-Sport Grassroots Tournament & Organization Platform
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed pt-1">
              Empowering local grassroots clubs, academies, organizers, and athletes across Cricket, Kabaddi, Kho-Kho, Volleyball, Throwball, Badminton, Table Tennis, and Athletics. Seamlessly host multiple sports, invite co-organizers via secret codes, and broadcast live scorecards to spectators.
            </p>
          </div>

          {/* Current Logged-in Profile Badge */}
          <div className="glass-panel p-4 rounded-xl border border-white/10 bg-slate-900/60 shadow-lg flex items-center justify-between md:flex-col md:items-start gap-3 min-w-[220px]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-xs shadow-[0_0_10px_rgba(6,182,212,0.25)]">
                {profile.fullName ? profile.fullName.charAt(0) : 'U'}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{profile.fullName}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-mono text-cyan-400 font-bold">{profile.playerId}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOrganizer
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                    : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40'
                    }`}>
                    {isOrganizer ? 'Organizer' : 'Spectator (Default)'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between w-full text-[11px] text-slate-400 pt-1.5 border-t border-white/10">
              <Link href="/profile" className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1">
                <span>Shift Mode in Profile</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <button
                onClick={logoutUser}
                title="Sign Out"
                className="text-slate-400 hover:text-rose-400 transition-colors p-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OPTION 1: ORGANIZER DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {isOrganizer && (
        <section className="space-y-6 pt-2">
          {/* Organizer Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 border border-white/10">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>Organizer Management Hub</span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage your grassroots organizations, invite up to 4 co-organizers with secret codes, and configure multi-sport tournaments.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setShowJoinModal(true)}
                className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold transition-all shadow-xs tactile-btn flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Join with Secret Code</span>
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full min-h-[46px] px-4 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-bold transition-all tactile-btn flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span>+ Create Organization</span>
              </button>
            </div>
          </div>

          {/* My Organizations Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Active Organizations Under Management</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {organizations.map((org) => {
                const isMemberCapped = org.members.length >= (org.maxOrganizers || 4);
                return (
                  <div key={org.id} className="glass-panel p-5 rounded-2xl flex flex-col justify-between glass-panel-hover border border-white/10">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {org.logoUrl ? (
                            <img
                              src={org.logoUrl}
                              alt={org.name}
                              loading="lazy"
                              decoding="async"
                              className="w-12 h-12 rounded-xl object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-cyan-950/60 text-cyan-300 flex items-center justify-center font-bold text-lg border border-cyan-500/30">
                              {org.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h4 className="font-extrabold text-white text-sm line-clamp-1">{org.name}</h4>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span>{org.city}, {org.state}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Secret Code Card */}
                      <div className="p-2.5 rounded-xl bg-[#080d22]/90 border border-white/10 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Secret Invite Code</div>
                          <div className="font-mono text-xs font-black text-cyan-400">{org.secretCode}</div>
                        </div>
                        <button
                          onClick={() => handleCopyCode(org.secretCode, org.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/10 text-slate-200 border border-white/15 hover:bg-white/15 shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedCodeId === org.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <KeyRound className="w-3 h-3 text-slate-400" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Co-Organizers Capacity Tracker */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          Co-Organizers Roster:
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold ${isMemberCapped ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                          }`}>
                          {org.members.length} / {org.maxOrganizers || 4} Slots
                        </span>
                      </div>

                      {/* Hosted Sports */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                          Hosted Sports ({org.sports.length})
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {org.sports.map(s => (
                            <SportBadge key={s} sport={s} size="sm" />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                      <Link
                        href={`/organizations/${org.id}`}
                        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
                      >
                        <span>Manage Org & Sports</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/organizations/${org.id}`}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/60"
                      >
                        + Host Sport
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simultaneous Multi-Sport Engine Console */}
          <div className="glass-panel p-6 rounded-2xl space-y-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Grassroots Multi-Sport Simultaneous Hosting Engine</span>
                </h3>
                <p className="text-xs text-slate-400">
                  A single organization can host and score all 8 sports concurrently with native rule engines.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                8 Sports Supported
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ALL_SPORTS.map(sport => {
                const hostingCount = organizations.filter(o => o.sports.includes(sport.id)).length;
                return (
                  <div key={sport.id} className="p-3.5 rounded-xl border border-white/10 bg-white/5 text-left space-y-2">
                    <SportBadge sport={sport.id} size="sm" />
                    <div className="text-[11px] text-slate-400">
                      Active in <strong className="text-white">{hostingCount}</strong> organization{hostingCount !== 1 ? 's' : ''}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{sport.tagline}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* OPTION 2: VIEWER (SPECTATOR) HUB VIEW */}
      {/* ========================================================================= */}
      {!isOrganizer && (
        <section className="space-y-8 pt-2">
          {/* Dedicated Universal Real-Time Search Bar */}
          <div className="glass-panel p-5 rounded-2xl space-y-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-400" />
                  <span>Viewer Discovery & Search Hub</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Filter grassroots organizations, sports, and tournament fixtures across India in real-time.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Found <span className="text-white">{filteredOrgs.length}</span> Organization{filteredOrgs.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Keyword Search */}
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search organization, sport (e.g. Cricket, Kabaddi), city, or director..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder:text-slate-500 focus:outline-hidden"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sport Selector */}
              <div className="sm:col-span-3">
                <select
                  value={selectedSportFilter}
                  onChange={(e) => setSelectedSportFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-medium text-white focus:outline-hidden [&>option]:bg-[#080d22] [&>option]:text-white"
                >
                  <option value="all">All Sports ({ALL_SPORTS.length})</option>
                  {ALL_SPORTS.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* City Selector */}
              <div className="sm:col-span-3">
                <select
                  value={selectedCityFilter}
                  onChange={(e) => setSelectedCityFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-medium text-white focus:outline-hidden [&>option]:bg-[#080d22] [&>option]:text-white"
                >
                  <option value="all">All Cities</option>
                  {uniqueCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Comprehensive Sports List with Hosting Organizations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-cyan-400" />
                  <span>Comprehensive Sports Catalog & Hosting Organizations</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select any sport to view the grassroots organizations currently organizing and hosting events for it.
                </p>
              </div>
            </div>

            {/* Mobile-Friendly Quick Sport Filter Pill Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 touch-scroll">
              <button
                onClick={() => setSelectedSportFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all tactile-btn shrink-0 ${
                  selectedSportFilter === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                All Sports ({ALL_SPORTS.length})
              </button>
              {ALL_SPORTS.map(s => {
                const isSel = selectedSportFilter === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSportFilter(isSel ? 'all' : s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all tactile-btn flex items-center gap-1.5 shrink-0 ${
                      isSel
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span>{s.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Horizontal Snap Carousel / Desktop Grid */}
            <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 touch-scroll">
              {ALL_SPORTS.map(sport => {
                const hostingOrgs = organizations.filter(o => o.sports.includes(sport.id));
                const isSelected = selectedSportFilter === sport.id;

                return (
                  <div
                    key={sport.id}
                    onClick={() => setSelectedSportFilter(isSelected ? 'all' : sport.id)}
                    className={`cursor-pointer glass-panel p-4 rounded-xl border transition-all glass-panel-hover flex flex-col justify-between w-[80vw] max-w-[280px] shrink-0 snap-center sm:w-auto ${isSelected
                      ? 'border-cyan-400/80 bg-cyan-950/40 ring-1 ring-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <SportBadge sport={sport.id} size="sm" />
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                          {hostingOrgs.length} Org{hostingOrgs.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1 mb-2.5">
                        {sport.tagline}
                      </div>

                      {/* List of Hosting Organizations */}
                      <div className="space-y-1 pt-1 border-t border-white/10">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Hosting Organizations:</div>
                        {hostingOrgs.length > 0 ? (
                          <div className="space-y-1">
                            {hostingOrgs.map(ho => (
                              <Link
                                key={ho.id}
                                href={`/organizations/${ho.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="block text-xs font-semibold text-slate-300 hover:text-cyan-400 truncate"
                              >
                                • {ho.name}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs italic text-slate-500">None currently hosting</div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 text-[11px] font-bold text-cyan-400 flex items-center justify-between">
                      <span>{isSelected ? 'Showing matches below' : 'Filter by this sport'}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complete Organization List & Directory */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span>Grassroots Organization Directory</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Browse verified sports academies, clubs, and federations with multi-sport programs.
                </p>
              </div>
            </div>

            {filteredOrgs.length === 0 ? (
              <div className="glass-panel p-8 text-center space-y-3 border border-white/10">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="font-bold text-white">No organizations match your search</h4>
                <p className="text-xs text-slate-400">
                  Try clearing the search query or resetting the sport and city filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSportFilter('all');
                    setSelectedCityFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl liquid-btn-primary text-white text-xs font-bold cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredOrgs.map((org) => {
                  return (
                    <div
                      key={org.id}
                      className="glass-panel p-5 rounded-2xl flex flex-col justify-between glass-panel-hover border border-white/10"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-start gap-3">
                          {org.logoUrl ? (
                            <img
                              src={org.logoUrl}
                              alt={org.name}
                              loading="lazy"
                              decoding="async"
                              className="w-12 h-12 rounded-xl object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-cyan-950/60 text-cyan-300 flex items-center justify-center font-bold text-lg border border-cyan-500/30">
                              {org.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-white text-sm line-clamp-1">{org.name}</h4>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span>{org.city}, {org.state}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Lead: <span className="font-medium text-slate-200">{org.creatorName}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {org.description}
                        </p>

                        {/* Co-Organizers count */}
                        <div className="flex items-center justify-between text-xs py-1 border-y border-white/10">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            Co-Organizers
                          </span>
                          <span className="font-mono text-[11px] font-bold text-slate-300">
                            {org.members.length} / {org.maxOrganizers || 4} Members
                          </span>
                        </div>

                        {/* Sports Hosted */}
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold uppercase text-slate-400">
                            Active Sports ({org.sports.length})
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {org.sports.map(s => (
                              <SportBadge key={s} sport={s} size="sm" />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                        <Link
                          href={`/organizations/${org.id}`}
                          className="w-full py-2.5 px-3 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                        >
                          <span>Explore Organization & Tournaments</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE ORGANIZATION (MOBILE BOTTOM SHEET) */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="liquid-glass max-w-lg w-full p-5 sm:p-8 rounded-t-3xl sm:rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto border-t sm:border border-white/20 mobile-bottom-sheet">
            {/* Mobile Sheet Drag Indicator */}
            <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mb-4 sm:hidden" />

            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Create Sports Organization</h3>
                <p className="text-xs text-slate-400">Setup your club, academy, or grassroots tournament hub</p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Bangalore Grassroots Sports Club"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder:text-slate-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Lead Organizer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCreatorName}
                    onChange={(e) => setNewCreatorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Organizer Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newCreatorPhone}
                    onChange={(e) => setNewCreatorPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Custom Org Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={newOrgDisplayName}
                  onChange={(e) => setNewOrgDisplayName(e.target.value)}
                  placeholder="e.g. Coach Rajesh (Lead Director)"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder:text-slate-500 focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Custom title for you within this specific organization.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Sports to Host (Select Multiple)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-white/10 rounded-xl bg-slate-900/60">
                  {ALL_SPORTS.map((sport) => {
                    const isSelected = selectedSports.includes(sport.id);
                    return (
                      <button
                        type="button"
                        key={sport.id}
                        onClick={() => toggleSportSelection(sport.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left flex items-center justify-between border transition-all cursor-pointer ${isSelected
                          ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                      >
                        <span>{sport.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Grassroots sports hub dedicated to youth tournaments..."
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder:text-slate-500 focus:outline-hidden"
                />
              </div>

              {/* Cloudinary Logo Uploader */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Organization Logo
                </label>
                <ImageUploader
                  label="Upload Organization Logo"
                  folder="team-logos"
                  onUploadSuccess={(url: string) => setNewLogoUrl(url)}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 text-xs font-bold hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-bold tactile-btn cursor-pointer"
                >
                  Create & Generate Secret Code
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
          <div className="liquid-glass max-w-md w-full p-5 sm:p-8 rounded-t-3xl sm:rounded-2xl shadow-2xl relative border-t sm:border border-white/20 mobile-bottom-sheet">
            {/* Mobile Sheet Drag Indicator */}
            <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mb-4 sm:hidden" />

            <button
              onClick={() => {
                setShowJoinModal(false);
                setJoinStatus(null);
              }}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Join as Co-Organizer</h3>
                <p className="text-xs text-slate-400">Up to 4 co-organizers per organization</p>
              </div>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Secret Code *
                </label>
                <input
                  type="text"
                  required
                  value={joinSecretCode}
                  onChange={(e) => setJoinSecretCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ORG-APEX or ORG-YOUTH"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input font-mono text-sm font-bold uppercase text-cyan-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Your Custom Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={joinDisplayName}
                  onChange={(e) => setJoinDisplayName(e.target.value)}
                  placeholder="e.g. Coach Ananya (Tournament Director)"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder:text-slate-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={joinPhone}
                  onChange={(e) => setJoinPhone(e.target.value)}
                  placeholder="+91 98450 67890"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder:text-slate-500 focus:outline-hidden"
                />
              </div>

              {joinStatus && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${joinStatus.success
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-rose-950/60 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                  }`}>
                  {joinStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{joinStatus.message}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinStatus(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 text-xs font-bold hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] tactile-btn cursor-pointer"
                >
                  Verify & Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
