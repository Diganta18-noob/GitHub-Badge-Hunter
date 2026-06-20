import { describe, it, expect } from 'vitest';
import { RoadmapEngine } from '@/lib/engines/roadmap-engine';
import type { BadgeEvaluation, GitHubEvent } from '@/types';

describe('RoadmapEngine — Unit Tests', () => {
  const engine = new RoadmapEngine();

  it('handles 0 locked badges correctly', () => {
    // All badges are unlocked
    const evaluations: BadgeEvaluation[] = [
      {
        definition: {
          id: 'test-badge-1',
          name: 'Test Badge 1',
          description: '',
          iconPath: '',
          rarity: 'Common',
          tiers: [],
          difficulty: 'Easy',
          checklistItems: [],
          metricKey: 'totalCommits',
          secret: false,
        },
        status: 'Unlocked',
        currentValue: 10,
        threshold: 10,
        progress: 100,
        currentTier: 'Bronze',
        nextTier: null,
        earnedAt: new Date(),
        checklistItems: [],
        checklistCompletion: 100,
      },
    ];

    const result = engine.generate(evaluations, []);
    expect(result.steps).toHaveLength(0);
    expect(result.nextBadge).toBeUndefined();
  });

  it('computeActivityRate returns null with less than 10 events in 90-day window', () => {
    const events: GitHubEvent[] = Array.from({ length: 9 }).map(() => ({
      type: 'PushEvent',
      created_at: new Date().toISOString(),
      repo: { name: 'test' },
      payload: {},
    }));

    const rate = engine.computeActivityRate(events);
    expect(rate).toBeNull();
  });

  it('computeActivityRate returns correct rate with 10 events in 90-day window', () => {
    const events: GitHubEvent[] = Array.from({ length: 10 }).map(() => ({
      type: 'PushEvent',
      created_at: new Date().toISOString(),
      repo: { name: 'test' },
      payload: {},
    }));

    const rate = engine.computeActivityRate(events);
    expect(rate).toBeCloseTo(10 / 90, 5);
  });
});
