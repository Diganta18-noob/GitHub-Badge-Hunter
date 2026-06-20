// tests/unit/score-engine.test.ts

import { describe, it, expect } from 'vitest';
import { ScoreEngine } from '@/lib/engines/score-engine';
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

describe('ScoreEngine — Unit Tests', () => {
  const engine = new ScoreEngine();

  it('all-zero profile → both scores 0', () => {
    const profile = createProfile();
    const result = engine.compute(profile);
    expect(result.githubScore).toBe(0);
    expect(result.openSourceScore).toBe(0);
  });

  it('extreme values → both scores clamped at 10000', () => {
    const profile = createProfile({
      totalCommits: 100_000,
      totalPRs: 100_000,
      totalIssues: 100_000,
      starsReceived: 100_000,
      followers: 100_000,
      organizations: Array(1000).fill({ login: 'org', avatar_url: '' }),
      mergedExternalPRs: 100_000,
      forksReceived: 100_000,
      contributorsToRepos: 100_000,
    });
    const result = engine.compute(profile);
    expect(result.githubScore).toBe(10_000);
    expect(result.openSourceScore).toBe(10_000);
  });

  it('computes GitHub Score with correct formula', () => {
    const profile = createProfile({
      totalCommits: 100,    // × 1 = 100
      totalPRs: 50,         // × 3 = 150
      totalIssues: 30,      // × 2 = 60
      starsReceived: 20,    // × 2 = 40
      followers: 10,        // × 1 = 10
      organizations: [{ login: 'org1', avatar_url: '' }, { login: 'org2', avatar_url: '' }], // × 5 = 10
    });
    const result = engine.compute(profile);
    // 100 + 150 + 60 + 40 + 10 + 10 = 370
    expect(result.githubScore).toBe(370);
  });

  it('computes Open Source Score with correct formula', () => {
    const profile = createProfile({
      mergedExternalPRs: 10,   // × 5 = 50
      forksReceived: 20,        // × 3 = 60
      contributorsToRepos: 15,  // × 2 = 30
    });
    const result = engine.compute(profile);
    // 50 + 60 + 30 = 140
    expect(result.openSourceScore).toBe(140);
  });
});
