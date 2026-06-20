// tests/property/score-engine.prop.ts
// Property 9: Score Engine formulas are correct and clamped

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ScoreEngine } from '@/lib/engines/score-engine';
import type { GitHubProfile } from '@/types';

function createProfileFromRecord(r: Record<string, number>): GitHubProfile {
  return {
    username: 'testuser',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.png',
    bio: '',
    createdAt: new Date('2020-01-01'),
    accountAgeYears: 4,
    followers: r.followers,
    following: 0,
    publicRepos: 0,
    totalCommits: r.totalCommits,
    totalPRs: r.totalPRs,
    totalIssues: r.totalIssues,
    totalDiscussions: 0,
    totalGists: 0,
    totalPackages: 0,
    starsReceived: r.starsReceived,
    forksReceived: r.forksReceived,
    mergedExternalPRs: r.mergedExternalPRs,
    contributorsToRepos: r.contributorsToRepos,
    organizations: Array(r.orgsCount).fill({ login: 'org', avatar_url: '' }),
    languages: [],
    recentEvents: [],
    fetchedAt: new Date(),
    repositories: [],
  };
}

describe('ScoreEngine — Property Tests', () => {
  const engine = new ScoreEngine();

  it('Property 9: scores match formula and are clamped to [0, 10000]', () => {
    const metrics = fc.record({
      totalCommits: fc.nat({ max: 50_000 }),
      totalPRs: fc.nat({ max: 50_000 }),
      totalIssues: fc.nat({ max: 50_000 }),
      starsReceived: fc.nat({ max: 50_000 }),
      followers: fc.nat({ max: 50_000 }),
      orgsCount: fc.nat({ max: 100 }),
      mergedExternalPRs: fc.nat({ max: 50_000 }),
      forksReceived: fc.nat({ max: 50_000 }),
      contributorsToRepos: fc.nat({ max: 50_000 }),
    });

    fc.assert(
      fc.property(metrics, (r) => {
        const profile = createProfileFromRecord(r);
        const result = engine.compute(profile);

        // Verify clamping
        expect(result.githubScore).toBeGreaterThanOrEqual(0);
        expect(result.githubScore).toBeLessThanOrEqual(10_000);
        expect(result.openSourceScore).toBeGreaterThanOrEqual(0);
        expect(result.openSourceScore).toBeLessThanOrEqual(10_000);

        // Verify formula
        const expectedGH = Math.min(
          10_000,
          r.totalCommits * 1 +
            r.totalPRs * 3 +
            r.totalIssues * 2 +
            r.starsReceived * 2 +
            r.followers * 1 +
            r.orgsCount * 5,
        );
        expect(result.githubScore).toBe(expectedGH);

        const expectedOSS = Math.min(
          10_000,
          r.mergedExternalPRs * 5 +
            r.forksReceived * 3 +
            r.contributorsToRepos * 2,
        );
        expect(result.openSourceScore).toBe(expectedOSS);
      }),
      { numRuns: 300 },
    );
  });
});
