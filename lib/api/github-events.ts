// lib/api/github-events.ts

import type { GitHubEvent } from '@/types';

const BASE = 'https://api.github.com';

/**
 * Fetch up to 3 pages of public events concurrently (max 300 events).
 * Individual page failures are silently caught and return empty arrays,
 * so a missing page does not abort the entire fetch.
 */
export async function fetchPublicEvents(username: string): Promise<GitHubEvent[]> {
  const token = process.env.GITHUB_TOKEN;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fetchPage = async (page: number): Promise<GitHubEvent[]> => {
    try {
      const res = await fetch(
        `${BASE}/users/${username}/events/public?per_page=100&page=${page}`,
        { headers },
      );

      if (!res.ok) return [];

      return (await res.json()) as GitHubEvent[];
    } catch {
      return [];
    }
  };

  const pages = await Promise.all([fetchPage(1), fetchPage(2), fetchPage(3)]);
  return pages.flat();
}
