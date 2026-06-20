import { describe, it, expect, vi } from 'vitest';
import { Analyzer } from '@/lib/engines/analyzer';
import { fetchRESTProfile, fetchOrgs } from '@/lib/api/github-rest';
import { fetchGraphQLStats } from '@/lib/api/github-graphql';
import { fetchPublicEvents } from '@/lib/api/github-events';

vi.mock('@/lib/api/github-rest', () => ({
  fetchRESTProfile: vi.fn(),
  fetchOrgs: vi.fn(),
}));

vi.mock('@/lib/api/github-graphql', () => ({
  fetchGraphQLStats: vi.fn(),
}));

vi.mock('@/lib/api/github-events', () => ({
  fetchPublicEvents: vi.fn(),
}));

describe('Analyzer — Integration Tests', () => {
  it('calls all 4 API endpoints concurrently and normalises profiles', async () => {
    const mockREST = {
      login: 'torvalds',
      name: 'Linus Torvalds',
      avatar_url: 'https://example.com/avatar.png',
      bio: 'Linux creator',
      created_at: '2008-01-01T00:00:00Z',
      followers: 150000,
      following: 0,
      public_repos: 10,
    };

    const mockOrgs = [{ login: 'git', avatar_url: '' }];

    const mockGQL = {
      totalCommitContributions: 1200,
      totalPullRequestContributions: 80,
      totalIssueContributions: 40,
      totalRepositoryContributions: 5,
      totalDiscussionContributions: 0,
      starsReceived: 5000,
      forksReceived: 300,
      mergedPRsOnExternalRepos: 50,
      contributorsToUserRepos: 12,
      languages: [{ name: 'C', bytes: 100000, color: '#ff0000' }],
      totalGists: 2,
      totalPackages: 1,
      repositories: [],
    };

    const mockEvents = [
      {
        type: 'PushEvent',
        created_at: '2026-06-19T12:00:00Z',
        repo: { name: 'git/git' },
        payload: {},
      },
    ];

    vi.mocked(fetchRESTProfile).mockResolvedValue(mockREST);
    vi.mocked(fetchOrgs).mockResolvedValue(mockOrgs);
    vi.mocked(fetchGraphQLStats).mockResolvedValue(mockGQL);
    vi.mocked(fetchPublicEvents).mockResolvedValue(mockEvents);

    const analyzer = new Analyzer();
    const profile = await analyzer.analyse('torvalds');

    expect(fetchRESTProfile).toHaveBeenCalledWith('torvalds');
    expect(fetchOrgs).toHaveBeenCalledWith('torvalds');
    expect(fetchGraphQLStats).toHaveBeenCalledWith('torvalds');
    expect(fetchPublicEvents).toHaveBeenCalledWith('torvalds');

    expect(profile.username).toBe('torvalds');
    expect(profile.name).toBe('Linus Torvalds');
    expect(profile.followers).toBe(150000);
    expect(profile.totalCommits).toBe(1200);
    expect(profile.languages[0].name).toBe('C');
    expect(profile.recentEvents).toHaveLength(1);
    expect(profile.organizations).toHaveLength(1);
  });
});
