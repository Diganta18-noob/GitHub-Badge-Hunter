// lib/api/github-rest.ts

import { AnalyzerError } from '@/types';
import type { GitHubRESTUser, GitHubOrg, GitHubRESTRepository } from '@/types';

const BASE = 'https://api.github.com';

async function ghFetch<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    headers,
    next: { revalidate: 300 },  // Next.js fetch cache 5 min
  } as RequestInit);

  if (res.status === 404) {
    throw new AnalyzerError('GBT_ERR_NOT_FOUND', 404, 'GitHub user not found. Please check the username and try again.');
  }
  if (res.status === 403 || res.status === 429) {
    throw new AnalyzerError('GBT_ERR_RATE_LIMITED', res.status, 'GitHub API rate limit reached. Please try again in a few minutes.');
  }
  if (!res.ok) {
    throw new AnalyzerError('GBT_ERR_UNKNOWN', res.status, `GitHub API error (${res.status}): ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export const fetchRESTProfile = (username: string): Promise<GitHubRESTUser> =>
  ghFetch<GitHubRESTUser>(`/users/${username}`);

export const fetchRESTRepos = (username: string): Promise<GitHubRESTRepository[]> =>
  ghFetch<GitHubRESTRepository[]>(`/users/${username}/repos?per_page=100`);

export const fetchOrgs = (username: string): Promise<GitHubOrg[]> =>
  ghFetch<GitHubOrg[]>(`/users/${username}/orgs`);

export interface RecommendedRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string;
}

export async function fetchRecommendations(languages: string[]): Promise<RecommendedRepo[]> {
  const lang = languages[0] || 'javascript';
  const token = process.env.GITHUB_TOKEN;
  try {
    const res = await ghFetch<{ items: RecommendedRepo[] }>(
      `/search/repositories?q=language:${encodeURIComponent(lang)}+label:"good+first+issue"&sort=stars&per_page=5`,
      token
    );
    return res.items || [];
  } catch {
    return [];
  }
}
