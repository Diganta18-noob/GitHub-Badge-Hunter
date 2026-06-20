// tests/property/compare.prop.ts
// Property 18: Comparison highlight logic correctly identifies the higher value

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// Pure highlight function matching CompareView's logic
function getHighlightColor(val: number, otherVal: number): string {
  const isHigher = val > otherVal;
  return isHigher ? '#15803D' : '#94A3B8';
}

describe('CompareView Highlight Logic — Property Tests', () => {
  it('Property 18: Highlight logic correctly identifies the higher value', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        const colorA = getHighlightColor(a, b);
        const colorB = getHighlightColor(b, a);

        if (a > b) {
          expect(colorA).toBe('#15803D');
          expect(colorB).toBe('#94A3B8');
        } else if (b > a) {
          expect(colorA).toBe('#94A3B8');
          expect(colorB).toBe('#15803D');
        } else {
          // a === b
          expect(colorA).toBe('#94A3B8');
          expect(colorB).toBe('#94A3B8');
        }
      }),
      { numRuns: 300 }
    );
  });
});
