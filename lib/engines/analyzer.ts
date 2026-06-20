// lib/engines/analyzer.ts

import type { GitHubProfile, GitHubRESTUser, GitHubGraphQLStats, GitHubEvent, GitHubOrg } from '@/types';

import { fetchRESTProfile, fetchOrgs } from '@/lib/api/github-rest';
import { fetchGraphQLStats } from '@/lib/api/github-graphql';
import { fetchPublicEvents } from '@/lib/api/github-events';
import { computeTopLanguages } from '@/lib/utils/formatters';

export class Analyzer {
  async analyse(username: string): Promise<GitHubProfile> {
    const [restUser, graphqlStats, events, orgs] = await Promise.all([
      fetchRESTProfile(username),
      fetchGraphQLStats(username),
      fetchPublicEvents(username),
      fetchOrgs(username),
    ]);

    return normalise(restUser, graphqlStats, events, orgs);
  }
}

/**
 * Merge all four API responses into a single normalised GitHubProfile.
 */
function normalise(
  rest: GitHubRESTUser,
  gql: GitHubGraphQLStats,
  events: GitHubEvent[],
  orgs: GitHubOrg[],
): GitHubProfile {
  const createdAt = new Date(rest.created_at);
  const now = new Date();
  const accountAgeYears = Math.floor(
    (now.getTime() - createdAt.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );

  let totalCommits = gql.totalCommitContributions;
  let totalPRs = gql.totalPullRequestContributions;
  let totalIssues = gql.totalIssueContributions;

  // Fallback to counting from events if GraphQL totals are zero (no GITHUB_TOKEN configured)
  if (totalCommits === 0 && events && events.length > 0) {
    totalCommits = events
      .filter((e) => e.type === 'PushEvent')
      .reduce((sum, e) => {
        const commits = (e.payload as { commits?: unknown[] })?.commits;
        return sum + (Array.isArray(commits) ? commits.length : 0);
      }, 0);
  }
  if (totalPRs === 0 && events && events.length > 0) {
    totalPRs = events.filter((e) => e.type === 'PullRequestEvent').length;
  }
  if (totalIssues === 0 && events && events.length > 0) {
    totalIssues = events.filter((e) => e.type === 'IssuesEvent').length;
  }

  return {
    username: rest.login,
    name: rest.name ?? rest.login,
    avatarUrl: rest.avatar_url,
    bio: rest.bio ?? '',
    createdAt,
    accountAgeYears,
    followers: rest.followers,
    following: rest.following,
    publicRepos: rest.public_repos,
    totalCommits,
    totalPRs,
    totalIssues,
    totalDiscussions: gql.totalDiscussionContributions,
    totalGists: gql.totalGists || rest.public_gists || 0,
    totalPackages: gql.totalPackages,
    starsReceived: gql.starsReceived,
    forksReceived: gql.forksReceived,
    mergedExternalPRs: gql.mergedPRsOnExternalRepos,
    contributorsToRepos: gql.contributorsToUserRepos,
    organizations: orgs,
    languages: computeTopLanguages(gql.languages),
    recentEvents: events,
    fetchedAt: now,
    repositories: gql.repositories,
  };
}
