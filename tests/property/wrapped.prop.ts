// tests/property/wrapped.prop.ts
// Property 22: Wrapped data filters to current calendar year only

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { GitHubEvent } from '@/types';

// The filtering logic from WrappedPage
function filterCurrentYearEvents(events: GitHubEvent[], currentYear: number): GitHubEvent[] {
  return events.filter((e) => {
    try {
      return new Date(e.created_at).getFullYear() === currentYear;
    } catch {
      return false;
    }
  });
}

describe('GitHub Wrapped Filtering — Property Tests', () => {
  const currentYear = new Date().getFullYear();

  const eventArb = fc.record({
    type: fc.constant('PushEvent'),
    year: fc.integer({ min: 2000, max: 2100 }), // Generate years around the current year
    month: fc.integer({ min: 0, max: 11 }),
    day: fc.integer({ min: 1, max: 28 }),
  });

  const eventsArb = fc.array(eventArb, { minLength: 0, maxLength: 100 });

  it('Property 22: Filters events to the current calendar year only', () => {
    fc.assert(
      fc.property(eventsArb, (mockEvents) => {
        const events: GitHubEvent[] = mockEvents.map((m) => {
          const d = new Date(m.year, m.month, m.day);
          return {
            type: m.type,
            created_at: d.toISOString(),
            repo: { name: 'test' },
            payload: {},
          };
        });

        const filtered = filterCurrentYearEvents(events, currentYear);

        // Verify that all returned events belong to the current year
        filtered.forEach((e) => {
          expect(new Date(e.created_at).getFullYear()).toBe(currentYear);
        });

        // Verify that any event from the current year was not filtered out
        const expectedCount = events.filter(
          (e) => new Date(e.created_at).getFullYear() === currentYear
        ).length;
        expect(filtered.length).toBe(expectedCount);
      }),
      { numRuns: 200 }
    );
  });
});
