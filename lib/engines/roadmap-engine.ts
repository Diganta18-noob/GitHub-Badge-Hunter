// lib/engines/roadmap-engine.ts

import type {
  BadgeEvaluation,
  GitHubEvent,
  RoadmapResult,
  RoadmapStep,
} from '@/types';

export class RoadmapEngine {
  generate(evaluations: BadgeEvaluation[], events: GitHubEvent[]): RoadmapResult {
    // 1. Filter to locked/in-progress, sort by progress desc
    const candidates = evaluations
      .filter((e) => e.status !== 'Unlocked')
      .sort((a, b) => b.progress - a.progress);

    const nextBadge = candidates[0];
    const top3 = candidates.slice(0, 3);

    // 2. Compute daily activity rate from 90-day event window
    const activityRate = this.computeActivityRate(events);

    // 3. Generate steps for top 3 locked badges
    const steps: RoadmapStep[] = top3
      .flatMap((badge) => this.stepsForBadge(badge, activityRate))
      .slice(0, 10);

    // 4. Sort by estimated days ascending
    steps.sort((a, b) => a.estimatedDays - b.estimatedDays);

    const totalEstimatedDays = steps.reduce((sum, s) => sum + s.estimatedDays, 0);
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + totalEstimatedDays);

    return { nextBadge, steps, totalEstimatedDays, estimatedCompletionDate, activityRate };
  }

  computeActivityRate(events: GitHubEvent[]): number | null {
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - 90);

    const windowEvents = events.filter(
      (e) => new Date(e.created_at) >= windowStart,
    );

    if (windowEvents.length < 10) return null;

    return windowEvents.length / 90; // events per day
  }

  private stepsForBadge(badge: BadgeEvaluation, rate: number | null): RoadmapStep[] {
    const remaining = badge.threshold - badge.currentValue;
    const estimatedDays = rate
      ? Math.ceil(remaining / rate)
      : 30; // default fallback

    return [{
      id: `${badge.definition.id}-main`,
      action: buildActionDescription(badge, remaining),
      targetBadgeId: badge.definition.id,
      estimatedDays,
      difficulty: badge.definition.difficulty,
      completed: false,
    }];
  }
}

function buildActionDescription(badge: BadgeEvaluation, remaining: number): string {
  return `${remaining} more ${badge.definition.metricKey.replace(/total|s$/gi, '').toLowerCase()}s ` +
    `needed to unlock ${badge.definition.name}`;
}
