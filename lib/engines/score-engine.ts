// lib/engines/score-engine.ts

import type { GitHubProfile, ScoreResult } from '@/types';

const GITHUB_SCORE_MAX = 10_000;
const OSS_SCORE_MAX = 10_000;

export class ScoreEngine {
  compute(profile: GitHubProfile): ScoreResult {
    const githubScore = Math.min(
      GITHUB_SCORE_MAX,
      profile.totalCommits * 1 +
        profile.totalPRs * 3 +
        profile.totalIssues * 2 +
        profile.starsReceived * 2 +
        profile.followers * 1 +
        profile.organizations.length * 5,
    );

    const openSourceScore = Math.min(
      OSS_SCORE_MAX,
      profile.mergedExternalPRs * 5 +
        profile.forksReceived * 3 +
        profile.contributorsToRepos * 2,
    );

    return { githubScore, openSourceScore };
  }
}
