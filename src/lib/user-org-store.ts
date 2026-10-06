'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfile, Organization, OrganizationMember, UserRole } from '@/types/user-org';
import { SportType } from '@/types/sports';
import { supabase, isSupabaseConfigured } from './supabase';

const PROFILE_STORAGE_KEY = 'scored_user_profile_v2';
const USERS_DB_STORAGE_KEY = 'scored_registered_accounts_v1';
const ORGS_STORAGE_KEY = 'scored_organizations_v2';
const ORG_BROADCAST_CHANNEL_NAME = 'scored_org_sync';

export function getRegisteredUsers(): UserProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_DB_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRegisteredUser(user: UserProfile) {
  if (typeof window === 'undefined') return;
  try {
    const current = getRegisteredUsers();
    const cleanEmail = user.email?.toLowerCase().trim();
    const cleanPhone = user.phone?.replace(/\s+/g, '');
    const existingIdx = current.findIndex(u => 
      (cleanEmail && u.email && u.email.toLowerCase().trim() === cleanEmail) ||
      (cleanPhone && u.phone && u.phone.replace(/\s+/g, '') === cleanPhone) ||
      (user.playerId && u.playerId && u.playerId === user.playerId)
    );
    if (existingIdx >= 0) {
      current[existingIdx] = user;
    } else {
      current.push(user);
    }
    localStorage.setItem(USERS_DB_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  broadcastChannel = new BroadcastChannel(ORG_BROADCAST_CHANNEL_NAME);
}

// ------------------------------------------------------------------
// HELPER UTILITIES
// ------------------------------------------------------------------

export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export function generatePlayerId(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `SCR-${randomNum}`;
}

export function generateSecretCode(prefix = 'ORG'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
}

// ------------------------------------------------------------------
// SEED DATA
// ------------------------------------------------------------------

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'usr-default-001',
  playerId: 'SCR-77491',
  fullName: 'Rajesh Kumar',
  dob: '2002-04-15',
  age: calculateAge('2002-04-15'),
  gender: 'Male',
  country: 'India',
  state: 'Karnataka',
  city: 'Bengaluru',
  phone: '+91 98450 12345',
  email: 'rajesh.kumar@scored.in',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'viewer', // Default mode: 'viewer' (spectator)
  activeOrgId: 'org-apex-01',
  isLoggedIn: false, // Default to false so new visitors encounter Step 1: Login / Register
  updatedAt: new Date().toISOString()
};

export const DEMO_PROFILES: { [key in 'organizer' | 'viewer']: UserProfile } = {
  organizer: {
    id: 'usr-default-001',
    playerId: 'SCR-77491',
    fullName: 'Rajesh Kumar',
    dob: '2002-04-15',
    age: calculateAge('2002-04-15'),
    gender: 'Male',
    country: 'India',
    state: 'Karnataka',
    city: 'Bengaluru',
    phone: '+91 98450 12345',
    email: 'rajesh.kumar@scored.in',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'organizer',
    activeOrgId: 'org-apex-01',
    isLoggedIn: true,
    updatedAt: new Date().toISOString()
  },
  viewer: {
    id: 'usr-viewer-99',
    playerId: 'SCR-20481',
    fullName: 'Pooja Hegde',
    dob: '2004-08-20',
    age: calculateAge('2004-08-20'),
    gender: 'Female',
    country: 'India',
    state: 'Karnataka',
    city: 'Bengaluru',
    phone: '+91 98860 99881',
    email: 'pooja.hegde@grassroots-fan.in',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'viewer',
    isLoggedIn: true,
    updatedAt: new Date().toISOString()
  }
};

export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-apex-01',
    name: 'Apex Grassroots Sports Academy',
    slug: 'apex-sports-academy',
    creatorName: 'Rajesh Kumar',
    creatorPhone: '+91 98450 12345',
    secretCode: 'ORG-APEX',
    logoUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=150&auto=format&fit=crop&q=80',
    description: 'Premier sports academy hosting grassroots tournaments across South Bengaluru courts and fields.',
    country: 'India',
    state: 'Karnataka',
    city: 'Bengaluru',
    maxOrganizers: 4,
    members: [
      {
        id: 'mem-1',
        organizationId: 'org-apex-01',
        userId: 'usr-default-001',
        orgDisplayName: 'Coach Rajesh (Apex Lead)',
        role: 'lead_organizer',
        phone: '+91 98450 12345',
        joinedAt: '2026-01-10T10:00:00Z'
      },
      {
        id: 'mem-2',
        organizationId: 'org-apex-01',
        userId: 'usr-002',
        orgDisplayName: 'Ananya Sharma (Match Scorer)',
        role: 'co_organizer',
        phone: '+91 98450 67890',
        joinedAt: '2026-01-15T12:00:00Z'
      }
    ],
    sports: ['cricket', 'kabaddi', 'volleyball', 'badminton'],
    tournamentsCount: 4,
    matchesCount: 12,
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'org-youth-02',
    name: 'National Youth Athletics & Kho-Kho Federation',
    slug: 'youth-athletics-kho-kho',
    creatorName: 'Vikram Deshmukh',
    creatorPhone: '+91 97654 32109',
    secretCode: 'ORG-YOUTH',
    logoUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=150&auto=format&fit=crop&q=80',
    description: 'Fostering track athletics, sprint heats, and traditional rural Kho-Kho championships.',
    country: 'India',
    state: 'Maharashtra',
    city: 'Pune',
    maxOrganizers: 4,
    members: [
      {
        id: 'mem-3',
        organizationId: 'org-youth-02',
        userId: 'usr-003',
        orgDisplayName: 'Vikram Deshmukh (Chief Referee)',
        role: 'lead_organizer',
        phone: '+91 97654 32109',
        joinedAt: '2026-01-12T09:00:00Z'
      },
      {
        id: 'mem-4',
        organizationId: 'org-youth-02',
        userId: 'usr-004',
        orgDisplayName: 'Siddharth Patil (Track Marshal)',
        role: 'co_organizer',
        phone: '+91 97654 11223',
        joinedAt: '2026-01-20T14:30:00Z'
      },
      {
        id: 'mem-5',
        organizationId: 'org-youth-02',
        userId: 'usr-005',
        orgDisplayName: 'Sneha More (Kho-Kho Coordinator)',
        role: 'co_organizer',
        phone: '+91 97654 44556',
        joinedAt: '2026-02-01T16:00:00Z'
      }
    ],
    sports: ['athletics', 'kho-kho', 'throwball'],
    tournamentsCount: 3,
    matchesCount: 8,
    createdAt: '2026-01-12T09:00:00Z'
  },
  {
    id: 'org-coast-03',
    name: 'Coastal Arena Sports Club',
    slug: 'coastal-arena-sports',
    creatorName: 'Kiran Shetty',
    creatorPhone: '+91 98801 23456',
    secretCode: 'ORG-COAST',
    logoUrl: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=150&auto=format&fit=crop&q=80',
    description: 'Coastal Karnataka league managing intense beach volleyball, throwball rallies, and Kabaddi leagues.',
    country: 'India',
    state: 'Karnataka',
    city: 'Mangaluru',
    maxOrganizers: 4,
    members: [
      {
        id: 'mem-6',
        organizationId: 'org-coast-03',
        userId: 'usr-006',
        orgDisplayName: 'Kiran Shetty (Tournament Director)',
        role: 'lead_organizer',
        phone: '+91 98801 23456',
        joinedAt: '2026-02-05T11:00:00Z'
      }
    ],
    sports: ['volleyball', 'throwball', 'table-tennis', 'kabaddi'],
    tournamentsCount: 2,
    matchesCount: 6,
    createdAt: '2026-02-05T11:00:00Z'
  }
];

// ------------------------------------------------------------------
// USER PROFILE HOOK (Hydration Safe)
// ------------------------------------------------------------------

export function useUserProfile() {
  const [profile, setProfileState] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Recalculate age dynamically in case birthday passed
        parsed.age = calculateAge(parsed.dob);
        setProfileState(parsed);
      } else {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(INITIAL_USER_PROFILE));
      }
    } catch (e) {
      // ignore
    }
    setIsLoaded(true);

    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'PROFILE_UPDATED' && event.data.profile) {
        setProfileState(event.data.profile);
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcast);
    }

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      }
    };
  }, []);

  const updateProfile = useCallback((updated: Partial<UserProfile>) => {
    setProfileState(prev => {
      const next: UserProfile = {
        ...prev,
        ...updated,
        playerId: prev.playerId, // Unique Player ID is permanent and cannot be changed
        age: updated.dob ? calculateAge(updated.dob) : prev.age,
        updatedAt: new Date().toISOString()
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
          if (broadcastChannel) {
            broadcastChannel.postMessage({ type: 'PROFILE_UPDATED', profile: next });
          }
        } catch (e) {
          // ignore
        }
      }

      // Supabase async sync if configured
      if (isSupabaseConfigured && supabase) {
        supabase.from('profiles').upsert({
          id: next.id,
          player_id: next.playerId,
          full_name: next.fullName,
          dob: next.dob,
          gender: next.gender,
          country: next.country,
          state: next.state,
          city: next.city,
          avatar_url: next.avatarUrl,
          role: next.role,
          updated_at: next.updatedAt
        }).then(({ error }) => {
          if (error) console.warn('Supabase profile sync note:', error.message);
        });
      }

      return next;
    });
  }, []);

  const setRole = useCallback((role: UserRole) => {
    setProfileState(prev => {
      const next: UserProfile = { ...prev, role, updatedAt: new Date().toISOString() };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
          if (broadcastChannel) {
            broadcastChannel.postMessage({ type: 'PROFILE_UPDATED', profile: next });
          }
        } catch (e) {
          // ignore
        }
      }
      return next;
    });
  }, []);

  const toggleRole = useCallback(() => {
    setProfileState(prev => {
      const newRole: UserRole = prev.role === 'organizer' ? 'viewer' : 'organizer';
      const next: UserProfile = { ...prev, role: newRole, updatedAt: new Date().toISOString() };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
          if (broadcastChannel) {
            broadcastChannel.postMessage({ type: 'PROFILE_UPDATED', profile: next });
          }
        } catch (e) {
          // ignore
        }
      }
      return next;
    });
  }, []);

  const loginUser = useCallback((customProfile?: Partial<UserProfile>) => {
    setProfileState(prev => {
      const target = customProfile || DEMO_PROFILES.organizer;
      const next: UserProfile = {
        ...prev,
        ...target,
        isLoggedIn: true,
        age: target.dob ? calculateAge(target.dob) : prev.age,
        updatedAt: new Date().toISOString()
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
          if (broadcastChannel) {
            broadcastChannel.postMessage({ type: 'PROFILE_UPDATED', profile: next });
          }
        } catch (e) {
          // ignore
        }
      }
      return next;
    });
  }, []);

  const registerUser = useCallback((formData: {
    fullName: string;
    dob: string;
    gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
    country: string;
    state: string;
    city: string;
    phone?: string;
    email?: string;
    password?: string;
    role?: UserRole;
  }) => {
    const age = calculateAge(formData.dob);
    // Unique player ID is automatically generated upon registration - never exposed in registration form
    const playerId = generatePlayerId();
    const next: UserProfile = {
      id: `usr-${Date.now()}`,
      playerId,
      fullName: formData.fullName,
      dob: formData.dob,
      age,
      gender: formData.gender,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      phone: formData.phone || '',
      email: formData.email || '',
      password: formData.password || '',
      role: formData.role || 'viewer', // default to viewer
      isLoggedIn: true,
      updatedAt: new Date().toISOString()
    };

    saveRegisteredUser(next);
    setProfileState(next);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'PROFILE_UPDATED', profile: next });
        }
      } catch (e) {
        // ignore
      }
    }

    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').upsert({
        id: next.id,
        player_id: next.playerId,
        full_name: next.fullName,
        dob: next.dob,
        gender: next.gender,
        country: next.country,
        state: next.state,
        city: next.city,
        phone_number: next.phone,
        role: next.role,
        updated_at: next.updatedAt
      }).then(({ error }) => {
        if (error) console.warn('Supabase register sync note:', error.message);
      });
    }

    return next;
  }, []);

  const loginWithCredentials = useCallback((identifier: string, password: string): { success: boolean; message?: string } => {
    const rawId = identifier.trim();
    if (!rawId) {
      return { success: false, message: 'Please enter your phone number or email address.' };
    }
    if (!password) {
      return { success: false, message: 'Please enter your password.' };
    }

    const cleanId = rawId.toLowerCase();
    const cleanPhone = rawId.replace(/[\s\-\(\)\+]/g, '');

    const users = getRegisteredUsers();
    // Search registered users
    let found = users.find(u => {
      const uEmail = u.email?.trim().toLowerCase();
      const uPhone = u.phone?.replace(/[\s\-\(\)\+]/g, '');
      const uPlayerId = u.playerId?.trim().toLowerCase();
      return (
        (uEmail && uEmail === cleanId) ||
        (uPhone && (uPhone === cleanPhone || (cleanPhone.length >= 8 && uPhone.includes(cleanPhone)) || (uPhone.length >= 8 && cleanPhone.includes(uPhone)))) ||
        (uPlayerId && uPlayerId === cleanId)
      );
    });

    // Fallback: check currently saved profile or initial/demo profiles
    if (!found) {
      const candidates = [profile, INITIAL_USER_PROFILE, DEMO_PROFILES.organizer, DEMO_PROFILES.viewer];
      for (const cand of candidates) {
        if (!cand) continue;
        const uEmail = cand.email?.trim().toLowerCase();
        const uPhone = cand.phone?.replace(/[\s\-\(\)\+]/g, '');
        const uPlayerId = cand.playerId?.trim().toLowerCase();
        if (
          (uEmail && uEmail === cleanId) ||
          (uPhone && (uPhone === cleanPhone || (cleanPhone.length >= 8 && uPhone.includes(cleanPhone)))) ||
          (uPlayerId && uPlayerId === cleanId)
        ) {
          found = cand;
          break;
        }
      }
    }

    if (!found) {
      return { 
        success: false, 
        message: 'No account found matching this phone number or email address. Please register a new account.' 
      };
    }

    // If account has a password set, verify it
    if (found.password && found.password !== password) {
      return { 
        success: false, 
        message: 'Incorrect password. Please verify and try again.' 
      };
    }

    const next: UserProfile = {
      ...found,
      isLoggedIn: true,
      updatedAt: new Date().toISOString()
    };

    saveRegisteredUser(next);
    setProfileState(next);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'PROFILE_UPDATED', profile: next });
        }
      } catch (e) {
        // ignore
      }
    }

    return { success: true };
  }, [profile]);

  const logoutUser = useCallback(() => {
    setProfileState(prev => {
      const next: UserProfile = {
        ...prev,
        isLoggedIn: false,
        updatedAt: new Date().toISOString()
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
          if (broadcastChannel) {
            broadcastChannel.postMessage({ type: 'PROFILE_UPDATED', profile: next });
          }
        } catch (e) {
          // ignore
        }
      }
      return next;
    });
  }, []);

  return { 
    profile, 
    updateProfile, 
    toggleRole, 
    setRole, 
    loginUser, 
    loginWithCredentials,
    registerUser, 
    logoutUser, 
    isLoaded 
  };
}

// ------------------------------------------------------------------
// ORGANIZATIONS HOOK (Hydration Safe)
// ------------------------------------------------------------------

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ORGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setOrganizations(parsed);
      } else {
        localStorage.setItem(ORGS_STORAGE_KEY, JSON.stringify(INITIAL_ORGANIZATIONS));
      }
    } catch (e) {
      // ignore
    }
    setIsLoaded(true);

    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'ORGS_UPDATED' && event.data.organizations) {
        setOrganizations(event.data.organizations);
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcast);
    }

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      }
    };
  }, []);

  const saveOrgsList = (newList: Organization[]) => {
    setOrganizations(newList);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ORGS_STORAGE_KEY, JSON.stringify(newList));
        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'ORGS_UPDATED', organizations: newList });
        }
      } catch (e) {
        // ignore
      }
    }
  };

  const createOrganization = useCallback((data: {
    name: string;
    creatorName: string;
    creatorPhone: string;
    sports: SportType[];
    description?: string;
    city?: string;
    state?: string;
    logoUrl?: string;
    orgDisplayName?: string;
  }): Organization => {
    const orgId = `org-${Date.now()}`;
    const secretCode = generateSecretCode();

    const leadMember: OrganizationMember = {
      id: `mem-${Date.now()}-lead`,
      organizationId: orgId,
      userId: 'usr-default-001',
      orgDisplayName: data.orgDisplayName || `${data.creatorName} (Lead Organizer)`,
      role: 'lead_organizer',
      phone: data.creatorPhone,
      joinedAt: new Date().toISOString()
    };

    const newOrg: Organization = {
      id: orgId,
      name: data.name.trim(),
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      creatorName: data.creatorName.trim(),
      creatorPhone: data.creatorPhone.trim(),
      secretCode,
      logoUrl: data.logoUrl,
      description: data.description || 'Community sports organization managing grassroots leagues.',
      country: 'India',
      state: data.state || 'Karnataka',
      city: data.city || 'Bengaluru',
      maxOrganizers: 4,
      members: [leadMember],
      sports: data.sports.length > 0 ? data.sports : ['cricket'],
      tournamentsCount: 0,
      matchesCount: 0,
      createdAt: new Date().toISOString()
    };

    saveOrgsList([newOrg, ...organizations]);

    // Async Supabase sync
    if (isSupabaseConfigured && supabase) {
      supabase.from('organizations').insert({
        id: newOrg.id,
        name: newOrg.name,
        slug: newOrg.slug,
        creator_name: newOrg.creatorName,
        creator_phone: newOrg.creatorPhone,
        secret_code: newOrg.secretCode,
        logo_url: newOrg.logoUrl,
        description: newOrg.description,
        city: newOrg.city,
        state: newOrg.state
      }).then(({ error }) => {
        if (error) console.warn('Supabase org sync note:', error.message);
      });
    }

    return newOrg;
  }, [organizations]);

  const joinOrganizationWithCode = useCallback((
    secretCode: string,
    orgDisplayName: string,
    phone?: string,
    userId = 'usr-default-001'
  ): { success: boolean; message: string; org?: Organization } => {
    const cleanCode = secretCode.trim().toUpperCase();
    const targetOrgIndex = organizations.findIndex(
      o => o.secretCode.trim().toUpperCase() === cleanCode
    );

    if (targetOrgIndex < 0) {
      return { success: false, message: 'Invalid Organization Secret Code. Please verify with the organization lead.' };
    }

    const targetOrg = organizations[targetOrgIndex];

    // Check if user already in org
    const alreadyMember = targetOrg.members.some(m => m.userId === userId);
    if (alreadyMember) {
      return { success: false, message: 'You are already an active organizer in this organization!' };
    }

    // Check team capacity (strictly <= 4 organizers)
    if (targetOrg.members.length >= targetOrg.maxOrganizers) {
      return { 
        success: false, 
        message: `This organization has reached its full team capacity of ${targetOrg.maxOrganizers} organizers.` 
      };
    }

    const newMember: OrganizationMember = {
      id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      organizationId: targetOrg.id,
      userId,
      orgDisplayName: orgDisplayName.trim() || 'Co-Organizer',
      role: 'co_organizer',
      phone,
      joinedAt: new Date().toISOString()
    };

    const updatedOrg: Organization = {
      ...targetOrg,
      members: [...targetOrg.members, newMember]
    };

    const updatedList = [...organizations];
    updatedList[targetOrgIndex] = updatedOrg;
    saveOrgsList(updatedList);

    return { success: true, message: `Successfully joined ${targetOrg.name} as co-organizer!`, org: updatedOrg };
  }, [organizations]);

  const addSportToOrganization = useCallback((orgId: string, sport: SportType) => {
    const idx = organizations.findIndex(o => o.id === orgId);
    if (idx === -1) return;
    if (organizations[idx].sports.includes(sport)) return;
    const updatedOrg = {
      ...organizations[idx],
      sports: [...organizations[idx].sports, sport]
    };
    const updatedList = [...organizations];
    updatedList[idx] = updatedOrg;
    saveOrgsList(updatedList);

    if (isSupabaseConfigured && supabase) {
      supabase.from('organization_sports').insert({
        organization_id: orgId,
        sport: sport,
        is_active: true
      }).then(({ error }) => {
        if (error) console.warn('Supabase org_sport sync note:', error.message);
      });
    }
  }, [organizations]);

  const getOrganizationById = useCallback((id: string): Organization | undefined => {
    return organizations.find(o => o.id === id);
  }, [organizations]);

  return {
    organizations,
    createOrganization,
    joinOrganizationWithCode,
    addSportToOrganization,
    getOrganizationById,
    isLoaded
  };
}
