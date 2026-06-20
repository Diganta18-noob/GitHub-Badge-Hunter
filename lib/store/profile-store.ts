// lib/store/profile-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GitHubProfile, BadgeEvaluation, ScoreResult, RoadmapResult } from '@/types';

interface ProfileState {
  profile: GitHubProfile | null;
  evaluations: BadgeEvaluation[];
  scores: ScoreResult | null;
  roadmap: RoadmapResult | null;
  loading: boolean;
  error: string | null;
  setProfile: (p: GitHubProfile) => void;
  setEvaluations: (e: BadgeEvaluation[]) => void;
  setScores: (s: ScoreResult) => void;
  setRoadmap: (r: RoadmapResult) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      evaluations: [],
      scores: null,
      roadmap: null,
      loading: false,
      error: null,
      setProfile: (profile) => set({ profile }),
      setEvaluations: (evaluations) => set({ evaluations }),
      setScores: (scores) => set({ scores }),
      setRoadmap: (roadmap) => set({ roadmap }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      reset: () => set({ profile: null, evaluations: [], scores: null, roadmap: null, loading: false, error: null }),
    }),
    {
      name: 'gbt_profile_cache',
      partialize: (s) => ({ profile: s.profile }),
    },
  ),
);
