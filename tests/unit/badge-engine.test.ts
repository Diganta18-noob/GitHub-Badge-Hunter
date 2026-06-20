// tests/unit/badge-engine.test.ts

import { describe, it, expect } from 'vitest';
import { BadgeEngine } from '@/lib/engines/badge-engine';
import { BADGE_DEFINITIONS } from '@/lib/data/badge-definitions';
import type { GitHubProfile } from '@/types';

function createProfile(overrides: Partial<GitHubProfile> = {}): GitHubProfile {
  return {
    username: 'testuser',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.png',
    bio: '',
    createdAt: new Date('2020-01-01'),
    accountAgeYears: 4,
    followers: 0,
    following: 0,
    publicRepos: 0,
    totalCommits: 0,
    totalPRs: 0,
    totalIssues: 0,
    totalDiscussions: 0,
    totalGists: 0,
    totalPackages: 0,
    starsReceived: 0,
    forksReceived: 0,
    mergedExternalPRs: 0,
    contributorsToRepos: 0,
    organizations: [],
    languages: [],
    recentEvents: [],
    fetchedAt: new Date(),
    repositories: [],
    ...overrides,
  };
}

describe('BadgeEngine — Unit Tests', () => {
  const engine = new BadgeEngine();

  it('all-zero profile → all badges Locked, all progress 0 (or 100 for special badges)', () => {
    const profile = createProfile({
      accountAgeYears: 0,
      followers: 0,
    });
    const results = engine.evaluate(profile);

    expect(results).toHaveLength(BADGE_DEFINITIONS.length);

    results.forEach((evaluation) => {
      expect(evaluation.currentValue).toBe(0);
      expect(evaluation.status).toBe('Locked');
      expect(evaluation.progress).toBe(0);
    });
  });

  it('profile exceeding all thresholds → tiered badges Unlocked, progress 100', () => {
    const profile = createProfile({
      totalPRs: 1000,
      totalCommits: 1000,
      totalDiscussions: 100,
      starsReceived: 1000,
      mergedExternalPRs: 100,
      followers: 100,
      publicRepos: 100,
      accountAgeYears: 20,
    });
    const results = engine.evaluate(profile);

    // All should be unlocked for such a high-value profile
    results.forEach((evaluation) => {
      expect(evaluation.progress).toBe(100);
      expect(evaluation.status).toBe('Unlocked');
    });
  });

  it('single badge at exact Bronze threshold → Unlocked with correct tier', () => {
    // Pull Shark Bronze threshold is 2
    const profile = createProfile({ totalPRs: 2 });
    const results = engine.evaluate(profile);

    const pullShark = results.find((e) => e.definition.id === 'pull-shark');
    expect(pullShark).toBeDefined();
    expect(pullShark!.currentTier).toBe('Bronze');
    expect(pullShark!.nextTier).toBe('Silver');
    expect(pullShark!.status).toBe('InProgress'); // Still has Silver/Gold to go
  });

  it('evaluates exactly BADGE_DEFINITIONS.length badges', () => {
    const profile = createProfile();
    const results = engine.evaluate(profile);
    expect(results).toHaveLength(BADGE_DEFINITIONS.length);
  });

  it('each badge ID appears exactly once', () => {
    const profile = createProfile();
    const results = engine.evaluate(profile);
    const ids = results.map((e) => e.definition.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('checklist completion reflects actual checklist evaluations', () => {
    const profile = createProfile({ accountAgeYears: 0, followers: 0 });
    const results = engine.evaluate(profile);
    results.forEach((evaluation) => {
      if (evaluation.checklistItems.length > 0) {
        const metCount = evaluation.checklistItems.filter((c) => c.met).length;
        const expected = Math.round((metCount / evaluation.checklistItems.length) * 100);
        expect(evaluation.checklistCompletion).toBe(expected);
      }
    });
  });
});
