import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { SearchHistoryEntry } from '@/types';

// Pure representation of the addEntry state logic used by useSearchHistory hook
function addHistoryEntry(prev: SearchHistoryEntry[], username: string): SearchHistoryEntry[] {
  const filtered = prev.filter((e) => e.username !== username);
  return [
    { username, analyzedAt: new Date().toISOString() },
    ...filtered,
  ].slice(0, 20);
}

describe('SearchHistory Invariants — Property Tests', () => {
  it('Property 15: Search history does not exceed 20, deduplicates, and places newest at index 0', () => {
    const usernameSequenceArb = fc.array(
      fc.stringMatching(/^[a-zA-Z0-9\-]{1,15}$/),
      { minLength: 1, maxLength: 50 }
    );

    fc.assert(
      fc.property(usernameSequenceArb, (usernames) => {
        let historyList: SearchHistoryEntry[] = [];

        // Add usernames sequentially
        usernames.forEach((username) => {
          historyList = addHistoryEntry(historyList, username);
        });

        // 1. History list length never exceeds 20
        expect(historyList.length).toBeLessThanOrEqual(20);

        // 2. Contains no duplicate usernames
        const uniqueUsernames = new Set(historyList.map((e) => e.username));
        expect(uniqueUsernames.size).toBe(historyList.length);

        // 3. Most recently added is at index 0
        const lastAdded = usernames[usernames.length - 1];
        expect(historyList[0].username).toBe(lastAdded);
      }),
      { numRuns: 200 }
    );
  });
});
