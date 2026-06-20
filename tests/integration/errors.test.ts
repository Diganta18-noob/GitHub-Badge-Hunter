import { describe, it, expect, vi } from 'vitest';
import { fetchRESTProfile } from '@/lib/api/github-rest';
import { fetchGraphQLStats } from '@/lib/api/github-graphql';
import { AnalyzerError } from '@/types';

describe('Error Mapping — Integration Tests', () => {
  it('surfaces GBT_ERR_NOT_FOUND on HTTP 404 from fetchRESTProfile', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      status: 404,
      ok: false,
      json: async () => ({}),
    } as Response);

    await expect(fetchRESTProfile('nonexistent-user')).rejects.toThrowError(
      new AnalyzerError('GBT_ERR_NOT_FOUND', 404, 'GitHub user not found. Please check the username and try again.')
    );

    mockFetch.mockRestore();
  });

  it('surfaces GBT_ERR_RATE_LIMITED on HTTP 403/429 from fetchRESTProfile', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      status: 429,
      ok: false,
      json: async () => ({}),
    } as Response);

    await expect(fetchRESTProfile('rate-limited-user')).rejects.toThrowError(
      new AnalyzerError('GBT_ERR_RATE_LIMITED', 429, 'GitHub API rate limit reached. Please try again in a few minutes.')
    );

    mockFetch.mockRestore();
  });

  it('surfaces GBT_ERR_RATE_LIMITED on HTTP 403/429 from fetchGraphQLStats', async () => {
    // Set a mock GITHUB_TOKEN so fetchGraphQLStats runs instead of returning empty stats
    process.env.GITHUB_TOKEN = 'test-token';

    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      status: 403,
      ok: false,
      json: async () => ({}),
    } as Response);

    await expect(fetchGraphQLStats('any-user')).rejects.toThrowError(
      new AnalyzerError('GBT_ERR_RATE_LIMITED', 403, 'GitHub API rate limit reached. Please try again in a few minutes.')
    );

    mockFetch.mockRestore();
  });
});
