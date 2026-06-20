import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { BadgeEvaluation } from '@/types';

function groupBadgesByYear(evaluations: BadgeEvaluation[]) {
  const earned = evaluations.filter((e) => e.status === 'Unlocked' && e.earnedAt);
  const yearGroups = new Map<number, BadgeEvaluation[]>();

  earned.forEach((e) => {
    const year = e.earnedAt!.getFullYear();
    if (!yearGroups.has(year)) yearGroups.set(year, []);
    yearGroups.get(year)!.push(e);
  });

  const sortedYears = Array.from(yearGroups.keys()).sort((a, b) => b - a);
  return { yearGroups, sortedYears };
}

describe('TimelineView Grouping — Property Tests', () => {
  it('Property 17: Groups badges into correct calendar years in descending order', () => {
    const evaluationsArb = fc.array(
      fc.record({
        status: fc.constantFrom('Unlocked', 'Locked'),
        year: fc.integer({ min: 2010, max: 2026 }),
        month: fc.integer({ min: 0, max: 11 }),
        day: fc.integer({ min: 1, max: 28 }),
      }),
      { maxLength: 100 }
    );

    fc.assert(
      fc.property(evaluationsArb, (mockEvals) => {
        const evaluations: BadgeEvaluation[] = mockEvals.map((m, idx) => ({
          definition: {
            id: `badge-${idx}`,
            name: `Badge ${idx}`,
            description: '',
            iconPath: '',
            rarity: 'Common',
            tiers: [],
            difficulty: 'Easy',
            checklistItems: [],
            metricKey: 'totalCommits',
            secret: false,
          },
          status: m.status,
          currentValue: 0,
          threshold: 1,
          progress: 0,
          currentTier: 'None',
          nextTier: null,
          earnedAt: m.status === 'Unlocked' ? new Date(m.year, m.month, m.day) : null,
          checklistItems: [],
          checklistCompletion: 0,
        }));

        const { yearGroups, sortedYears } = groupBadgesByYear(evaluations);

        // Verify sortedYears descending order
        for (let i = 1; i < sortedYears.length; i++) {
          expect(sortedYears[i - 1]).toBeGreaterThan(sortedYears[i]);
        }

        // Verify grouping
        evaluations.forEach((e) => {
          if (e.status === 'Unlocked' && e.earnedAt) {
            const year = e.earnedAt.getFullYear();
            expect(yearGroups.has(year)).toBe(true);
            const group = yearGroups.get(year)!;
            expect(group).toContain(e);
          }
        });
      }),
      { numRuns: 200 }
    );
  });
});
