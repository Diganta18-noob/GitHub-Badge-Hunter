import { describe, it, expect } from 'vitest';
import { predictBadges } from '@/lib/engines/badge-predictor';
import type { BadgeEvaluation } from '@/types';

const mockBadgeDefinition = (id: string, metricKey: any) => ({
  id,
  name: `Badge ${id}`,
  description: '',
  iconPath: '',
  rarity: 'Common' as const,
  tiers: [{ tier: 'Bronze' as const, threshold: 10 }],
  difficulty: 'Easy' as const,
  checklistItems: [],
  metricKey,
  secret: false,
});

const createEvaluation = (overrides: Partial<BadgeEvaluation> & { id?: string } = {}): BadgeEvaluation => ({
  definition: mockBadgeDefinition(overrides.id || 'test-badge', 'totalCommits'),
  status: 'Locked',
  currentValue: 0,
  threshold: 10,
  progress: 0,
  currentTier: 'None',
  nextTier: 'Bronze',
  earnedAt: null,
  checklistItems: [],
  checklistCompletion: 0,
  ...overrides,
});

describe('badge predictor', () => {
  it('should handle typical inputs correctly', () => {
    const evals = [
      createEvaluation({ id: 'badge-1', currentValue: 5, threshold: 10, progress: 50 }),
      createEvaluation({ id: 'badge-2', currentValue: 2, threshold: 10, progress: 20 }),
    ];
    const predictions = predictBadges(evals, 1);
    expect(predictions).toHaveLength(2);
    expect(predictions[0].badge.definition.id).toBe('badge-1');
    expect(predictions[0].probability).toBeGreaterThan(predictions[1].probability);
  });

  it('should handle edge case of zero or NaN inputs correctly', () => {
    const evals = [
      createEvaluation({ id: 'eval-nan', currentValue: NaN, threshold: 10, progress: NaN }),
      createEvaluation({ id: 'eval-zero', currentValue: 0, threshold: 10, progress: 0 }),
    ];

    // Testing zero activity rate: both fallback to Math.max(0.01, base * 0.4) -> 0.01
    const predictionsZero = predictBadges(evals, 0);
    expect(predictionsZero).toHaveLength(2);
    predictionsZero.forEach((p) => {
      expect(p.probability).toBe(0.01);
    });

    // Testing NaN activity rate: both fallback to 0.01
    const predictionsNaN = predictBadges(evals, NaN);
    expect(predictionsNaN).toHaveLength(2);
    predictionsNaN.forEach((p) => {
      expect(p.probability).toBe(0.01);
    });

    // Testing subnormal activity rate: both fallback to 0.01
    const predictionsSubnormal = predictBadges(evals, 5e-324);
    expect(predictionsSubnormal).toHaveLength(2);
    predictionsSubnormal.forEach((p) => {
      expect(p.probability).toBe(0.01);
    });

    // Testing Infinity activity rate:
    // For eval-nan, remaining is NaN, estimatedDays is NaN (not finite) -> fallback to Math.max(0.01, 0) = 0.01
    // For eval-zero, remaining is 10, estimatedDays is 0 (finite <= 90) -> probability is base * 1.25 = 0
    // Result is sorted descending: [eval-nan (0.01), eval-zero (0)]
    const predictionsInf = predictBadges(evals, Infinity);
    expect(predictionsInf).toHaveLength(2);
    expect(predictionsInf[0].badge.definition.id).toBe('eval-nan');
    expect(predictionsInf[0].probability).toBe(0.01);
    expect(predictionsInf[1].badge.definition.id).toBe('eval-zero');
    expect(predictionsInf[1].probability).toBe(0);
  });

  it('should handle negative values safely', () => {
    const evals = [
      createEvaluation({ currentValue: -5, threshold: 10, progress: -50 }),
    ];
    // With negative progress, base is 0. With negative activityRate, fallback is 0.01
    const predictions = predictBadges(evals, -2);
    predictions.forEach((p) => {
      expect(p.probability).toBe(0.01);
    });
  });
});
