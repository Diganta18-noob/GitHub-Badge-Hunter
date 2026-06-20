// tests/property/formatters.prop.ts
// Property 13: Number formatter comma separators
// Property 14: Top-languages percentages

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { formatNumber, computeTopLanguages } from '@/lib/utils/formatters';
import type { LanguageEntry } from '@/types';

describe('Formatters — Property Tests', () => {
  it('Property 13: formatted numbers > 999 contain commas, and removing commas gives the original number', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1000, max: 999_999_999 }), (n) => {
        const formatted = formatNumber(n);
        // Must contain at least one comma
        expect(formatted).toContain(',');
        // Removing commas must give back the original number
        const restored = Number(formatted.replace(/,/g, ''));
        expect(restored).toBe(n);
      }),
      { numRuns: 200 },
    );
  });

  it('Property 13 supplement: numbers ≤ 999 do not contain commas', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 999 }), (n) => {
        const formatted = formatNumber(n);
        expect(formatted).not.toContain(',');
        expect(Number(formatted)).toBe(n);
      }),
      { numRuns: 200 },
    );
  });

  it('Property 14: top-languages returns ≤ 8 entries with correct percentages totalling ≤ 100', () => {
    const langEntry = fc.record({
      name: fc.string({ minLength: 1, maxLength: 20 }),
      bytes: fc.integer({ min: 1, max: 10_000_000 }),
      color: fc.stringMatching(/^#[0-9a-f]{6}$/),
    }) as fc.Arbitrary<LanguageEntry>;

    fc.assert(
      fc.property(
        fc.array(langEntry, { minLength: 1, maxLength: 30 }),
        (languages) => {
          const result = computeTopLanguages(languages);
          // ≤ 8 entries
          expect(result.length).toBeLessThanOrEqual(8);
          // Each has a percentage
          result.forEach((entry) => {
            expect(entry.percentage).toBeDefined();
            expect(entry.percentage!).toBeGreaterThanOrEqual(0);
            expect(entry.percentage!).toBeLessThanOrEqual(100);
          });
          // Total percentages ≤ 100 (may be < 100 due to rounding)
          const total = result.reduce((sum, e) => sum + (e.percentage ?? 0), 0);
          expect(total).toBeLessThanOrEqual(100.5); // rounding tolerance
        },
      ),
      { numRuns: 200 },
    );
  });

  it('Property 14 supplement: empty input returns empty output', () => {
    const result = computeTopLanguages([]);
    expect(result).toEqual([]);
  });
});
