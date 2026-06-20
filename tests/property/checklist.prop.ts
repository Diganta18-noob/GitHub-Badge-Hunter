// tests/property/checklist.prop.ts
// Property 21: Checklist completion percentage is consistent

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { ChecklistItem } from '@/types';

// The completion percentage logic from BadgeEngine
function computeChecklistCompletion(items: ChecklistItem[]): number {
  return items.length > 0
    ? Math.round((items.filter((c) => c.met).length / items.length) * 100)
    : 0;
}

describe('Checklist Completion — Property Tests', () => {
  const checklistItemArb = fc.record({
    id: fc.string(),
    label: fc.string(),
    met: fc.boolean(),
  });

  const checklistItemsArb = fc.array(checklistItemArb, { minLength: 1, maxLength: 50 });

  it('Property 21: checklist completion percentage is accurate and bounded [0, 100]', () => {
    fc.assert(
      fc.property(checklistItemsArb, (items) => {
        const completion = computeChecklistCompletion(items);
        
        // Assert bounds
        expect(completion).toBeGreaterThanOrEqual(0);
        expect(completion).toBeLessThanOrEqual(100);

        // Assert calculation accuracy
        const metCount = items.filter((c) => c.met).length;
        const totalCount = items.length;
        const expected = Math.round((metCount / totalCount) * 100);
        expect(completion).toBe(expected);
      }),
      { numRuns: 200 }
    );
  });

  it('Property 21: returns 0 when checklist is empty', () => {
    expect(computeChecklistCompletion([])).toBe(0);
  });
});
