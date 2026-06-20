// tests/property/badge-engine.prop.ts
// Property 5: Every badge receives exactly one valid rarity class
// Property 4: Badge progress is always clamped to [0, 100]
// Property 6: Badge_Engine evaluates all defined badges for any profile

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { BADGE_DEFINITIONS } from '@/lib/data/badge-definitions';
import { BadgeEngine } from '@/lib/engines/badge-engine';
import type { BadgeRarity, GitHubProfile } from '@/types';

const VALID_RARITIES: BadgeRarity[] = ['Common', 'Rare', 'Epic', 'Legendary', 'Secret'];

function createProfileWithMetrics(r: Record<string, number>): GitHubProfile {
  return {
    username: 'testuser',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.png',
    bio: '',
    createdAt: new Date('2020-01-01'),
    accountAgeYears: r.accountAgeYears,
    followers: r.followers,
    following: 0,
    publicRepos: r.publicRepos,
    totalCommits: r.totalCommits,
    totalPRs: r.totalPRs,
    totalIssues: r.totalIssues,
    totalDiscussions: r.totalDiscussions,
    totalGists: 0,
    totalPackages: 0,
    starsReceived: r.starsReceived,
    forksReceived: r.forksReceived,
    mergedExternalPRs: r.mergedExternalPRs,
    contributorsToRepos: r.contributorsToRepos,
    organizations: [],
    languages: [],
    recentEvents: [],
    fetchedAt: new Date(),
    repositories: [],
  };
}

describe('Badge Definitions — Property Tests', () => {
  const badgeEngine = new BadgeEngine();

  const metricsArb = fc.record({
    accountAgeYears: fc.nat({ max: 20 }),
    followers: fc.nat({ max: 100000 }),
    publicRepos: fc.nat({ max: 10000 }),
    totalCommits: fc.nat({ max: 100000 }),
    totalPRs: fc.nat({ max: 10000 }),
    totalIssues: fc.nat({ max: 10000 }),
    totalDiscussions: fc.nat({ max: 1000 }),
    starsReceived: fc.nat({ max: 100000 }),
    forksReceived: fc.nat({ max: 10000 }),
    mergedExternalPRs: fc.nat({ max: 10000 }),
    contributorsToRepos: fc.nat({ max: 10000 }),
  });

  it('Property 5: every badge has exactly one valid rarity', () => {
    BADGE_DEFINITIONS.forEach((def) => {
      expect(VALID_RARITIES).toContain(def.rarity);
    });
  });

  it('Property 4: badge progress is always clamped to [0, 100]', () => {
    fc.assert(
      fc.property(metricsArb, (r) => {
        const profile = createProfileWithMetrics(r);
        const evals = badgeEngine.evaluate(profile);
        evals.forEach((ev) => {
          expect(ev.progress).toBeGreaterThanOrEqual(0);
          expect(ev.progress).toBeLessThanOrEqual(100);
        });
      }),
      { numRuns: 200 }
    );
  });

  it('Property 6: Badge_Engine evaluates all defined badges for any profile', () => {
    fc.assert(
      fc.property(metricsArb, (r) => {
        const profile = createProfileWithMetrics(r);
        const evals = badgeEngine.evaluate(profile);
        expect(evals).toHaveLength(BADGE_DEFINITIONS.length);
        const evalIds = evals.map((ev) => ev.definition.id);
        BADGE_DEFINITIONS.forEach((def) => {
          expect(evalIds.filter((id) => id === def.id)).toHaveLength(1);
        });
      }),
      { numRuns: 200 }
    );
  });

  it('all 14 badge definitions are present', () => {
    expect(BADGE_DEFINITIONS).toHaveLength(14);
  });

  it('every badge has a unique id', () => {
    const ids = BADGE_DEFINITIONS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every tiered badge has ascending thresholds', () => {
    BADGE_DEFINITIONS.forEach((def) => {
      for (let i = 1; i < def.tiers.length; i++) {
        expect(def.tiers[i].threshold).toBeGreaterThan(def.tiers[i - 1].threshold);
      }
    });
  });

  it('every badge has at least one tier', () => {
    BADGE_DEFINITIONS.forEach((def) => {
      expect(def.tiers.length).toBeGreaterThanOrEqual(1);
    });
  });
});
