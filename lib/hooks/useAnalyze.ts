// lib/hooks/useAnalyze.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { BadgeEngine } from '@/lib/engines/badge-engine';
import { ScoreEngine } from '@/lib/engines/score-engine';
import { RoadmapEngine } from '@/lib/engines/roadmap-engine';
import { useProfileStore } from '@/lib/store/profile-store';
import { useLeaderboardStore } from '@/lib/store/leaderboard-store';
import { parseInput, INPUT_ERRORS } from '@/lib/utils/input-parser';
import type { GitHubProfile } from '@/types';

// Module-level singleton: prevents duplicate in-flight requests for the same username
const inFlight = new Map<string, Promise<GitHubProfile>>();
const badgeEngine = new BadgeEngine();
const scoreEngine = new ScoreEngine();
const roadmapEngine = new RoadmapEngine();

/**
 * Fetch profile from the server-side API route.
 * The API route runs on the server where GITHUB_TOKEN is available,
 * giving us accurate data from the GitHub GraphQL API.
 */
export async function fetchProfile(username: string): Promise<GitHubProfile> {
  const existing = inFlight.get(username);
  if (existing) return existing;

  const promise = (async () => {
    const res = await fetch(`/api/analyze/${encodeURIComponent(username)}`);

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(body.error || `Failed to analyze profile (${res.status})`);
    }

    const data = await res.json();

    // Rehydrate Date fields from ISO strings
    const profile: GitHubProfile = {
      ...data,
      createdAt: new Date(data.createdAt),
      fetchedAt: new Date(data.fetchedAt),
    };

    return profile;
  })().finally(() => {
    inFlight.delete(username);
  });

  inFlight.set(username, promise);
  return promise;
}

export function useAnalyze(username: string | null) {
  const store = useProfileStore();
  const addLeaderboardEntry = useLeaderboardStore((s) => s.addEntry);

  return useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      if (!username) throw new Error('No username provided');

      store.setLoading(true);
      store.setError(null);

      const parsed = parseInput(username);
      if (parsed.error || !parsed.username) {
        throw new Error(INPUT_ERRORS[parsed.error || 'INVALID_FORMAT']);
      }

      try {
        const profile = await fetchProfile(parsed.username);
        if (!profile || !profile.username) {
          throw new Error('Could not retrieve valid profile data from GitHub');
        }

        // Run engine pipeline (pure calculations, safe on client)
        const evaluations = badgeEngine.evaluate(profile);
        const scores = scoreEngine.compute(profile);
        const roadmap = roadmapEngine.generate(evaluations, profile.recentEvents);

        // Dispatch to store
        store.setProfile(profile);
        store.setEvaluations(evaluations);
        store.setScores(scores);
        store.setRoadmap(roadmap);
        store.setLoading(false);

        // Auto-populate leaderboard with this profile
        const unlockedCount = evaluations.filter((e) => e.status === 'Unlocked').length;
        const recentWindow = new Date();
        recentWindow.setDate(recentWindow.getDate() - 30);
        const recentEvents = profile.recentEvents.filter(
          (e) => new Date(e.created_at) >= recentWindow,
        );

        addLeaderboardEntry({
          username: profile.username,
          avatarUrl: profile.avatarUrl,
          badgeCount: unlockedCount,
          badgesLast30Days: recentEvents.length > 0 ? Math.min(unlockedCount, 3) : 0,
          totalContributions: profile.totalCommits + profile.totalPRs + profile.totalIssues,
          totalPRs: profile.totalPRs,
          trend: recentEvents.length > 10 ? 'up' : recentEvents.length > 0 ? 'new' : 'down',
        });

        // Increment profiles-checked counter reactively in the store
        useLeaderboardStore.getState().incrementProfilesCheckedCount();

        return { profile, evaluations, scores, roadmap };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        store.setError(message);
        store.setLoading(false);
        throw err;
      }
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
