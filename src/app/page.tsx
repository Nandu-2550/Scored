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
  Zap,
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
  const [regPhone, setRegPhone] = useState('+91 98450 12345');
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
  const [newCreatorPhone, setNewCreatorPhone] = useState(profile.phone || '+91 98450 12345');
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
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-700 bg-blue-50/90 border border-blue-200/80 shadow-xs">
            <Flame className="w-4 h-4 text-blue-600" />
            <span>Grassroots Multi-Sport Platform</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Welcome to <span className="text-blue-600 font-mono">SCORED.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            The next-generation tournament engine for grassroots sports. Register your profile to discover organizations, manage sports, and track live scorecards.
          </p>
        </div>

        {/* Glassmorphic Portal Card */}
        <div className="glass-panel p-6 sm:p-10 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
          {authMode === 'register' ? (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Player Registration</h2>
                  <p className="text-xs text-slate-500">Create your account to access tournaments, organizations, and match scorecards.</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  New Player
                </span>
              </div>

              {authError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Athlete / User Name *
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Rohit Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm font-medium"
                />
              </div>

              {/* Date of Birth & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Date of Birth *
                    </label>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Age: {calculatedLiveAge} Yrs
                    </span>
                  </div>
                  <input
                    type="date"
                    required
                    value={regDob}
                    onChange={(e) => setRegDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Gender *
                  </label>
                  <select
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm font-medium"
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    value={regCountry}
                    onChange={(e) => setRegCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Contact Info (Used for Login) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="player@scored.in"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Set Account Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
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
                    placeholder="Choose a password to secure your account"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title={showRegPassword ? "Hide password" : "Show password"}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Player ID Assignment Note */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-800">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  A unique, permanent <strong>Player ID</strong> will be automatically generated upon completing registration and will be visible in your <strong>Profile</strong>.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all tactile-btn flex items-center justify-center gap-2 mt-4"
              >
                <span>Complete Registration & Enter Scored</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-slate-200/80 text-center">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(null); }}
                  className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Already have an account? <span className="text-blue-600 underline">Sign In with Phone or Email</span>
                </button>
              </div>
            </form>
          ) : (
            /* Sign In with Phone or Email + Password */
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Sign In to Scored</h2>
                <p className="text-xs text-slate-500">Log in using your registered phone number or email address.</p>
              </div>

              {authError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Phone Number or Email Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. +91 98450 12345 or player@scored.in"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm font-medium text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      title={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all tactile-btn flex items-center justify-center gap-2"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-4 border-t border-slate-200/80 text-center">
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(null); }}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  ← Don't have an account? Register Now
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
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Flame className="w-7 h-7 text-white stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                    SCORED<span className="text-blue-600">.</span>
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                    Grassroots Ecosystem
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Multi-Sport Grassroots Tournament & Organization Platform
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed pt-1">
              Empowering local grassroots clubs, academies, organizers, and athletes across Cricket, Kabaddi, Kho-Kho, Volleyball, Throwball, Badminton, Table Tennis, and Athletics. Seamlessly host multiple sports, invite co-organizers via secret codes, and broadcast live scorecards to spectators.
            </p>
          </div>

          {/* Current Logged-in Profile Badge */}
          <div className="glass-panel p-4 rounded-xl border border-white/80 bg-white/70 shadow-sm flex items-center justify-between md:flex-col md:items-start gap-3 min-w-[220px]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                {profile.fullName ? profile.fullName.charAt(0) : 'U'}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{profile.fullName}</div>
                <div className="text-[11px] font-mono text-blue-700 font-bold">{profile.playerId}</div>
              </div>
            </div>
            <div className="flex items-center justify-between w-full text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span>Age: <strong>{profile.age} yrs</strong></span>
              <span className="capitalize font-bold text-slate-700">{profile.city || 'India'}</span>
              <button
                onClick={logoutUser}
                title="Sign Out / Switch"
                className="text-slate-400 hover:text-red-600 transition-colors p-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TWO PRIMARY ROLE OPTIONS (Glassmorphic Selection Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Select Your Active Mode</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Currently active: <strong className="text-blue-700 uppercase font-mono">{profile.role}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Option 1: Organizer Mode Card */}
          <div
            onClick={() => setRole('organizer')}
            className={`cursor-pointer glass-panel p-6 rounded-2xl border transition-all glass-panel-hover relative overflow-hidden ${
              isOrganizer
                ? 'ring-2 ring-amber-500/30 border-amber-300 bg-amber-50/40 shadow-xl'
                : 'hover:border-amber-300 bg-white/70'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs uppercase font-extrabold tracking-wider text-amber-700">Option 1</div>
                  <h3 className="text-lg font-black text-slate-900">Organizer Hub</h3>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                isOrganizer ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
              }`}>
                {isOrganizer ? 'Active Mode' : 'Switch Mode'}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Create and manage sports organizations, invite up to 4 co-organizers via secure secret codes, host multiple sports simultaneously across 8 disciplines, and operate official match live scorecards.
            </p>

            <ul className="space-y-1.5 text-xs text-slate-600 mb-5">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Manage organizations & invite co-organizers (capped at 4)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Simultaneous 8-sport grassroots event hosting</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Official live scoring consoles for referees & scorers</span>
              </li>
            </ul>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setRole('organizer');
              }}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all tactile-btn ${
                isOrganizer
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20'
                  : 'bg-white border border-slate-200 text-slate-800 hover:bg-amber-50'
              }`}
            >
              <span>{isOrganizer ? 'Organizer Hub Active' : 'Enter Organizer Hub'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Option 2: Viewer Mode Card */}
          <div
            onClick={() => setRole('viewer')}
            className={`cursor-pointer glass-panel p-6 rounded-2xl border transition-all glass-panel-hover relative overflow-hidden ${
              !isOrganizer
                ? 'ring-2 ring-blue-500/30 border-blue-300 bg-blue-50/40 shadow-xl'
                : 'hover:border-blue-300 bg-white/70'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shadow-xs">
                  <Compass className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs uppercase font-extrabold tracking-wider text-blue-700">Option 2</div>
                  <h3 className="text-lg font-black text-slate-900">Viewer (Spectator) Hub</h3>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                !isOrganizer ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
              }`}>
                {!isOrganizer ? 'Active Mode' : 'Switch Mode'}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Browse the complete grassroots organization directory, view comprehensive sports lists showing which organizations host each sport, search everything in real-time, and drill down into match fixtures and live scorecards.
            </p>

            <ul className="space-y-1.5 text-xs text-slate-600 mb-5">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Complete Organization List & Directory</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Comprehensive Sports List with hosting organizations</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Dedicated real-time search & tournament fixture drill-downs</span>
              </li>
            </ul>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setRole('viewer');
              }}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all tactile-btn ${
                !isOrganizer
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white border border-slate-200 text-slate-800 hover:bg-blue-50'
              }`}
            >
              <span>{!isOrganizer ? 'Viewer Hub Active' : 'Enter Viewer Hub'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OPTION 1: ORGANIZER DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {isOrganizer && (
        <section className="space-y-6 pt-2">
          {/* Organizer Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>Organizer Management Hub</span>
              </h2>
              <p className="text-xs text-slate-500">
                Manage your grassroots organizations, invite up to 4 co-organizers with secret codes, and configure multi-sport tournaments.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white/90 hover:bg-white text-slate-700 text-xs font-bold transition-all shadow-xs tactile-btn flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Join with Secret Code</span>
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 tactile-btn flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>+ Create Organization</span>
              </button>

              <Link
                href="/matches/new"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs tactile-btn flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>+ Score Match</span>
              </Link>
            </div>
          </div>

          {/* My Organizations Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Active Organizations Under Management</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {organizations.map((org) => {
                const isMemberCapped = org.members.length >= (org.maxOrganizers || 4);
                return (
                  <div key={org.id} className="glass-panel p-5 rounded-2xl flex flex-col justify-between glass-panel-hover">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {org.logoUrl ? (
                            <img
                              src={org.logoUrl}
                              alt={org.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
                              {org.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm line-clamp-1">{org.name}</h4>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{org.city}, {org.state}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Secret Code Card */}
                      <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Secret Invite Code</div>
                          <div className="font-mono text-xs font-black text-blue-700">{org.secretCode}</div>
                        </div>
                        <button
                          onClick={() => handleCopyCode(org.secretCode, org.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-xs flex items-center gap-1"
                        >
                          {copiedCodeId === org.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copied</span>
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
                        <span className="text-slate-600 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Co-Organizers Roster:
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                          isMemberCapped ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/organizations/${org.id}`}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Manage Org & Sports</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/organizations/${org.id}`}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
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
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Grassroots Multi-Sport Simultaneous Hosting Engine</span>
                </h3>
                <p className="text-xs text-slate-500">
                  A single organization can host and score all 8 sports concurrently with native rule engines.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                8 Sports Supported
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ALL_SPORTS.map(sport => {
                const hostingCount = organizations.filter(o => o.sports.includes(sport.id)).length;
                return (
                  <div key={sport.id} className="p-3.5 rounded-xl border border-white/60 bg-white/60 text-left space-y-2">
                    <SportBadge sport={sport.id} size="sm" />
                    <div className="text-[11px] text-slate-500">
                      Active in <strong>{hostingCount}</strong> organization{hostingCount !== 1 ? 's' : ''}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{sport.tagline}</div>
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
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span>Viewer Discovery & Search Hub</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Filter grassroots organizations, sports, and tournament fixtures across India in real-time.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Found {filteredOrgs.length} Organization{filteredOrgs.length !== 1 ? 's' : ''}
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/90 focus:bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/90 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/90 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
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
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-blue-600" />
                  <span>Comprehensive Sports Catalog & Hosting Organizations</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select any sport to view the grassroots organizations currently organizing and hosting events for it.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ALL_SPORTS.map(sport => {
                const hostingOrgs = organizations.filter(o => o.sports.includes(sport.id));
                const isSelected = selectedSportFilter === sport.id;

                return (
                  <div
                    key={sport.id}
                    onClick={() => setSelectedSportFilter(isSelected ? 'all' : sport.id)}
                    className={`cursor-pointer glass-panel p-4 rounded-xl border transition-all glass-panel-hover flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20'
                        : 'border-white/60 bg-white/70 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <SportBadge sport={sport.id} size="sm" />
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {hostingOrgs.length} Org{hostingOrgs.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1 mb-2.5">
                        {sport.tagline}
                      </div>

                      {/* List of Hosting Organizations */}
                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Hosting Organizations:</div>
                        {hostingOrgs.length > 0 ? (
                          <div className="space-y-1">
                            {hostingOrgs.map(ho => (
                              <Link
                                key={ho.id}
                                href={`/organizations/${ho.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="block text-xs font-semibold text-slate-700 hover:text-blue-600 truncate"
                              >
                                • {ho.name}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs italic text-slate-400">None currently hosting</div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 text-[11px] font-bold text-blue-600 flex items-center justify-between">
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
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Grassroots Organization Directory</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Browse verified sports academies, clubs, and federations with multi-sport programs.
                </p>
              </div>
            </div>

            {filteredOrgs.length === 0 ? (
              <div className="glass-panel p-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="font-bold text-slate-900">No organizations match your search</h4>
                <p className="text-xs text-slate-500">
                  Try clearing the search query or resetting the sport and city filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSportFilter('all');
                    setSelectedCityFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
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
                      className="glass-panel p-5 rounded-2xl flex flex-col justify-between glass-panel-hover"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-start gap-3">
                          {org.logoUrl ? (
                            <img
                              src={org.logoUrl}
                              alt={org.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
                              {org.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-slate-900 text-sm line-clamp-1">{org.name}</h4>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{org.city}, {org.state}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Lead: <span className="font-medium text-slate-700">{org.creatorName}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {org.description}
                        </p>

                        {/* Co-Organizers count */}
                        <div className="flex items-center justify-between text-xs py-1 border-y border-slate-100">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            Co-Organizers
                          </span>
                          <span className="font-mono text-[11px] font-bold text-slate-700">
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

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <Link
                          href={`/organizations/${org.id}`}
                          className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
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

          {/* Quick Access to Points Tables & Fixtures */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Table2 className="w-4 h-4 text-blue-600" />
                <span>Tournament Points Tables & Standings</span>
              </h3>
              <p className="text-xs text-slate-500">
                View current league standings, Net Run Rate (NRR) in Cricket, score differentials in Kabaddi, and rally ratios in Volleyball.
              </p>
            </div>
            <Link
              href="/standings"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 tactile-btn flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>View Points Tables</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE ORGANIZATION */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="glass-panel max-w-lg w-full p-6 sm:p-8 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Create Sports Organization</h3>
                <p className="text-xs text-slate-500">Setup your club, academy, or grassroots tournament hub</p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Bangalore Grassroots Sports Club"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white/90 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lead Organizer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCreatorName}
                    onChange={(e) => setNewCreatorName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white/90 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Organizer Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newCreatorPhone}
                    onChange={(e) => setNewCreatorPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white/90 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Custom Org Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={newOrgDisplayName}
                  onChange={(e) => setNewOrgDisplayName(e.target.value)}
                  placeholder="e.g. Coach Rajesh (Lead Director)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white/90 text-sm"
                />
                <span className="text-[11px] text-slate-400">
                  Custom title for you within this specific organization.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white/90 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white/90 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Sports to Host (Select Multiple)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-white/70">
                  {ALL_SPORTS.map((sport) => {
                    const isSelected = selectedSports.includes(sport.id);
                    return (
                      <button
                        type="button"
                        key={sport.id}
                        onClick={() => toggleSportSelection(sport.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left flex items-center justify-between border transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-400 text-blue-800'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{sport.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Grassroots sports hub dedicated to youth tournaments..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white/90 text-sm"
                />
              </div>

              {/* Cloudinary Logo Uploader */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
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
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 tactile-btn"
                >
                  Create & Generate Secret Code
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => {
                setShowJoinModal(false);
                setJoinStatus(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Join as Co-Organizer</h3>
                <p className="text-xs text-slate-500">Up to 4 co-organizers per organization</p>
              </div>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Secret Code *
                </label>
                <input
                  type="text"
                  required
                  value={joinSecretCode}
                  onChange={(e) => setJoinSecretCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ORG-APEX or ORG-YOUTH"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white/90 font-mono text-sm font-bold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Custom Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={joinDisplayName}
                  onChange={(e) => setJoinDisplayName(e.target.value)}
                  placeholder="e.g. Coach Ananya (Tournament Director)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white/90 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={joinPhone}
                  onChange={(e) => setJoinPhone(e.target.value)}
                  placeholder="+91 98450 67890"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white/90 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {joinStatus && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  joinStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {joinStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
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
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/25 tactile-btn"
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
