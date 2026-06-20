import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { computeRepoHealthScore } from '@/lib/engines/repo-health';
import type { GitHubRepository } from '@/types';

describe('RepoHealth — Property Tests', () => {
  it('Property 20: health score is bounded in [0, 100] and additive', () => {
    const repoArb = fc.record({
      name: fc.string(),
      hasReadme: fc.boolean(),
      hasLicense: fc.boolean(),
      hasContributing: fc.boolean(),
      openIssuesCount: fc.nat({ max: 100 }),
      pushedDaysAgo: fc.nat({ max: 180 }),
    });

    fc.assert(
      fc.property(repoArb, (r) => {
        const pushedAt = new Date();
        pushedAt.setDate(pushedAt.getDate() - r.pushedDaysAgo);

        const repo: GitHubRepository = {
          name: r.name,
          pushedAt: pushedAt.toISOString(),
          hasReadme: r.hasReadme,
          hasLicense: r.hasLicense,
          hasContributing: r.hasContributing,
          openIssuesCount: r.openIssuesCount,
        };

        const score = computeRepoHealthScore(repo);

        // Verify bounding
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);

        // Verify additivity formula
        let expected = 0;
        if (r.hasReadme) expected += 20;
        if (r.hasLicense) expected += 20;
        if (r.hasContributing) expected += 20;
        if (r.openIssuesCount > 0) expected += 10;
        if (r.pushedDaysAgo <= 90) expected += 30;

        expect(score).toBe(expected);
      }),
      { numRuns: 200 }
    );
  });
});
