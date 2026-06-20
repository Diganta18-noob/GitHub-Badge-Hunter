// lib/store/leaderboard-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardState {
  entries: LeaderboardEntry[];
  profilesCheckedCount: number;
  addEntry: (entry: Omit<LeaderboardEntry, 'rank'>) => void;
  setProfilesCheckedCount: (count: number) => void;
  fetchProfilesCheckedCount: () => Promise<void>;
  incrementProfilesCheckedCount: () => Promise<void>;
  reset: () => void;
}

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set) => ({
      entries: [],
      profilesCheckedCount: 0,
      addEntry: (entry) =>
        set((s) => {
          // Upsert by username
          const filtered = s.entries.filter((e) => e.username !== entry.username);
          const updated = [...filtered, { ...entry, rank: 0 }];

          // Recompute ranks by badge count descending
          updated.sort((a, b) => b.badgeCount - a.badgeCount);
          updated.forEach((e, i) => {
            e.rank = i + 1;
          });

          return { entries: updated };
        }),
      setProfilesCheckedCount: (profilesCheckedCount) => set({ profilesCheckedCount }),
      fetchProfilesCheckedCount: async () => {
        try {
          const res = await fetch('https://api.counterapi.dev/v1/badge-hunter-2/profile_checks');
          if (res.ok) {
            const data = await res.json();
            if (data && typeof data.count === 'number') {
              set({ profilesCheckedCount: data.count });
            }
          } else if (res.status === 400 || res.status === 404) {
            // Initialize count by calling /up if not exists
            const upRes = await fetch('https://api.counterapi.dev/v1/badge-hunter-2/profile_checks/up');
            if (upRes.ok) {
              const data = await upRes.json();
              if (data && typeof data.count === 'number') {
                set({ profilesCheckedCount: data.count });
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch global counter:', err);
        }
      },
      incrementProfilesCheckedCount: async () => {
        try {
          const res = await fetch('https://api.counterapi.dev/v1/badge-hunter-2/profile_checks/up');
          if (res.ok) {
            const data = await res.json();
            if (data && typeof data.count === 'number') {
              set({ profilesCheckedCount: data.count });
            }
          }
        } catch (err) {
          console.error('Failed to increment global counter:', err);
          // Fallback to local increment
          set((s) => ({ profilesCheckedCount: s.profilesCheckedCount + 1 }));
        }
      },
      reset: () => set({ entries: [], profilesCheckedCount: 0 }),
    }),
    {
      name: 'gbt_leaderboard',
    },
  ),
);
