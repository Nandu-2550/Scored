import { SportType } from './sports';

export type UserRole = 'viewer' | 'organizer';

export interface UserProfile {
  id: string;
  playerId: string; // e.g. 'SCR-77491'
  fullName: string;
  dob: string; // YYYY-MM-DD
  age: number; // Auto-calculated
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  country: string;
  state: string;
  city: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  role: UserRole; // Fluid toggle between 'viewer' and 'organizer'
  activeOrgId?: string;
  isLoggedIn: boolean; // Flag for login / registration state
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  orgDisplayName: string; // Custom display name separate from global profile name
  role: 'lead_organizer' | 'co_organizer';
  phone?: string;
  joinedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  creatorName: string;
  creatorPhone: string;
  secretCode: string; // Used by up to 4 co-organizers to join
  logoUrl?: string;
  description: string;
  country: string;
  state: string;
  city: string;
  maxOrganizers: number; // Always 4
  members: OrganizationMember[]; // Capped at 4
  sports: SportType[]; // Multiple sports conducted simultaneously
  tournamentsCount: number;
  matchesCount: number;
  createdAt: string;
}
