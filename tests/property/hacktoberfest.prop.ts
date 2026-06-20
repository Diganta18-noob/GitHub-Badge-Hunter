import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { countHacktoberfestPRs } from '@/lib/engines/hacktoberfest-engine';
import type { GitHubEvent } from '@/types';

describe('HacktoberfestEngine — Property Tests', () => {
  it('Property 24: counts only PullRequestEvent in October of the current year', () => {
    const currentYear = new Date().getFullYear();
    const eventArb = fc.array(
      fc.record({
        type: fc.constantFrom('PullRequestEvent', 'PushEvent', 'IssuesEvent'),
        year: fc.constantFrom(currentYear, currentYear - 1, currentYear + 1),
        month: fc.nat({ max: 11 }), // 0-indexed month
        day: fc.integer({ min: 1, max: 28 }),
      }),
      { maxLength: 100 }
    );

    fc.assert(
      fc.property(eventArb, (mockEvents) => {
        const events: GitHubEvent[] = mockEvents.map((m) => {
          const d = new Date(m.year, m.month, m.day, 12, 0, 0);
          return {
            type: m.type,
            created_at: d.toISOString(),
            repo: { name: 'test-repo' },
            payload: {},
          };
        });

        const count = countHacktoberfestPRs(events);

        // Verify correct count manually
        const expectedCount = events.filter((e) => {
          if (e.type !== 'PullRequestEvent') return false;
          const d = new Date(e.created_at);
          return d.getFullYear() === currentYear && d.getMonth() === 9;
        }).length;

        expect(count).toBe(expectedCount);
      }),
      { numRuns: 200 }
    );
  });
});
