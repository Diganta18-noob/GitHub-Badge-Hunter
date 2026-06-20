// tests/property/input-parser.prop.ts
// Property 1: Input parsing round-trip
// Property 2: Invalid characters are always rejected

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { parseInput } from '@/lib/utils/input-parser';

// Valid GitHub usernames: 1–39 chars of [a-zA-Z0-9-]
const validUsername = fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\-]{0,38}$/);

describe('Input Parser — Property Tests', () => {
  it('Property 1: round-trip — valid usernames extracted from URL forms', () => {
    const urlPrefixes = [
      'https://github.com/',
      'http://github.com/',
      'github.com/',
    ];

    fc.assert(
      fc.property(validUsername, (username) => {
        // Bare username
        const bare = parseInput(username);
        expect(bare.username).toBe(username);
        expect(bare.error).toBeNull();

        // Each URL form
        for (const prefix of urlPrefixes) {
          const result = parseInput(`${prefix}${username}`);
          expect(result.username).toBe(username);
          expect(result.error).toBeNull();
        }
      }),
      { numRuns: 200 },
    );
  });

  it('Property 2: strings with invalid characters are always rejected', () => {
    // Generate strings that contain at least one character outside [a-zA-Z0-9-]
    // and are NOT valid GitHub URLs
    const invalidChars = fc
      .string({ minLength: 1, maxLength: 50 })
      .filter((s) => {
        const trimmed = s.trim();
        // Must have at least one invalid char
        if (/^[a-zA-Z0-9\-]{1,39}$/.test(trimmed)) return false;
        // Must not match a valid URL form
        if (/^(?:https?:\/\/)?github\.com\/[a-zA-Z0-9\-]{1,39}\/?$/.test(trimmed)) return false;
        // Must not be empty after trimming
        if (trimmed === '') return false;
        return true;
      });

    fc.assert(
      fc.property(invalidChars, (input) => {
        const result = parseInput(input);
        expect(result.error).toBe('INVALID_FORMAT');
        expect(result.username).toBeNull();
      }),
      { numRuns: 200 },
    );
  });
});
