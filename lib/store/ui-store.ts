// lib/store/ui-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LeaderboardTab } from '@/types';

interface UIState {
  activeTab: LeaderboardTab;
  compareUsernameB: string;
  shareModalOpen: boolean;
  rpgModeEnabled: boolean;
  darkModeEnabled: boolean;
  setActiveTab: (t: LeaderboardTab) => void;
  setCompareUsernameB: (u: string) => void;
  setShareModalOpen: (v: boolean) => void;
  toggleRPGMode: () => void;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeTab: 'mostBadges',
      compareUsernameB: '',
      shareModalOpen: false,
      rpgModeEnabled: false,
      darkModeEnabled: false,
      setActiveTab: (activeTab) => set({ activeTab }),
      setCompareUsernameB: (compareUsernameB) => set({ compareUsernameB }),
      setShareModalOpen: (shareModalOpen) => set({ shareModalOpen }),
      toggleRPGMode: () => set((s) => ({ rpgModeEnabled: !s.rpgModeEnabled })),
      toggleDarkMode: () => set((s) => ({ darkModeEnabled: !s.darkModeEnabled })),
    }),
    {
      name: 'gbt_ui',
    }
  )
);
