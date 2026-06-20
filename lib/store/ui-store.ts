// lib/store/ui-store.ts

import { create } from 'zustand';
import type { LeaderboardTab } from '@/types';

interface UIState {
  activeTab: LeaderboardTab;
  compareUsernameB: string;
  shareModalOpen: boolean;
  rpgModeEnabled: boolean;
  setActiveTab: (t: LeaderboardTab) => void;
  setCompareUsernameB: (u: string) => void;
  setShareModalOpen: (v: boolean) => void;
  toggleRPGMode: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  activeTab: 'mostBadges',
  compareUsernameB: '',
  shareModalOpen: false,
  rpgModeEnabled: false,
  setActiveTab: (activeTab) => set({ activeTab }),
  setCompareUsernameB: (compareUsernameB) => set({ compareUsernameB }),
  setShareModalOpen: (shareModalOpen) => set({ shareModalOpen }),
  toggleRPGMode: () => set((s) => ({ rpgModeEnabled: !s.rpgModeEnabled })),
}));
