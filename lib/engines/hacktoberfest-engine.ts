import type { GitHubEvent } from '@/types';

/**
 * Counts qualifying pull request events submitted in October of the current year.
 */
export function countHacktoberfestPRs(events: GitHubEvent[]): number {
  const currentYear = new Date().getFullYear();

  return events.filter((e) => {
    if (e.type !== 'PullRequestEvent') return false;
    try {
      const d = new Date(e.created_at);
      return d.getFullYear() === currentYear && d.getMonth() === 9; // October is month 9
    } catch {
      return false;
    }
  }).length;
}
