import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { BadgeEngine } from '@/lib/engines/badge-engine';
import { RoadmapEngine } from '@/lib/engines/roadmap-engine';
import type { GitHubProfile, GitHubEvent } from '@/types';

function createProfileWithMetrics(r: Record<string, number>, events: GitHubEvent[]): GitHubProfile {
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
    recentEvents: events,
    fetchedAt: new Date(),
    repositories: [],
  };
}

describe('RoadmapEngine — Property Tests', () => {
  const badgeEngine = new BadgeEngine();
  const roadmapEngine = new RoadmapEngine();

  const metricsArb = fc.record({
    accountAgeYears: fc.nat({ max: 20 }),
    followers: fc.nat({ max: 1000 }),
    publicRepos: fc.nat({ max: 500 }),
    totalCommits: fc.nat({ max: 1000 }),
    totalPRs: fc.nat({ max: 500 }),
    totalIssues: fc.nat({ max: 500 }),
    totalDiscussions: fc.nat({ max: 50 }),
    starsReceived: fc.nat({ max: 1000 }),
    forksReceived: fc.nat({ max: 500 }),
    mergedExternalPRs: fc.nat({ max: 500 }),
    contributorsToRepos: fc.nat({ max: 500 }),
  });

  it('Property 8, 10, 11, 12: roadmap invariants', () => {
    fc.assert(
      fc.property(metricsArb, (r) => {
        const events: GitHubEvent[] = []; // No events
        const profile = createProfileWithMetrics(r, events);
        const evals = badgeEngine.evaluate(profile);

        const lockedEvals = evals.filter((e) => e.status !== 'Unlocked');
        if (lockedEvals.length === 0) {
          // No locked badges, roadmap should be empty
          const result = roadmapEngine.generate(evals, events);
          expect(result.steps).toHaveLength(0);
          expect(result.nextBadge).toBeUndefined();
          return;
        }

        const result = roadmapEngine.generate(evals, events);

        // Property 8: Next badge has maximum progress among locked badges
        if (result.nextBadge) {
          const maxLockedProgress = Math.max(...lockedEvals.map((e) => e.progress));
          expect(result.nextBadge.progress).toBe(maxLockedProgress);
        }

        // Property 11: Roadmap step count never exceeds 10
        expect(result.steps.length).toBeLessThanOrEqual(10);

        // Property 10: Steps are sorted ascending by estimatedDays
        for (let i = 1; i < result.steps.length; i++) {
          expect(result.steps[i].estimatedDays).toBeGreaterThanOrEqual(
            result.steps[i - 1].estimatedDays
          );
        }

        // Property 12: Roadmap steps reference only top-3 locked badges
        const top3LockedIds = lockedEvals
          .sort((a, b) => b.progress - a.progress)
          .slice(0, 3)
          .map((e) => e.definition.id);

        result.steps.forEach((step) => {
          expect(top3LockedIds).toContain(step.targetBadgeId);
        });
      }),
      { numRuns: 200 }
    );
  });

  it('Property 19: activity rate estimation from 90-day window', () => {
    // Generate events with various timestamps
    const now = new Date();
    const eventArb = fc.array(
      fc.record({
        daysAgo: fc.nat({ max: 120 }), // some in 90 day window, some out
      }),
      { maxLength: 150 }
    );

    fc.assert(
      fc.property(eventArb, (mockEvents) => {
        const events: GitHubEvent[] = mockEvents.map((m) => {
          const d = new Date(now.getTime());
          d.setDate(now.getDate() - m.daysAgo);
          return {
            type: 'PushEvent',
            created_at: d.toISOString(),
            repo: { name: 'test' },
            payload: {},
          };
        });

        const activityRate = roadmapEngine.computeActivityRate(events);

        const countInWindow = events.filter((e) => {
          const diff = now.getTime() - new Date(e.created_at).getTime();
          const diffDays = diff / (1000 * 60 * 60 * 24);
          return diffDays >= 0 && diffDays <= 90;
        }).length;

        if (countInWindow < 10) {
          expect(activityRate).toBeNull();
        } else {
          expect(activityRate).toBeCloseTo(countInWindow / 90, 5);
        }
      }),
      { numRuns: 200 }
    );
  });
});
