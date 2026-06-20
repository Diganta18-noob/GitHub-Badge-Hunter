import type { GitHubRepository } from '@/types';

/**
 * Computes a repository health score in the range [0, 100].
 * Weights:
 * - has README: 20 pts
 * - has LICENSE: 20 pts
 * - has CONTRIBUTING: 20 pts
 * - has open issues: 10 pts
 * - has recent commit within 90 days: 30 pts
 */
export function computeRepoHealthScore(repo: GitHubRepository): number {
  let score = 0;

  if (repo.hasReadme) score += 20;
  if (repo.hasLicense) score += 20;
  if (repo.hasContributing) score += 20;
  if (repo.openIssuesCount > 0) score += 10;

  // Check if pushed within 90 days
  try {
    const pushDate = new Date(repo.pushedAt);
    const now = new Date();
    const diffTime = now.getTime() - pushDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    if (diffDays <= 90) {
      score += 30;
    }
  } catch {
    // If date parsing fails, do not add points
  }

  return Math.max(0, Math.min(100, score));
}
