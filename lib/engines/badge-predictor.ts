import type { BadgeEvaluation } from '@/types';

export interface BadgePrediction {
  badge: BadgeEvaluation;
  probability: number;
}

/**
 * Predicts the likelihood of unlocking locked badges within the next 90 days.
 * Returns a list of predictions sorted by probability descending.
 */
export function predictBadges(
  evaluations: BadgeEvaluation[],
  activityRate: number | null
): BadgePrediction[] {
  const locked = evaluations.filter((e) => e.status !== 'Unlocked');

  const predictions: BadgePrediction[] = locked.map((evaluation) => {
    const { progress, threshold, currentValue } = evaluation;
    const base = isNaN(progress) || progress < 0 ? 0 : progress / 100; // base probability based on current progress fraction

    let probability = 0;

    const remaining = Math.max(0, threshold - currentValue);

    if (remaining === 0) {
      probability = 0.99;
    } else if (activityRate && activityRate > 0.0001) {
      const estimatedDays = remaining / activityRate;

      if (!isFinite(estimatedDays) || estimatedDays < 0) {
        probability = Math.max(0.01, base * 0.4);
      } else if (estimatedDays <= 90) {
        // High likelihood if estimated days is within 90 days
        probability = Math.min(0.99, base * (1 + (90 - estimatedDays) / 90 * 0.25));
      } else {
        // Decay probability if it will take longer than 90 days
        probability = Math.max(0.01, base * (90 / estimatedDays));
      }
    } else {
      // Lower confidence fallback if there's no activity rate
      probability = Math.max(0.01, base * 0.4);
    }

    // Ensure it is strictly in [0, 1] and is not NaN
    probability = isNaN(probability) ? 0 : Math.max(0, Math.min(1, probability));

    return {
      badge: evaluation,
      probability,
    };
  });

  // Sort descending by probability
  return predictions.sort((a, b) => b.probability - a.probability);
}
