import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { predictBadges } from '@/lib/engines/badge-predictor';
import type { BadgeEvaluation, BadgeDefinition, GitHubProfile } from '@/types';

// Mock badge definition generator
const mockBadgeDefinition = (id: string, metricKey: keyof GitHubProfile): BadgeDefinition => ({
  id,
  name: `Badge ${id}`,
  description: '',
  iconPath: '',
  rarity: 'Common',
  tiers: [{ tier: 'Bronze', threshold: 10 }],
  difficulty: 'Easy',
  checklistItems: [],
  metricKey,
  secret: false,
});

describe('BadgePredictor — Property Tests', () => {
  it('Property 23: probability scores are valid [0, 1] and sorted descending', () => {
    const evaluationsArb = fc.array(
      fc.record({
        id: fc.uuid(),
        status: fc.constantFrom('Locked', 'InProgress'),
        progress: fc.double({ min: 0, max: 99.9, noNaN: true }),
        threshold: fc.integer({ min: 1, max: 100 }),
        currentValue: fc.integer({ min: 0, max: 99 }),
      }),
      { maxLength: 20 }
    );

    const activityRateArb = fc.oneof(
      fc.constant(null),
      fc.double({ min: 0, max: 5.0, noNaN: true })
    );

    fc.assert(
      fc.property(evaluationsArb, activityRateArb, (mockEvals, activityRate) => {
        const evaluations: BadgeEvaluation[] = mockEvals.map((m) => ({
          definition: mockBadgeDefinition(m.id, 'totalCommits'),
          status: m.status,
          currentValue: m.currentValue,
          threshold: m.threshold,
          progress: m.progress,
          currentTier: 'None',
          nextTier: 'Bronze',
          earnedAt: null,
          checklistItems: [],
          checklistCompletion: 0,
        }));

        const predictions = predictBadges(evaluations, activityRate);

        // Verify probability bounds
        predictions.forEach((p) => {
          expect(p.probability).toBeGreaterThanOrEqual(0);
          expect(p.probability).toBeLessThanOrEqual(1);
        });

        // Verify descending sort order
        for (let i = 1; i < predictions.length; i++) {
          expect(predictions[i].probability).toBeLessThanOrEqual(
            predictions[i - 1].probability
          );
        }
      }),
      { numRuns: 200 }
    );
  });
});
