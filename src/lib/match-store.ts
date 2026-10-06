'use client';

import { useState, useEffect, useCallback } from 'react';
import { Match } from '@/types/sports';
import { INITIAL_MATCHES } from './initial-data';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY = 'scored_matches_v1';
const BROADCAST_CHANNEL_NAME = 'scored_live_sync';

// Local memory cache
let cachedMatches: Match[] | null = null;
let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
}

export function getStoredMatches(): Match[] {
  if (typeof window === 'undefined') {
    return INITIAL_MATCHES;
  }

  if (cachedMatches) {
    return cachedMatches;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cachedMatches = JSON.parse(raw);
      return cachedMatches || INITIAL_MATCHES;
    }
  } catch (err) {
    console.warn('Failed to parse matches from localStorage:', err);
  }

  // Seed default matches if empty
  cachedMatches = INITIAL_MATCHES;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MATCHES));
  } catch (e) {
    // ignore
  }
  return cachedMatches;
}

export function saveMatches(matches: Match[]) {
  cachedMatches = matches;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    // Broadcast to other open tabs (Spectator view, other screens)
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'MATCHES_UPDATED', matches });
    }
  }
}

export function saveSingleMatch(match: Match) {
  const current = getStoredMatches();
  const existingIdx = current.findIndex(m => m.id === match.id);
  let updatedList: Match[];

  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = match;
  } else {
    updatedList = [match, ...current];
  }

  saveMatches(updatedList);

  // If Supabase configured, sync asynchronously
  if (isSupabaseConfigured && supabase) {
    supabase
      .from('matches')
      .upsert({
        id: match.id,
        sport: match.sport,
        title: match.title,
        status: match.status,
        score_state: match.scoreState,
        updated_at: new Date().toISOString()
      })
      .then(({ error }) => {
        if (error) console.error('Supabase match sync error:', error);
      });
  }
}

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Hydration-safe client initialization from localStorage
    const stored = getStoredMatches();
    setMatches(stored);
    setIsLoaded(true);

    // Listen to local BroadcastChannel for instant multi-tab sync
    if (!broadcastChannel && typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    }

    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'MATCHES_UPDATED' && event.data.matches) {
        setMatches(event.data.matches);
        cachedMatches = event.data.matches;
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setMatches(parsed);
          cachedMatches = parsed;
        } catch (err) {
          // ignore
        }
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcast);
    }
    window.addEventListener('storage', handleStorage);

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      }
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return { matches, saveSingleMatch, isLoaded };
}

export function useMatch(matchId: string) {
  const [match, setMatch] = useState<Match | null>(() => {
    return INITIAL_MATCHES.find(m => m.id === matchId) || null;
  });

  const updateMatch = useCallback((updated: Match) => {
    setMatch(updated);
    saveSingleMatch(updated);
  }, []);

  useEffect(() => {
    // Hydration-safe initial fetch from local storage
    const list = getStoredMatches();
    const found = list.find(m => m.id === matchId);
    if (found) setMatch(found);

    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'MATCHES_UPDATED' && event.data.matches) {
        const target = (event.data.matches as Match[]).find(m => m.id === matchId);
        if (target) {
          setMatch(target);
        }
      }
    };

    // Supabase Realtime WebSocket subscription for cross-device live sync
    let supabaseChannel: any = null;
    if (isSupabaseConfigured && supabase) {
      supabaseChannel = supabase
        .channel(`match_channel_${matchId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'matches',
            filter: `id=eq.${matchId}`
          },
          (payload) => {
            if (payload.new) {
              setMatch(prev => {
                if (!prev) return prev;
                return {
                  ...prev,
                  status: payload.new.status || prev.status,
                  scoreState: payload.new.score_state || prev.scoreState,
                  updatedAt: payload.new.updated_at || prev.updatedAt
                };
              });
            }
          }
        )
        .subscribe();
    }

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcast);
    }

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      }
      if (supabase && supabaseChannel) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  }, [matchId]);

  return { match, updateMatch };
}

