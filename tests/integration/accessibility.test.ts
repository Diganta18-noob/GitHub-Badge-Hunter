import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { ProfileSection } from '@/components/sections/ProfileSection';
import { StatsPanel } from '@/components/sections/StatsPanel';
import { BadgeCard } from '@/components/primitives/BadgeCard';
import type { GitHubProfile, BadgeEvaluation, ScoreResult, RoadmapResult } from '@/types';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

expect.extend(toHaveNoViolations);

const mockProfile: GitHubProfile = {
  username: 'torvalds',
  name: 'Linus Torvalds',
  avatarUrl: 'https://example.com/avatar.png',
  bio: 'Linux creator',
  createdAt: new Date('2008-01-01'),
  accountAgeYears: 18,
  followers: 1000,
  following: 10,
  publicRepos: 5,
  totalCommits: 2000,
  totalPRs: 50,
  totalIssues: 20,
  totalDiscussions: 0,
  totalGists: 0,
  totalPackages: 0,
  starsReceived: 100,
  forksReceived: 10,
  mergedExternalPRs: 2,
  contributorsToRepos: 0,
  organizations: [],
  languages: [],
  recentEvents: [],
  fetchedAt: new Date(),
  repositories: [],
};

const mockScores: ScoreResult = {
  githubScore: 1200,
  openSourceScore: 50,
};

const mockRoadmap: RoadmapResult = {
  nextBadge: undefined,
  steps: [],
  totalEstimatedDays: 0,
  estimatedCompletionDate: new Date(),
  activityRate: null,
};

const mockEvaluation: BadgeEvaluation = {
  definition: {
    id: 'test-badge',
    name: 'Test Badge',
    description: 'This is a test badge description.',
    iconPath: '/badges/test-badge.svg',
    rarity: 'Common',
    tiers: [{ tier: 'Bronze', threshold: 10 }],
    difficulty: 'Easy',
    checklistItems: [],
    metricKey: 'totalCommits',
    secret: false,
  },
  status: 'Locked',
  currentValue: 2,
  threshold: 10,
  progress: 20,
  currentTier: 'None',
  nextTier: 'Bronze',
  earnedAt: null,
  checklistItems: [],
  checklistCompletion: 0,
};

describe('Accessibility Integration Tests', () => {
  it('ProfileSection contains no axe violations', async () => {
    const { container } = render(
      React.createElement(ProfileSection, { profile: mockProfile })
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('StatsPanel contains no axe violations', async () => {
    const { container } = render(
      React.createElement(StatsPanel, {
        evaluations: [mockEvaluation],
        scores: mockScores,
        roadmap: mockRoadmap,
      })
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('BadgeCard contains no axe violations', async () => {
    const { container } = render(
      React.createElement(BadgeCard, {
        evaluation: mockEvaluation,
        rpgMode: false,
      })
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
