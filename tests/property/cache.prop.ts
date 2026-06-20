import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { fetchProfile } from '@/lib/hooks/useAnalyze';
import { Analyzer } from '@/lib/engines/analyzer';
import type { GitHubProfile } from '@/types';

// Mock profile helper
const mockProfile = (username: string): GitHubProfile => ({
  username,
  name: 'Test User',
  avatarUrl: '',
  bio: '',
  createdAt: new Date(),
  accountAgeYears: 0,
  followers: 0,
  following: 0,
  publicRepos: 0,
  totalCommits: 0,
  totalPRs: 0,
  totalIssues: 0,
  totalDiscussions: 0,
  totalGists: 0,
  totalPackages: 0,
  starsReceived: 0,
  forksReceived: 0,
  mergedExternalPRs: 0,
  contributorsToRepos: 0,
  organizations: [],
  languages: [],
  recentEvents: [],
  fetchedAt: new Date(),
  repositories: [],
});

describe('Cache Idempotence — Property Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('Property 3: at most one active in-flight request per username concurrently', async () => {
    const usernameArb = fc.stringMatching(/^[a-zA-Z0-9\-]{1,15}$/);

    await fc.assert(
      fc.asyncProperty(usernameArb, async (username) => {
        const profileData = mockProfile(username);

        // Spy on globalThis.fetch and mock it with a delay
        const spy = vi
          .spyOn(globalThis, 'fetch')
          .mockImplementation(() => {
            return new Promise<Response>((resolve) => {
              setTimeout(() => {
                resolve({
                  ok: true,
                  json: async () => profileData,
                } as Response);
              }, 10);
            });
          });

        // Trigger two concurrent requests for the same username
        const [resA, resB] = await Promise.all([
          fetchProfile(username),
          fetchProfile(username),
        ]);

        // Verify fetch was called exactly once
        expect(spy).toHaveBeenCalledTimes(1);

        // Verify both concurrent callers got the same promise reference and returned object
        expect(resA).toBe(resB);
        expect(resA).toEqual(profileData);

        spy.mockRestore();
      }),
      { numRuns: 50 } // async property tests are slower, 50 runs is robust and fast
    );
  });
});
