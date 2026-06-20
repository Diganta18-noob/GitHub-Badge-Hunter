// lib/store/compare-store.ts

import { create } from 'zustand';
import type { GitHubProfile, BadgeEvaluation } from '@/types';

interface CompareState {
  profileA: GitHubProfile | null;
  profileB: GitHubProfile | null;
  evaluationsA: BadgeEvaluation[];
  evaluationsB: BadgeEvaluation[];
  setProfileA: (p: GitHubProfile | null) => void;
  setProfileB: (p: GitHubProfile | null) => void;
  setEvaluationsA: (e: BadgeEvaluation[]) => void;
  setEvaluationsB: (e: BadgeEvaluation[]) => void;
  reset: () => void;
}

export const useCompareStore = create<CompareState>()((set) => ({
  profileA: null,
  profileB: null,
  evaluationsA: [],
  evaluationsB: [],
  setProfileA: (profileA) => set({ profileA }),
  setProfileB: (profileB) => set({ profileB }),
  setEvaluationsA: (evaluationsA) => set({ evaluationsA }),
  setEvaluationsB: (evaluationsB) => set({ evaluationsB }),
  reset: () => set({ profileA: null, profileB: null, evaluationsA: [], evaluationsB: [] }),
}));
