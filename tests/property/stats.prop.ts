// tests/property/stats.prop.ts
// Property 7: Statistics aggregation counts are consistent

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { BadgeEvaluation } from '@/types';

// The aggregation logic under test
function computeStats(evaluations: BadgeEvaluation[]) {
  const total = evaluations.length;
  const unlocked = evaluations.filter((e) => e.status === 'Unlocked').length;
  const locked = total - unlocked;
  const rare = evaluations.filter(
    (e) => e.status === 'Unlocked' && ['Rare', 'Epic', 'Legendary', 'Secret'].includes(e.definition.rarity),
  ).length;
  const secret = evaluations.filter(
    (e) => e.status === 'Unlocked' && e.definition.rarity === 'Secret',
  ).length;
  const progressPercentage = total > 0 ? Math.round((unlocked / total) * 1000) / 10 : 0;

  return { total, unlocked, locked, rare, secret, progressPercentage };
}

describe('Statistics Aggregation — Property Tests', () => {
  const rarityArb = fc.constantFrom<'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Secret'>(
    'Common', 'Rare', 'Epic', 'Legendary', 'Secret'
  );

  const statusArb = fc.constantFrom<'Unlocked' | 'Locked' | 'InProgress'>(
    'Unlocked', 'Locked', 'InProgress'
  );

  const badgeEvaluationArb = fc.record({
    status: statusArb,
    rarity: rarityArb,
  });

  const evaluationsArb = fc.array(badgeEvaluationArb, { minLength: 0, maxLength: 100 });

  it('Property 7: statistics aggregates are consistent', () => {
    fc.assert(
      fc.property(evaluationsArb, (mockEvals) => {
        const evaluations: BadgeEvaluation[] = mockEvals.map((e, idx) => ({
          definition: {
            id: `badge-${idx}`,
            name: `Badge ${idx}`,
            description: '',
            iconPath: '',
            rarity: e.rarity,
            tiers: [],
            difficulty: 'Easy',
            checklistItems: [],
            metricKey: 'totalCommits',
            secret: false,
          },
          status: e.status,
          currentValue: 0,
          threshold: 0,
          progress: 0,
          currentTier: 'None',
          nextTier: null,
          earnedAt: null,
          checklistItems: [],
          checklistCompletion: 0,
        }));

        const stats = computeStats(evaluations);

        // 1. total = unlocked + locked
        expect(stats.total).toBe(stats.unlocked + stats.locked);

        // 2. rare count matches number of Unlocked badges with Rare/Epic/Legendary/Secret rarity
        const expectedRare = evaluations.filter(
          (e) => e.status === 'Unlocked' && ['Rare', 'Epic', 'Legendary', 'Secret'].includes(e.definition.rarity)
        ).length;
        expect(stats.rare).toBe(expectedRare);

        // 3. secret count matches number of Unlocked badges with Secret rarity
        const expectedSecret = evaluations.filter(
          (e) => e.status === 'Unlocked' && e.definition.rarity === 'Secret'
        ).length;
        expect(stats.secret).toBe(expectedSecret);

        // 4. progressPercentage is accurate and within [0, 100]
        expect(stats.progressPercentage).toBeGreaterThanOrEqual(0);
        expect(stats.progressPercentage).toBeLessThanOrEqual(100);
        if (stats.total > 0) {
          const rawPercentage = (stats.unlocked / stats.total) * 100;
          expect(Math.abs(stats.progressPercentage - rawPercentage)).toBeLessThanOrEqual(0.1);
        } else {
          expect(stats.progressPercentage).toBe(0);
        }
      }),
      { numRuns: 200 }
    );
  });
});
