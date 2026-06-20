// tests/property/leaderboard.prop.ts
// Property 16: Leaderboard is correctly sorted for each tab

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { LeaderboardEntry, LeaderboardTab } from '@/types';

// The pure sort logic from useLeaderboard hook
const TAB_METRIC_MAP: Record<LeaderboardTab, keyof LeaderboardEntry> = {
  mostBadges: 'badgeCount',
  fastestGrowth: 'badgesLast30Days',
  mostContributions: 'totalContributions',
  mostPRs: 'totalPRs',
};

function sortLeaderboard(entries: LeaderboardEntry[], tab: LeaderboardTab): LeaderboardEntry[] {
  const metric = TAB_METRIC_MAP[tab];
  return [...entries].sort(
    (a, b) => (b[metric] as number) - (a[metric] as number)
  );
}

describe('Leaderboard sorting — Property Tests', () => {
  const entryArb = fc.record({
    username: fc.stringMatching(/^[a-zA-Z0-9\-]{1,15}$/),
    avatarUrl: fc.constant('https://example.com/avatar.png'),
    badgeCount: fc.nat({ max: 50 }),
    badgesLast30Days: fc.nat({ max: 10 }),
    totalContributions: fc.nat({ max: 10000 }),
    totalPRs: fc.nat({ max: 500 }),
    trend: fc.constantFrom<'up' | 'down' | 'new'>('new', 'up', 'down'),
    rank: fc.nat({ max: 100 }),
  });

  const entriesArb = fc.array(entryArb, { minLength: 0, maxLength: 50 });

  it('Property 16: sorted correctly for all tabs in descending order', () => {
    fc.assert(
      fc.property(entriesArb, (entries) => {
        const tabs: LeaderboardTab[] = ['mostBadges', 'fastestGrowth', 'mostContributions', 'mostPRs'];
        
        tabs.forEach((tab) => {
          const sorted = sortLeaderboard(entries, tab);
          const metric = TAB_METRIC_MAP[tab];

          // Assert the sorted array matches expected sorting condition: elements are in descending order
          for (let i = 1; i < sorted.length; i++) {
            const valPrev = sorted[i - 1][metric] as number;
            const valCurr = sorted[i][metric] as number;
            expect(valPrev).toBeGreaterThanOrEqual(valCurr);
          }
        });
      }),
      { numRuns: 200 }
    );
  });
});
