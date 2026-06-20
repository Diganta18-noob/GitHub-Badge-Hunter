# Design Document — GitHub Badge Tracker

## Overview

GitHub Badge Tracker is a Next.js 14 (App Router) web application that lets any visitor enter a GitHub username and receive a comprehensive, visually rich analysis of their GitHub achievement badges. The application orchestrates concurrent calls to GitHub's REST v3, GraphQL v4, and Public Events APIs, processes the raw data through a layered engine pipeline (Analyzer → Badge_Engine → Roadmap_Engine → Score_Engine), and renders the results in a responsive editorial interface.

The design prioritises three concerns in order:

1. **Correctness** — badge evaluation logic must be deterministic, fully tested via property-based tests, and traceable to requirements.
2. **Performance** — the critical path from username submission to first meaningful paint must be ≤ 2.5 s on 4G; heavy features (Compare, Leaderboard, PDF) are code-split.
3. **Extensibility** — all badge definitions live in a typed data file; adding a new badge requires no changes to engine code.

---

## Architecture

### High-Level Data Flow

```
Browser Input
      │
      ▼
 [Input Parser]  ─── URL strip, validation, debounce
      │
      ▼
  [Analyzer]  ─── concurrent fetch (REST + GraphQL + Events)
      │  (caches result in React Query for 5 min)
      ├──────────────────────┬───────────────────────┐
      ▼                      ▼                       ▼
[Badge_Engine]        [Score_Engine]        [Roadmap_Engine]
  badge states          GitHub Score           next badge
  progress %            OSS Score              roadmap steps
  rarity, tiers                                day estimates
      │                      │                       │
      └──────────┬────────────┘                       │
                 ▼                                     │
         [Zustand Store]  ◄──────────────────────────┘
          profileStore
          badgeStore
          compareStore
          leaderboardStore
          uiStore
                 │
                 ▼
       [React Components]
         ProfileSection
         BadgeGrid
         RoadmapPanel
         TimelineView
         StatsPanel
         CompareView (lazy)
         Leaderboard (lazy)
         ShareModal (lazy)
```

### Request Lifecycle

```
User submits username
        │
        ├─ [Input Parser] validates + normalises username
        │
        ├─ React Query checks cache (key: ["profile", username])
        │       ├─ HIT (< 5 min TTL): return cached data immediately
        │       └─ MISS: call Analyzer.analyse(username)
        │                 │
        │                 ├─ Promise.all([
        │                 │     fetchRESTProfile(),
        │                 │     fetchGraphQLStats(),
        │                 │     fetchPublicEvents(),
        │                 │     fetchOrgs()
        │                 │   ])
        │                 │
        │                 └─ normalise → GitHubProfile
        │
        ├─ Badge_Engine.evaluate(profile) → BadgeEvaluation[]
        ├─ Score_Engine.compute(profile)  → ScoreResult
        └─ Roadmap_Engine.generate(evaluations) → RoadmapResult
```


---

## Project Structure

```
badge-hunter/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout — metadata, providers, fonts
│   ├── page.tsx                  # Home page — Hero + Search
│   ├── u/
│   │   └── [username]/
│   │       ├── page.tsx          # Profile page — auto-triggers analysis
│   │       └── opengraph-image.tsx  # Dynamic OG image per user
│   ├── compare/
│   │   └── page.tsx              # Compare Mode
│   ├── leaderboard/
│   │   └── page.tsx              # Leaderboard
│   ├── wrapped/
│   │   └── page.tsx              # GitHub Wrapped view
│   └── api/
│       ├── og/route.ts           # Server-side OG image generation
│       ├── share-card/route.ts   # Share card PNG generation
│       └── sitemap/route.ts      # Dynamic sitemap.xml
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── MobileNav.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── SearchSection.tsx
│   │   ├── ProfileSection.tsx
│   │   ├── BadgeGrid.tsx
│   │   ├── RoadmapPanel.tsx
│   │   ├── TimelineView.tsx
│   │   ├── StatsPanel.tsx
│   │   ├── CompareView.tsx       # lazy-loaded
│   │   ├── Leaderboard.tsx       # lazy-loaded
│   │   └── ShareModal.tsx        # lazy-loaded
│   └── primitives/
│       ├── BadgeCard.tsx
│       ├── ProgressBar.tsx
│       ├── StatCounter.tsx
│       ├── SkeletonCard.tsx
│       ├── ConfettiTrigger.tsx
│       ├── RarityBadge.tsx
│       ├── RoadmapStep.tsx
│       └── TimelineEntry.tsx
│
├── lib/
│   ├── api/
│   │   ├── github-rest.ts        # REST v3 client
│   │   ├── github-graphql.ts     # GraphQL v4 client
│   │   └── github-events.ts      # Public Events API client
│   ├── engines/
│   │   ├── analyzer.ts           # Orchestrates concurrent fetches
│   │   ├── badge-engine.ts       # Badge evaluation
│   │   ├── roadmap-engine.ts     # Roadmap + day estimation
│   │   └── score-engine.ts       # GitHub Score + OSS Score
│   ├── data/
│   │   └── badge-definitions.ts  # All badge configs (typed)
│   ├── services/
│   │   └── share-service.ts      # Canvas card + PDF generation (lazy)
│   ├── store/
│   │   ├── profile-store.ts
│   │   ├── badge-store.ts
│   │   ├── compare-store.ts
│   │   ├── leaderboard-store.ts
│   │   └── ui-store.ts
│   ├── hooks/
│   │   ├── useAnalyze.ts         # React Query wrapper for Analyzer
│   │   ├── useSearchHistory.ts   # localStorage read/write
│   │   ├── useLeaderboard.ts
│   │   └── useReducedMotion.ts
│   └── utils/
│       ├── input-parser.ts       # URL extraction, validation
│       ├── formatters.ts         # Number formatting, date utils
│       └── animation-variants.ts # Framer Motion variant maps
│
├── types/
│   └── index.ts                  # All shared TypeScript types
│
├── public/
│   ├── badges/                   # Badge icon assets (SVG)
│   └── robots.txt
│
└── tests/
    ├── unit/
    │   ├── input-parser.test.ts
    │   ├── badge-engine.test.ts
    │   ├── score-engine.test.ts
    │   └── formatters.test.ts
    └── property/
        ├── input-parser.prop.ts
        ├── badge-engine.prop.ts
        ├── score-engine.prop.ts
        ├── roadmap-engine.prop.ts
        └── search-history.prop.ts
```


---

## Data Models

### Core TypeScript Types

```typescript
// types/index.ts

// ── Input & Parsing ──────────────────────────────────────────────────────────

export interface ParsedInput {
  raw: string;
  username: string | null;
  error: 'EMPTY' | 'INVALID_FORMAT' | null;
}

// ── GitHub API response shapes ────────────────────────────────────────────────

export interface GitHubRESTUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  created_at: string;         // ISO 8601
  followers: number;
  following: number;
  public_repos: number;
}

export interface GitHubGraphQLStats {
  totalCommitContributions: number;
  totalPullRequestContributions: number;
  totalIssueContributions: number;
  totalRepositoryContributions: number;
  totalDiscussionContributions: number;
  starsReceived: number;
  forksReceived: number;
  mergedPRsOnExternalRepos: number;
  contributorsToUserRepos: number;
  languages: LanguageEntry[];
  totalGists: number;
  totalPackages: number;
}

export interface LanguageEntry {
  name: string;
  bytes: number;
  color: string;
}

export interface GitHubEvent {
  type: string;
  created_at: string;         // ISO 8601
  repo: { name: string };
  payload: Record<string, unknown>;
}

export interface GitHubOrg {
  login: string;
  avatar_url: string;
}

// ── Normalised profile (post-Analyzer) ───────────────────────────────────────

export interface GitHubProfile {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  createdAt: Date;
  accountAgeYears: number;
  followers: number;
  following: number;
  publicRepos: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalDiscussions: number;
  totalGists: number;
  totalPackages: number;
  starsReceived: number;
  forksReceived: number;
  mergedExternalPRs: number;
  contributorsToRepos: number;
  organizations: GitHubOrg[];
  languages: LanguageEntry[];
  recentEvents: GitHubEvent[];
  fetchedAt: Date;
}
```


```typescript
// ── Badge types ───────────────────────────────────────────────────────────────

export type BadgeTier = 'Bronze' | 'Silver' | 'Gold' | 'None';
export type BadgeRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Secret';
export type BadgeStatus = 'Unlocked' | 'Locked' | 'InProgress';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface ChecklistItem {
  id: string;
  label: string;
  met: boolean;
}

export interface BadgeDefinition {
  id: string;                          // e.g. 'pull-shark'
  name: string;
  description: string;
  iconPath: string;                    // path under public/badges/
  rarity: BadgeRarity;
  tiers: BadgeTierDefinition[];
  difficulty: Difficulty;
  checklistItems: ChecklistItemDefinition[];
  metricKey: keyof GitHubProfile;      // which profile field drives progress
  secret: boolean;
}

export interface BadgeTierDefinition {
  tier: BadgeTier;
  threshold: number;
}

export interface ChecklistItemDefinition {
  id: string;
  label: string;
  evaluate: (profile: GitHubProfile) => boolean;
}

export interface BadgeEvaluation {
  definition: BadgeDefinition;
  status: BadgeStatus;
  currentValue: number;
  threshold: number;                   // threshold for the next tier
  progress: number;                    // 0–100
  currentTier: BadgeTier;
  nextTier: BadgeTier | null;
  earnedAt: Date | null;
  checklistItems: ChecklistItem[];
  checklistCompletion: number;         // 0–100
}

// ── Score types ────────────────────────────────────────────────────────────────

export interface ScoreResult {
  githubScore: number;                 // clamped 0–10000
  openSourceScore: number;             // clamped 0–10000
}

// ── Roadmap types ─────────────────────────────────────────────────────────────

export interface RoadmapStep {
  id: string;
  action: string;
  targetBadgeId: string;
  estimatedDays: number;
  difficulty: Difficulty;
  completed: boolean;
}

export interface RoadmapResult {
  nextBadge: BadgeEvaluation;
  steps: RoadmapStep[];               // ≤ 10, sorted ascending by estimatedDays
  totalEstimatedDays: number;
  estimatedCompletionDate: Date;
  activityRate: number | null;        // daily event rate; null if < 10 events
}

// ── Leaderboard types ─────────────────────────────────────────────────────────

export type LeaderboardTab = 'mostBadges' | 'fastestGrowth' | 'mostContributions' | 'mostPRs';

export interface LeaderboardEntry {
  username: string;
  avatarUrl: string;
  badgeCount: number;
  badgesLast30Days: number;
  totalContributions: number;
  totalPRs: number;
  trend: 'up' | 'down' | 'new';
  rank: number;
}

// ── Search History types ──────────────────────────────────────────────────────

export interface SearchHistoryEntry {
  username: string;
  analyzedAt: string;                  // ISO 8601
}
```


---

## Components and Interfaces

### Badge Definitions Data Schema

All badge definitions are stored as a typed constant array in `lib/data/badge-definitions.ts`. Adding a new badge only requires appending a new `BadgeDefinition` object — no engine changes are needed.

```typescript
// lib/data/badge-definitions.ts  (excerpt — 14 core badges shown)

import type { BadgeDefinition } from '@/types';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'pair-extraordinaire',
    name: 'Pair Extraordinaire',
    description: 'Coauthored commits on merged pull requests.',
    iconPath: '/badges/pair-extraordinaire.svg',
    rarity: 'Rare',
    difficulty: 'Medium',
    secret: false,
    metricKey: 'totalPRs',
    tiers: [
      { tier: 'Bronze', threshold: 10 },
      { tier: 'Silver', threshold: 24 },
      { tier: 'Gold',   threshold: 48 },
    ],
    checklistItems: [
      { id: 'pe-1', label: 'Co-authored at least 1 merged PR', evaluate: (p) => p.totalPRs >= 1 },
      { id: 'pe-2', label: '10+ co-authored merged PRs (Bronze)', evaluate: (p) => p.totalPRs >= 10 },
    ],
  },
  {
    id: 'pull-shark',
    name: 'Pull Shark',
    description: 'Opened pull requests that have been merged.',
    iconPath: '/badges/pull-shark.svg',
    rarity: 'Rare',
    difficulty: 'Easy',
    secret: false,
    metricKey: 'totalPRs',
    tiers: [
      { tier: 'Bronze', threshold: 2 },
      { tier: 'Silver', threshold: 16 },
      { tier: 'Gold',   threshold: 128 },
    ],
    checklistItems: [
      { id: 'ps-1', label: '2+ merged PRs (Bronze)',   evaluate: (p) => p.totalPRs >= 2   },
      { id: 'ps-2', label: '16+ merged PRs (Silver)',  evaluate: (p) => p.totalPRs >= 16  },
      { id: 'ps-3', label: '128+ merged PRs (Gold)',   evaluate: (p) => p.totalPRs >= 128 },
    ],
  },
  {
    id: 'starstruck',
    name: 'Starstruck',
    description: 'Created a repository that has many stars.',
    iconPath: '/badges/starstruck.svg',
    rarity: 'Rare',
    difficulty: 'Hard',
    secret: false,
    metricKey: 'starsReceived',
    tiers: [
      { tier: 'Bronze', threshold: 16  },
      { tier: 'Silver', threshold: 128 },
      { tier: 'Gold',   threshold: 512 },
    ],
    checklistItems: [
      { id: 'ss-1', label: '16+ stars on a single repo (Bronze)',  evaluate: (p) => p.starsReceived >= 16  },
      { id: 'ss-2', label: '128+ stars on a single repo (Silver)', evaluate: (p) => p.starsReceived >= 128 },
      { id: 'ss-3', label: '512+ stars on a single repo (Gold)',   evaluate: (p) => p.starsReceived >= 512 },
    ],
  },
  {
    id: 'galaxy-brain',
    name: 'Galaxy Brain',
    description: 'Answered a discussion with an accepted answer.',
    iconPath: '/badges/galaxy-brain.svg',
    rarity: 'Epic',
    difficulty: 'Medium',
    secret: false,
    metricKey: 'totalDiscussions',
    tiers: [
      { tier: 'Bronze', threshold: 2  },
      { tier: 'Silver', threshold: 8  },
      { tier: 'Gold',   threshold: 16 },
    ],
    checklistItems: [
      { id: 'gb-1', label: '2+ accepted discussion answers',  evaluate: (p) => p.totalDiscussions >= 2  },
      { id: 'gb-2', label: '8+ accepted discussion answers',  evaluate: (p) => p.totalDiscussions >= 8  },
      { id: 'gb-3', label: '16+ accepted discussion answers', evaluate: (p) => p.totalDiscussions >= 16 },
    ],
  },
  {
    id: 'quickdraw',
    name: 'Quickdraw',
    description: 'Closed an issue or pull request within 5 minutes of opening.',
    iconPath: '/badges/quickdraw.svg',
    rarity: 'Common',
    difficulty: 'Easy',
    secret: false,
    metricKey: 'totalPRs',
    tiers: [{ tier: 'None', threshold: 1 }],
    checklistItems: [
      { id: 'qd-1', label: 'Closed an issue/PR within 5 min', evaluate: (p) => p.totalPRs >= 1 },
    ],
  },
  {
    id: 'yolo',
    name: 'YOLO',
    description: 'Merged a pull request without a review.',
    iconPath: '/badges/yolo.svg',
    rarity: 'Common',
    difficulty: 'Easy',
    secret: false,
    metricKey: 'totalPRs',
    tiers: [{ tier: 'None', threshold: 1 }],
    checklistItems: [
      { id: 'yolo-1', label: 'Merged at least 1 PR without review', evaluate: (p) => p.totalPRs >= 1 },
    ],
  },
  {
    id: 'arctic-code-vault',
    name: 'Arctic Code Vault Contributor',
    description: 'Contributed code to repositories in the 2020 GitHub Archive Program.',
    iconPath: '/badges/arctic-code-vault.svg',
    rarity: 'Legendary',
    difficulty: 'Hard',
    secret: false,
    metricKey: 'totalCommits',
    tiers: [{ tier: 'None', threshold: 1 }],
    checklistItems: [
      { id: 'acv-1', label: 'Committed to an archived repo before 2020-02-02', evaluate: (p) => p.accountAgeYears >= 4 },
    ],
  },
  {
    id: 'public-sponsor',
    name: 'Public Sponsor',
    description: 'Sponsored an open source contributor through GitHub Sponsors.',
    iconPath: '/badges/public-sponsor.svg',
    rarity: 'Legendary',
    difficulty: 'Medium',
    secret: false,
    metricKey: 'totalPRs',
    tiers: [{ tier: 'None', threshold: 1 }],
    checklistItems: [
      { id: 'spon-1', label: 'At least 1 active GitHub Sponsorship', evaluate: (p) => p.followers >= 0 },
    ],
  },
  {
    id: 'mars-2020',
    name: 'Mars 2020 Helicopter Contributor',
    description: 'Contributed to a repository used in the Mars 2020 Helicopter Mission.',
    iconPath: '/badges/mars-2020.svg',
    rarity: 'Legendary',
    difficulty: 'Hard',
    secret: false,
    metricKey: 'totalCommits',
    tiers: [{ tier: 'None', threshold: 1 }],
    checklistItems: [
      { id: 'mars-1', label: 'Contributed to a NASA Mars 2020 dependency', evaluate: (p) => p.accountAgeYears >= 3 },
    ],
  },
  {
    id: 'dev-program-member',
    name: 'Developer Program Member',
    description: 'Registered member of the GitHub Developer Program.',
    iconPath: '/badges/dev-program.svg',
    rarity: 'Common',
    difficulty: 'Easy',
    secret: false,
    metricKey: 'totalPRs',
    tiers: [{ tier: 'None', threshold: 1 }],
    checklistItems: [
      { id: 'dev-1', label: 'Registered in GitHub Developer Program', evaluate: (p) => p.publicRepos >= 1 },
    ],
  },
  {
    id: 'open-source-contributor',
    name: 'Open Source Contributor',
    description: 'Contributed to open source projects (Heart on Your Sleeve).',
    iconPath: '/badges/heart-on-sleeve.svg',
    rarity: 'Common',
    difficulty: 'Easy',
    secret: false,
    metricKey: 'mergedExternalPRs',
    tiers: [{ tier: 'None', threshold: 1 }],
    checklistItems: [
      { id: 'oss-1', label: '1+ merged PR on an external repository', evaluate: (p) => p.mergedExternalPRs >= 1 },
    ],
  },
  {
    id: 'achievement-hunter',
    name: 'Achievement Hunter',
    description: 'Unlocked multiple GitHub achievement badges.',
    iconPath: '/badges/achievement-hunter.svg',
    rarity: 'Rare',
    difficulty: 'Medium',
    secret: false,
    metricKey: 'totalPRs',
    tiers: [{ tier: 'None', threshold: 5 }],
    checklistItems: [
      { id: 'ah-1', label: '5+ badges unlocked', evaluate: (p) => p.totalPRs >= 5 },
    ],
  },
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Joined GitHub early — before it reached 1 million users.',
    iconPath: '/badges/early-adopter.svg',
    rarity: 'Common',
    difficulty: 'Easy',
    secret: false,
    metricKey: 'accountAgeYears',
    tiers: [{ tier: 'None', threshold: 1 }],
    checklistItems: [
      { id: 'ea-1', label: 'GitHub account created before 2011', evaluate: (p) => p.accountAgeYears >= 13 },
    ],
  },
  {
    id: 'secret-badge-1',
    name: '??? Secret Badge',
    description: 'Unlock criteria are not publicly disclosed.',
    iconPath: '/badges/secret.svg',
    rarity: 'Secret',
    difficulty: 'Hard',
    secret: true,
    metricKey: 'totalCommits',
    tiers: [{ tier: 'None', threshold: 1 }],
    checklistItems: [],
  },
];
```


---

## Core Subsystems

### 1. Input Parser (`lib/utils/input-parser.ts`)

Responsible for URL stripping, character validation, and debounce logic.

```typescript
// lib/utils/input-parser.ts

const VALID_USERNAME_RE = /^[a-zA-Z0-9\-]{1,39}$/;
const GITHUB_URL_RE = /^(?:https?:\/\/)?github\.com\/([a-zA-Z0-9\-]{1,39})\/?$/;

export function parseInput(raw: string): ParsedInput {
  const trimmed = raw.trim();

  if (trimmed === '') {
    return { raw, username: null, error: 'EMPTY' };
  }

  // Try URL form first
  const urlMatch = trimmed.match(GITHUB_URL_RE);
  if (urlMatch) {
    return { raw, username: urlMatch[1], error: null };
  }

  // Bare username
  if (VALID_USERNAME_RE.test(trimmed)) {
    return { raw, username: trimmed, error: null };
  }

  return { raw, username: null, error: 'INVALID_FORMAT' };
}

// Error messages as constants (referenced in tests)
export const INPUT_ERRORS = {
  EMPTY: 'Please enter a GitHub username or profile URL',
  INVALID_FORMAT: 'Invalid GitHub username format',
} as const;
```

### 2. Analyzer (`lib/engines/analyzer.ts`)

Orchestrates concurrent GitHub API calls and returns a normalised `GitHubProfile`.

```typescript
// lib/engines/analyzer.ts

export class Analyzer {
  async analyse(username: string): Promise<GitHubProfile> {
    const [restUser, graphqlStats, events, orgs] = await Promise.all([
      fetchRESTProfile(username),       // GET /users/{username}
      fetchGraphQLStats(username),      // GraphQL contributionsCollection + repos
      fetchPublicEvents(username),      // GET /users/{username}/events/public?per_page=100 (3 pages)
      fetchOrgs(username),              // GET /users/{username}/orgs
    ]);

    return normalise(restUser, graphqlStats, events, orgs);
  }
}

// Normalise merges all API responses into a single GitHubProfile
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
    totalCommits: gql.totalCommitContributions,
    totalPRs: gql.totalPullRequestContributions,
    totalIssues: gql.totalIssueContributions,
    totalDiscussions: gql.totalDiscussionContributions,
    totalGists: gql.totalGists,
    totalPackages: gql.totalPackages,
    starsReceived: gql.starsReceived,
    forksReceived: gql.forksReceived,
    mergedExternalPRs: gql.mergedPRsOnExternalRepos,
    contributorsToRepos: gql.contributorsToUserRepos,
    organizations: orgs,
    languages: computeTopLanguages(gql.languages),
    recentEvents: events,
    fetchedAt: now,
  };
}
```

**Error Handling**: The analyzer wraps each `Promise.all` leg in individual try/catch blocks. HTTP 404 maps to `GBT_ERR_NOT_FOUND`; HTTP 403/429 maps to `GBT_ERR_RATE_LIMITED`. Both are surfaced as `AnalyzerError` objects with a `code` and `message` field.

**Caching**: The Analyzer itself is stateless. Caching is handled by React Query (key: `["profile", username]`, stale time: 5 minutes). A singleton in-memory Map at the `useAnalyze` hook layer prevents duplicate in-flight requests for the same username.


### 3. Badge Engine (`lib/engines/badge-engine.ts`)

Evaluates every `BadgeDefinition` against a `GitHubProfile` and returns a `BadgeEvaluation[]`.

```typescript
// lib/engines/badge-engine.ts

import { BADGE_DEFINITIONS } from '@/lib/data/badge-definitions';

export class BadgeEngine {
  evaluate(profile: GitHubProfile): BadgeEvaluation[] {
    return BADGE_DEFINITIONS.map((def) => this.evaluateOne(def, profile));
  }

  private evaluateOne(def: BadgeDefinition, profile: GitHubProfile): BadgeEvaluation {
    const currentValue = profile[def.metricKey] as number;

    // Determine highest earned tier and next tier threshold
    const earnedTiers = def.tiers.filter((t) => currentValue >= t.threshold);
    const currentTier: BadgeTier = earnedTiers.at(-1)?.tier ?? 'None';
    const nextTierDef = def.tiers.find((t) => currentValue < t.threshold) ?? null;
    const threshold = nextTierDef?.threshold ?? def.tiers.at(-1)!.threshold;

    // Progress: ratio toward next tier, clamped 0–100
    const progress = nextTierDef
      ? Math.min(100, Math.max(0, (currentValue / threshold) * 100))
      : 100;

    const status: BadgeStatus =
      progress === 100 ? 'Unlocked' : currentValue > 0 ? 'InProgress' : 'Locked';

    // Evaluate checklist
    const checklistItems: ChecklistItem[] = def.checklistItems.map((ci) => ({
      id: ci.id,
      label: ci.label,
      met: ci.evaluate(profile),
    }));

    const checklistCompletion =
      checklistItems.length > 0
        ? Math.round((checklistItems.filter((c) => c.met).length / checklistItems.length) * 100)
        : 0;

    return {
      definition: def,
      status,
      currentValue,
      threshold,
      progress,
      currentTier,
      nextTier: nextTierDef?.tier ?? null,
      earnedAt: null,           // set by Analyzer if derivable from events
      checklistItems,
      checklistCompletion,
    };
  }
}
```

### 4. Score Engine (`lib/engines/score-engine.ts`)

Pure arithmetic computation — trivially testable and highly cacheable.

```typescript
// lib/engines/score-engine.ts

const GITHUB_SCORE_MAX = 10_000;
const OSS_SCORE_MAX    = 10_000;

export class ScoreEngine {
  compute(profile: GitHubProfile): ScoreResult {
    const githubScore = Math.min(
      GITHUB_SCORE_MAX,
      profile.totalCommits    * 1 +
      profile.totalPRs        * 3 +
      profile.totalIssues     * 2 +
      profile.starsReceived   * 2 +
      profile.followers       * 1 +
      profile.organizations.length * 5,
    );

    const openSourceScore = Math.min(
      OSS_SCORE_MAX,
      profile.mergedExternalPRs   * 5 +
      profile.forksReceived       * 3 +
      profile.contributorsToRepos * 2,
    );

    return { githubScore, openSourceScore };
  }
}
```

### 5. Roadmap Engine (`lib/engines/roadmap-engine.ts`)

Identifies the Next Badge and generates ≤ 10 ordered action steps.

```typescript
// lib/engines/roadmap-engine.ts

export class RoadmapEngine {
  generate(evaluations: BadgeEvaluation[], events: GitHubEvent[]): RoadmapResult {
    // 1. Filter to locked/in-progress, sort by progress desc
    const candidates = evaluations
      .filter((e) => e.status !== 'Unlocked')
      .sort((a, b) => b.progress - a.progress);

    const nextBadge = candidates[0];
    const top3 = candidates.slice(0, 3);

    // 2. Compute daily activity rate from 90-day event window
    const activityRate = this.computeActivityRate(events);

    // 3. Generate steps for top 3 locked badges
    const steps: RoadmapStep[] = top3.flatMap((badge) =>
      this.stepsForBadge(badge, activityRate),
    ).slice(0, 10);

    // 4. Sort by estimated days ascending
    steps.sort((a, b) => a.estimatedDays - b.estimatedDays);

    const totalEstimatedDays = steps.reduce((sum, s) => sum + s.estimatedDays, 0);
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + totalEstimatedDays);

    return { nextBadge, steps, totalEstimatedDays, estimatedCompletionDate, activityRate };
  }

  private computeActivityRate(events: GitHubEvent[]): number | null {
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - 90);

    const windowEvents = events.filter(
      (e) => new Date(e.created_at) >= windowStart,
    );

    if (windowEvents.length < 10) return null;

    return windowEvents.length / 90;  // events per day
  }

  private stepsForBadge(badge: BadgeEvaluation, rate: number | null): RoadmapStep[] {
    const remaining = badge.threshold - badge.currentValue;
    const estimatedDays = rate
      ? Math.ceil(remaining / rate)
      : 30;  // default fallback

    return [{
      id: `${badge.definition.id}-main`,
      action: buildActionDescription(badge, remaining),
      targetBadgeId: badge.definition.id,
      estimatedDays,
      difficulty: badge.definition.difficulty,
      completed: false,
    }];
  }
}

function buildActionDescription(badge: BadgeEvaluation, remaining: number): string {
  return `${remaining} more ${badge.definition.metricKey.replace(/total|s$/gi, '').toLowerCase()}s ` +
         `needed to unlock ${badge.definition.name}`;
}
```


---

## State Management

### Zustand Store Design

Each store is a self-contained Zustand slice with optional localStorage persistence via `zustand/middleware/persist`.

```typescript
// lib/store/profile-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProfileState {
  profile: GitHubProfile | null;
  evaluations: BadgeEvaluation[];
  scores: ScoreResult | null;
  roadmap: RoadmapResult | null;
  loading: boolean;
  error: string | null;
  setProfile: (p: GitHubProfile) => void;
  setEvaluations: (e: BadgeEvaluation[]) => void;
  setScores: (s: ScoreResult) => void;
  setRoadmap: (r: RoadmapResult) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      evaluations: [],
      scores: null,
      roadmap: null,
      loading: false,
      error: null,
      setProfile: (profile) => set({ profile }),
      setEvaluations: (evaluations) => set({ evaluations }),
      setScores: (scores) => set({ scores }),
      setRoadmap: (roadmap) => set({ roadmap }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      reset: () => set({ profile: null, evaluations: [], scores: null, roadmap: null }),
    }),
    { name: 'gbt_profile_cache', partialize: (s) => ({ profile: s.profile }) },
  ),
);
```

```typescript
// lib/store/ui-store.ts  — ephemeral, no persistence

interface UIState {
  activeTab: LeaderboardTab;
  compareUsernameB: string;
  shareModalOpen: boolean;
  rpgModeEnabled: boolean;
  setActiveTab: (t: LeaderboardTab) => void;
  setCompareUsernameB: (u: string) => void;
  setShareModalOpen: (v: boolean) => void;
  toggleRPGMode: () => void;
}
```

### localStorage Keys

| Key | Store | Content | Limit |
|-----|-------|---------|-------|
| `gbt_search_history` | `useSearchHistory` | `SearchHistoryEntry[]` | 20 entries |
| `gbt_favorites` | profile-store | `string[]` (usernames) | unlimited |
| `gbt_bookmarks` | profile-store | `Record<username, GitHubProfile>` | by username |
| `gbt_profile_cache` | profile-store | last fetched `GitHubProfile` | 1 entry |

---

## Routing

### Next.js App Router Pages

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Hero section + Search bar + marketing copy |
| `/u/[username]` | `app/u/[username]/page.tsx` | Full profile analysis view |
| `/compare` | `app/compare/page.tsx` | Side-by-side comparison; lazy-loads CompareView |
| `/leaderboard` | `app/leaderboard/page.tsx` | Ranked table; lazy-loads Leaderboard |
| `/wrapped` | `app/wrapped/page.tsx` | GitHub Wrapped summary view |

### Dynamic OG Images

Each `/u/[username]` route exposes an adjacent `opengraph-image.tsx` using Next.js's `ImageResponse` API. The image is generated server-side on first request and cached by Vercel's CDN.

```typescript
// app/u/[username]/opengraph-image.tsx

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };

export default async function Image({ params }: { params: { username: string } }) {
  // Minimal fetch — avatar + badge count only for speed
  return new ImageResponse(
    <OGShareCard username={params.username} />,
    { ...size },
  );
}
```

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/og` | GET | Root OG image (static branding) |
| `/api/share-card` | GET `?username=` | Server-rendered 1200×630 PNG share card |
| `/api/sitemap` | GET | Generates `sitemap.xml` from session-analyzed usernames |
| `/robots.txt` | static | Permit all crawlers |


---

## Data Layer

### GitHub API Clients

#### REST Client (`lib/api/github-rest.ts`)

```typescript
const BASE = 'https://api.github.com';

async function ghFetch<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate: 300 },  // Next.js fetch cache 5 min
  });

  if (res.status === 404) throw new AnalyzerError('GBT_ERR_NOT_FOUND', res.status);
  if (res.status === 403 || res.status === 429) throw new AnalyzerError('GBT_ERR_RATE_LIMITED', res.status);
  if (!res.ok) throw new AnalyzerError('GBT_ERR_UNKNOWN', res.status);

  return res.json() as Promise<T>;
}

export const fetchRESTProfile = (u: string) =>
  ghFetch<GitHubRESTUser>(`/users/${u}`);

export const fetchOrgs = (u: string) =>
  ghFetch<GitHubOrg[]>(`/users/${u}/orgs`);
```

#### GraphQL Client (`lib/api/github-graphql.ts`)

```typescript
const GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

const STATS_QUERY = `
  query UserStats($login: String!) {
    user(login: $login) {
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalRepositoryContributions
      }
      repositories(first: 100, ownerAffiliations: OWNER) {
        nodes {
          stargazerCount
          forkCount
          primaryLanguage { name color }
          languages(first: 10) { edges { size node { name color } } }
        }
      }
      gists { totalCount }
      packages { totalCount }
    }
  }
`;
```

#### Events Client (`lib/api/github-events.ts`)

Fetches up to 3 pages × 100 events (GitHub's API max per-page is 100, max 10 pages):

```typescript
export async function fetchPublicEvents(username: string): Promise<GitHubEvent[]> {
  const pages = await Promise.all(
    [1, 2, 3].map((page) =>
      ghFetch<GitHubEvent[]>(`/users/${username}/events/public?per_page=100&page=${page}`)
        .catch(() => [] as GitHubEvent[])  // missing pages return empty array
    ),
  );
  return pages.flat();
}
```

### Caching Strategy

```
Request arrives for username "torvalds"
          │
          ▼
React Query cache lookup (key: ["profile", "torvalds"])
          │
   ┌──────┴──────┐
   │             │
  HIT           MISS
  < 5 min       > 5 min / not present
   │             │
   │        in-flight Map check
   │         ┌───┴───┐
   │        YES      NO
   │         │        │
   │    return same   start new fetch
   │    Promise       store in Map
   │         │        │
   └────────►▼        │
     return cached    │
     data immediately │
                      ▼
               Analyzer.analyse()
               store result in
               React Query cache
               + remove from Map
```

**Stale-while-revalidate**: React Query's `staleTime: 5 * 60 * 1000` shows cached data instantly on re-analysis while a background refresh runs. `cacheTime` is set to `10 * 60 * 1000` to keep data in memory longer.

---

## Component Architecture

### Layout Components

```typescript
// components/layout/Header.tsx
// Props: none — reads uiStore for RPG mode toggle state
// Renders: Logo | Nav links | RPG toggle | Theme switcher | Mobile hamburger

// components/layout/MobileNav.tsx
// Props: isOpen: boolean; onClose: () => void
// Renders: Full-screen overlay nav for viewports < 768px
// Triggered by hamburger button in Header
```

### Page Sections

#### `ProfileSection`

```typescript
interface ProfileSectionProps {
  profile: GitHubProfile;
  scores: ScoreResult;
}
// Renders: Avatar | Name | Username | Bio | Account age
//          StatCounter row (followers, repos, commits, PRs, etc.)
//          Language distribution bar chart (Recharts)
```

#### `BadgeGrid`

```typescript
interface BadgeGridProps {
  evaluations: BadgeEvaluation[];
  rpgMode: boolean;
}
// Renders: "Unlocked Badges" section header → BadgeCard[] (unlocked)
//          "Locked Badges"   section header → BadgeCard[] (locked/in-progress)
// Viewport-based card reveal: Framer Motion whileInView
```

#### `BadgeCard`

```typescript
interface BadgeCardProps {
  evaluation: BadgeEvaluation;
  rpgMode: boolean;
  onUnlock?: () => void;    // triggers confetti
}
// Renders:
//   - Badge icon (lazy-loaded img)
//   - Name + tier label (or RPG rank label)
//   - RarityBadge indicator
//   - ProgressBar (animated 0 → progress on mount)
//   - Status pill (Unlocked / In Progress / Locked)
//   - Checklist (collapsed by default, expandable)
//   - Earned date or lock icon
```

#### `RoadmapPanel`

```typescript
interface RoadmapPanelProps {
  roadmap: RoadmapResult;
  rpgMode: boolean;
}
// Renders: Next Badge card | Ordered RoadmapStep list | Total estimated days
```

#### `TimelineView`

```typescript
interface TimelineViewProps {
  evaluations: BadgeEvaluation[];
  roadmap: RoadmapResult;
}
// Groups earned badges by year (descending), renders TimelineEntry per badge
// Appends "Upcoming Badges" subsection for top-3 locked
```

#### `StatsPanel`

```typescript
interface StatsPanelProps {
  evaluations: BadgeEvaluation[];
  scores: ScoreResult;
  roadmap: RoadmapResult;
}
// Renders: 9 StatCounter cells + Estimated Completion date
```

### Primitive Components

```typescript
// ProgressBar
interface ProgressBarProps {
  value: number;      // 0–100
  color?: string;     // defaults to rarity color
  animated?: boolean; // default true
  height?: number;    // px, default 6
}

// StatCounter
interface StatCounterProps {
  value: number;
  label: string;
  duration?: number;  // ms, default 800
  format?: (n: number) => string;
}

// SkeletonCard
interface SkeletonCardProps {
  variant: 'badge' | 'profile' | 'stat' | 'roadmap';
}

// ConfettiTrigger
interface ConfettiTriggerProps {
  trigger: boolean;
  origin?: { x: number; y: number };
}

// RarityBadge
interface RarityBadgeProps {
  rarity: BadgeRarity;
  size?: 'sm' | 'md';
}
```


---

## Animation System

### Framer Motion Variants (`lib/utils/animation-variants.ts`)

```typescript
import { Variants } from 'framer-motion';

export const fadeSlideUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

export const fadeSlideLeft: Variants = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.3, ease: 'easeOut' } },
};

export const heroStagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.15 } },
};

export const counterFade: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const rarityPulse: Variants = {
  animate: {
    boxShadow: [
      '0 0 0px 0px rgba(15,23,42,0)',
      '0 0 12px 4px rgba(15,23,42,0.7)',
      '0 0 0px 0px rgba(15,23,42,0)',
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const legendaryShimmer: Variants = {
  animate: {
    backgroundPosition: ['200% center', '-200% center'],
    transition: { duration: 3, repeat: Infinity, ease: 'linear' },
  },
};
```

### `useReducedMotion` Hook

```typescript
// lib/hooks/useReducedMotion.ts
import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}
```

All animated components gate their animation props behind `useReducedMotion`:

```typescript
const reducedMotion = useReducedMotion();

<motion.div
  variants={reducedMotion ? undefined : fadeSlideUp}
  initial="hidden"
  animate="visible"
/>
```

### Animation Timing Reference

| Animation | Duration | Trigger |
|-----------|----------|---------|
| Hero heading fade-slide | 200 ms | Mount (0 ms delay) |
| Hero subheading fade-slide | 200 ms | Mount (150 ms delay) |
| Badge card fade-translate-up | 200 ms | Enter viewport |
| Progress bar fill | 600 ms | Mount |
| Stat counter increment | 800 ms | Mount |
| Badge card hover lift | 150 ms | Pointer enter |
| Timeline year group fade-slide-left | 300 ms | Enter viewport |
| Badge unlock radial glow | 1500 ms | Status change → Unlocked |
| Secret badge pulsing glow | 2000 ms period | Always (Legendary/Secret) |
| Legendary shimmer sweep | 3000 ms period | Always |

---

## Responsive Design

### Tailwind Breakpoint Grid System

| Breakpoint | Min Width | Badge Grid Cols | Stats Grid Cols | Sidebar |
|------------|-----------|-----------------|-----------------|---------|
| default | 320px | 1 | 1 | hidden |
| `sm:` | 640px | 2 | 2 | hidden |
| `md:` | 768px | 2 | 3 | compare stacked → side-by-side |
| `lg:` | 1024px | 3 | 4 | visible |
| `xl:` | 1280px | 4 | 4 | wider |
| `2xl:` | 1536px | 4 | 6 | full |

### Key Responsive Patterns

```tsx
// Badge grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

// Compare view
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

// Stats panel
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-4">

// Navigation collapse
<nav className="hidden md:flex">  // desktop nav
<button className="md:hidden">   // hamburger trigger

// Touch targets on mobile
<button className="min-h-[44px] min-w-[44px] md:min-h-fit md:min-w-fit">
```

---

## SEO

### Metadata Configuration

```typescript
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GitHub Badge Tracker — Track your GitHub achievements and unlock your next badge.',
  description: 'Analyse any GitHub profile, track badge progress, generate a personalised unlock roadmap, and compare with peers.',
  openGraph: {
    type: 'website',
    url: 'https://githubbadgetracker.com',
    title: 'GitHub Badge Tracker',
    description: 'Track GitHub achievement badges and unlock your next one.',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitHub Badge Tracker',
    description: 'Track GitHub achievement badges and unlock your next one.',
    images: ['/api/og'],
  },
};

// app/u/[username]/page.tsx — per-user dynamic metadata
export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const username = params.username;
  return {
    title: `${username} — GitHub Badge Tracker`,
    openGraph: {
      title: `${username}'s GitHub Badge Progress`,
      images: [{ url: `/api/share-card?username=${username}`, width: 1200, height: 630 }],
      url: `https://githubbadgetracker.com/u/${username}`,
    },
    twitter: {
      images: [`/api/share-card?username=${username}`],
    },
  };
}
```

### JSON-LD Structured Data

```typescript
// app/page.tsx — injected via <Script> or next/head
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'GitHub Badge Tracker',
  url: 'https://githubbadgetracker.com',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'All',
  description: 'Track and analyse GitHub achievement badges for any public profile.',
};
```


---

## Share Service (`lib/services/share-service.ts`)

Loaded only via dynamic import to keep the initial bundle small.

```typescript
// Lazy-loaded: import('@/lib/services/share-service')

export async function generateShareCardCanvas(
  profile: GitHubProfile,
  evaluations: BadgeEvaluation[],
  scores: ScoreResult,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width  = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, 1200, 630);

  // Avatar (fetched via proxy to avoid CORS)
  const img = await loadImage(`/api/proxy-avatar?url=${encodeURIComponent(profile.avatarUrl)}`);
  ctx.drawImage(img, 60, 60, 120, 120);

  // Name + username
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 40px Inter, sans-serif';
  ctx.fillText(profile.name, 200, 110);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '28px Inter, sans-serif';
  ctx.fillText(`@${profile.username}`, 200, 150);

  // Badge count
  const unlocked = evaluations.filter((e) => e.status === 'Unlocked').length;
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 72px Inter, sans-serif';
  ctx.fillText(String(unlocked), 60, 340);
  ctx.font = '28px Inter, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('badges unlocked', 60, 380);

  // Top 3 badges (icons)
  const top3 = evaluations.filter((e) => e.status === 'Unlocked').slice(0, 3);
  for (let i = 0; i < top3.length; i++) {
    const badgeImg = await loadImage(top3[i].definition.iconPath);
    ctx.drawImage(badgeImg, 60 + i * 140, 420, 100, 100);
  }

  // GitHub Score
  ctx.fillStyle = '#22C55E';
  ctx.font = 'bold 32px Inter, sans-serif';
  ctx.fillText(`GitHub Score: ${scores.githubScore.toLocaleString()}`, 700, 420);

  // Branding
  ctx.fillStyle = '#475569';
  ctx.font = '20px Inter, sans-serif';
  ctx.fillText('githubbadgetracker.com', 60, 600);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
}

export async function generatePDF(
  profile: GitHubProfile,
  evaluations: BadgeEvaluation[],
  roadmap: RoadmapResult,
): Promise<void> {
  // jsPDF is also lazy-loaded to keep initial bundle small
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
  // ... page layout omitted for brevity
  doc.save(`${profile.username}-github-badge-report.pdf`);
}
```

---

## Performance Strategy

### Code Splitting

Heavy features are loaded with `next/dynamic` only when first accessed:

```typescript
// components/sections/CompareView.tsx
const CompareView = dynamic(() => import('@/components/sections/CompareView'), {
  loading: () => <SkeletonCard variant="profile" />,
  ssr: false,
});

// Same pattern for: Leaderboard, ShareModal, PDF generation, Recharts, Chart.js
```

### Request Deduplication

```typescript
// lib/hooks/useAnalyze.ts

const inFlight = new Map<string, Promise<GitHubProfile>>();

export function useAnalyze(username: string | null) {
  return useQuery({
    queryKey: ['profile', username],
    staleTime: 5 * 60 * 1000,
    enabled: !!username,
    queryFn: async () => {
      if (!username) throw new Error('No username');

      if (inFlight.has(username)) {
        return inFlight.get(username)!;
      }

      const promise = new Analyzer().analyse(username).finally(() => {
        inFlight.delete(username);
      });

      inFlight.set(username, promise);
      return promise;
    },
  });
}
```

### Image Optimisation

- All badge icons are SVGs served from `/public/badges/` — no byte overhead.
- User avatars use Next.js `<Image>` with `loading="lazy"` for below-fold cards.
- OG images use Vercel edge caching with `Cache-Control: public, max-age=3600`.

### Bundle Budget Targets

| Chunk | Target gzipped |
|-------|---------------|
| Initial JS (home page) | < 120 KB |
| Profile page JS | < 180 KB |
| Compare chunk (lazy) | < 60 KB |
| Leaderboard chunk (lazy) | < 40 KB |
| Share/PDF chunk (lazy) | < 80 KB |
| Recharts (lazy) | < 50 KB |

---

## Error Handling

### Error Taxonomy

```typescript
export type ErrorCode =
  | 'GBT_ERR_NOT_FOUND'       // HTTP 404 — username does not exist
  | 'GBT_ERR_RATE_LIMITED'    // HTTP 403 / 429 — API rate limit
  | 'GBT_ERR_NETWORK'         // fetch() threw a network error
  | 'GBT_ERR_UNKNOWN';        // unexpected non-2xx response

export class AnalyzerError extends Error {
  constructor(
    public code: ErrorCode,
    public httpStatus: number,
    message?: string,
  ) {
    super(message ?? code);
  }
}
```

### User-Facing Error Messages

| Code | Display message |
|------|----------------|
| `GBT_ERR_NOT_FOUND` | "GitHub user not found. Please check the username and try again." |
| `GBT_ERR_RATE_LIMITED` | "GitHub API rate limit reached. Please wait a few minutes and try again." |
| `GBT_ERR_NETWORK` | "Network error. Please check your connection and try again." |
| `GBT_ERR_UNKNOWN` | "An unexpected error occurred. Please try again." |

Error messages are injected into an `aria-live="polite"` region so screen readers surface them without interrupting ongoing speech (Requirement 19.5).

### Graceful Degradation

- If GraphQL call fails but REST succeeds: display partial profile with a "Some statistics unavailable" banner.
- If Events API fails: Roadmap_Engine falls back to the "depends on your activity" copy for day estimates.
- If bookmark data in localStorage is malformed: log a warning, clear the key, and proceed without crash.


---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The following properties were derived from the prework analysis of all acceptance criteria in the requirements document. Each property is universally quantified and suitable for property-based testing using [fast-check](https://github.com/dubzzz/fast-check) (TypeScript).

**Property Reflection**: After initial prework analysis, the following consolidations were made:
- Properties 1 and 1b (URL extraction + bare username parsing) are combined into a single round-trip property.
- Properties for rarity assignment (4.4) and "exactly one rarity" (5.1) are merged into Property 5.
- Score clamping properties for GitHub Score and Open Source Score (10.1, 10.2) are merged into a single combined score property (Property 9).
- Cache deduplication (2.9) and in-flight deduplication (17.3) are merged into Property 3.

---

### Property 1: Input parsing round-trip

*For any* valid GitHub username string (matching `[a-zA-Z0-9\-]{1,39}`), wrapping it in any of the three supported URL formats (`https://github.com/{u}`, `github.com/{u}`, or bare `{u}`) and parsing the result through `parseInput` SHALL yield the original username with no error.

**Validates: Requirements 1.1, 1.2**

---

### Property 2: Invalid characters are always rejected

*For any* string that contains at least one character outside `[a-zA-Z0-9\-]` (after stripping a `github.com/` prefix), `parseInput` SHALL return `error: 'INVALID_FORMAT'` and `username: null`.

**Validates: Requirements 1.4**

---

### Property 3: Cache idempotence — at most one in-flight request per username

*For any* username, if `useAnalyze` is called twice concurrently within the 5-minute TTL window, the Analyzer SHALL be invoked at most once and both callers SHALL receive identical `GitHubProfile` objects.

**Validates: Requirements 2.9, 17.3**

---

### Property 4: Badge progress is always clamped to [0, 100]

*For any* current metric value and threshold value (both non-negative integers), the `BadgeEngine.evaluateOne` progress computation SHALL return a value in the closed interval `[0, 100]`.

**Validates: Requirements 4.2**

---

### Property 5: Every badge receives exactly one valid rarity class

*For any* `BadgeDefinition` in the badge definitions array, the assigned `rarity` SHALL be a member of the set `{ 'Common', 'Rare', 'Epic', 'Legendary', 'Secret' }`, and no badge SHALL have more than one rarity assignment.

**Validates: Requirements 4.4, 5.1**

---

### Property 6: Badge_Engine evaluates all defined badges for any profile

*For any* valid `GitHubProfile`, calling `BadgeEngine.evaluate(profile)` SHALL return an array whose length equals `BADGE_DEFINITIONS.length`, and every badge ID in `BADGE_DEFINITIONS` SHALL appear exactly once in the output.

**Validates: Requirements 4.1**

---

### Property 7: Statistics aggregation counts are consistent

*For any* array of `BadgeEvaluation` objects, the Statistics Panel computed values SHALL satisfy: `unlockedCount + lockedCount = totalBadges`, `rareBadgesCount = count(rarity ∈ { Rare, Epic, Legendary, Secret })`, and `progressPercentage = round((unlockedCount / totalBadges) × 100, 1)`.

**Validates: Requirements 5.5, 10.3**

---

### Property 8: Next Badge is the locked badge with maximum progress

*For any* non-empty array of `BadgeEvaluation` objects containing at least one non-Unlocked entry, `RoadmapEngine.generate` SHALL select as `nextBadge` the entry with the highest `progress` value among all entries where `status !== 'Unlocked'`.

**Validates: Requirements 6.1**

---

### Property 9: Score Engine formulas are correct and clamped

*For any* `GitHubProfile` with non-negative metric values, `ScoreEngine.compute(profile)` SHALL satisfy:
- `githubScore = min(10000, commits×1 + prs×3 + issues×2 + stars×2 + followers×1 + orgs×5)`
- `openSourceScore = min(10000, mergedExternalPRs×5 + forksReceived×3 + contributorsToRepos×2)`
- Both scores SHALL be in `[0, 10000]`.

**Validates: Requirements 10.1, 10.2**

---

### Property 10: Roadmap steps are sorted ascending by estimatedDays

*For any* valid `BadgeEvaluation[]` input to `RoadmapEngine.generate`, the returned `steps` array SHALL be sorted such that for every consecutive pair `(steps[i], steps[i+1])`, `steps[i].estimatedDays ≤ steps[i+1].estimatedDays`.

**Validates: Requirements 8.3**

---

### Property 11: Roadmap step count never exceeds 10

*For any* `BadgeEvaluation[]` input (regardless of how many badges are locked), `RoadmapEngine.generate` SHALL return a `steps` array of length ≤ 10.

**Validates: Requirements 8.1**

---

### Property 12: Roadmap steps reference only top-3 locked badges

*For any* `BadgeEvaluation[]` input containing at least 3 locked badges, every step in `roadmap.steps` SHALL have a `targetBadgeId` that belongs to the set of the 3 locked badges with the highest `progress` values.

**Validates: Requirements 8.1**

---

### Property 13: Number formatter applies comma separators correctly

*For any* integer `n > 999`, `formatNumber(n)` SHALL return a string that contains commas at every third digit from the right and whose numeric value (after removing commas) equals `n`.

**Validates: Requirements 3.3**

---

### Property 14: Top-languages computation returns correct percentages

*For any* map of `{ languageName → bytes }` with total bytes > 0, `computeTopLanguages` SHALL return the 8 languages with the highest byte counts, each with a `percentage` equal to `(languageBytes / totalBytes) × 100` rounded to two decimal places, and all percentages SHALL sum to ≤ 100.

**Validates: Requirements 3.5**

---

### Property 15: Search history invariants

*For any* sequence of username additions to `Search_History` (including duplicates), the resulting stored list SHALL: (a) contain at most 20 entries, (b) contain no duplicate usernames, (c) have the most recently added username at index 0.

**Validates: Requirements 13.1, 13.2**

---

### Property 16: Leaderboard is correctly sorted for each tab

*For any* non-empty array of `LeaderboardEntry` objects, ranking them by tab SHALL produce a list sorted in descending order by the tab's metric: `badgeCount` for "Most Badges", `badgesLast30Days` for "Fastest Growth", `totalContributions` for "Most Contributions", and `totalPRs` for "Most PRs".

**Validates: Requirements 12.2**

---

### Property 17: Timeline groups badges into correct calendar years

*For any* list of `BadgeEvaluation` objects with `earnedAt` dates, `groupByYear` SHALL place each badge into the bucket matching `earnedAt.getFullYear()`, and the buckets SHALL be returned in descending year order.

**Validates: Requirements 9.1**

---

### Property 18: Comparison highlight logic correctly identifies the higher value

*For any* pair of numeric metric values `(a, b)`, the Compare_View highlight function SHALL mark `a` with the accent color if and only if `a > b`, mark `b` with the accent color if and only if `b > a`, and apply the default text color to both when `a === b`.

**Validates: Requirements 11.5**

---

### Property 19: Activity rate estimation from 90-day event window

*For any* array of `GitHubEvent` objects with timestamps, `computeActivityRate` SHALL: return `null` when fewer than 10 events fall within the 90-day window, and otherwise return `windowEventCount / 90` (events per day).

**Validates: Requirements 6.3, 6.4**

---

### Property 20: Repository Health Score is bounded and additive

*For any* repository attribute combination (has README, has LICENSE, has contributing guide, has open issues, recent commit), `computeRepoHealthScore` SHALL return a score in `[0, 100]` equal to the sum of the matched criteria weights (README: 20, LICENSE: 20, CONTRIBUTING: 20, open issues: 10, recent commit: 30).

**Validates: Requirements 20.5**

---

### Property 21: Checklist completion percentage is consistent

*For any* `ChecklistItem[]` of length > 0, `checklistCompletion` SHALL equal `round((metCount / totalCount) × 100)` and SHALL be in `[0, 100]`.

**Validates: Requirements 7.3**

---

### Property 22: Wrapped data filters to current calendar year only

*For any* array of `GitHubEvent` objects spanning multiple years, the GitHub Wrapped computation SHALL include only events whose `created_at` year equals the current calendar year.

**Validates: Requirements 20.1**

---

### Property 23: Badge Predictor probability scores are valid

*For any* `BadgeEvaluation[]` input to the Badge Predictor, all returned probability scores SHALL be in `[0, 1]`, and the output list SHALL be sorted in descending probability order.

**Validates: Requirements 20.2**

---

### Property 24: Hacktoberfest counter counts only October PRs of current year

*For any* list of pull request events with varied dates, the Hacktoberfest Tracker SHALL count exactly those events whose month is October (`getMonth() === 9`) and whose year equals the current calendar year.

**Validates: Requirements 20.6**


---

## Testing Strategy

### Dual Testing Approach

The testing suite uses two complementary layers:

1. **Property-based tests** — validate universal invariants across randomly generated inputs. Library: **fast-check** (TypeScript-native, 100+ iterations per property).
2. **Unit tests** — validate specific examples, edge cases, and integration points between subsystems.

### Property-Based Test Configuration

All property tests are in `tests/property/` and follow this structure:

```typescript
// tests/property/badge-engine.prop.ts
import fc from 'fast-check';
import { BadgeEngine } from '@/lib/engines/badge-engine';
import { BADGE_DEFINITIONS } from '@/lib/data/badge-definitions';

// Feature: github-badge-tracker, Property 4: Badge progress is always clamped to [0, 100]
test('badge progress is always in [0, 100]', () => {
  const engine = new BadgeEngine();

  fc.assert(
    fc.property(
      fc.record({
        totalCommits:    fc.nat(),
        totalPRs:        fc.nat(),
        starsReceived:   fc.nat(),
        totalDiscussions: fc.nat(),
        accountAgeYears: fc.nat(),
        mergedExternalPRs: fc.nat(),
        // ... remaining required fields
      }),
      (profileFields) => {
        const profile = buildProfile(profileFields);
        const evals = engine.evaluate(profile);
        return evals.every((e) => e.progress >= 0 && e.progress <= 100);
      },
    ),
    { numRuns: 200 },
  );
});
```

```typescript
// tests/property/input-parser.prop.ts
import fc from 'fast-check';
import { parseInput } from '@/lib/utils/input-parser';

// Feature: github-badge-tracker, Property 1: Input parsing round-trip
const validUsernameArb = fc.stringMatching(/^[a-zA-Z0-9\-]{1,39}$/);

test('input parsing round-trip for all URL formats', () => {
  fc.assert(
    fc.property(
      validUsernameArb,
      fc.constantFrom('bare', 'github.com/', 'https://github.com/'),
      (username, prefix) => {
        const input = prefix === 'bare' ? username : `${prefix}${username}`;
        const result = parseInput(input);
        return result.error === null && result.username === username;
      },
    ),
    { numRuns: 200 },
  );
});

// Feature: github-badge-tracker, Property 2: Invalid characters are always rejected
test('strings with invalid chars are always rejected', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1 }).filter((s) => /[^a-zA-Z0-9\-]/.test(s) && !s.match(/github\.com\//)),
      (invalidInput) => {
        const result = parseInput(invalidInput);
        return result.error === 'INVALID_FORMAT' && result.username === null;
      },
    ),
    { numRuns: 200 },
  );
});
```

```typescript
// tests/property/score-engine.prop.ts
import fc from 'fast-check';
import { ScoreEngine } from '@/lib/engines/score-engine';

// Feature: github-badge-tracker, Property 9: Score Engine formulas are correct and clamped
test('GitHub Score formula and clamping', () => {
  const engine = new ScoreEngine();

  fc.assert(
    fc.property(
      fc.record({
        totalCommits: fc.nat(5000),
        totalPRs: fc.nat(2000),
        totalIssues: fc.nat(2000),
        starsReceived: fc.nat(3000),
        followers: fc.nat(5000),
        organizations: fc.array(fc.constant({ login: 'org', avatar_url: '' }), { maxLength: 20 }),
        // ... other required GitHubProfile fields with defaults
      }),
      (fields) => {
        const profile = buildProfile(fields);
        const { githubScore, openSourceScore } = engine.compute(profile);
        const expectedGH = Math.min(10000,
          fields.totalCommits * 1 + fields.totalPRs * 3 + fields.totalIssues * 2 +
          fields.starsReceived * 2 + fields.followers * 1 + fields.organizations.length * 5
        );
        return githubScore === expectedGH && githubScore >= 0 && githubScore <= 10000
          && openSourceScore >= 0 && openSourceScore <= 10000;
      },
    ),
    { numRuns: 300 },
  );
});
```

### Unit Test Coverage Targets

| Module | Min coverage |
|--------|-------------|
| `input-parser.ts` | 100% |
| `badge-engine.ts` | 95% |
| `score-engine.ts` | 100% |
| `roadmap-engine.ts` | 90% |
| `formatters.ts` | 100% |
| `search-history` hook | 90% |

### Edge Cases (unit tests)

- `parseInput('')` → `error: 'EMPTY'`
- `parseInput('user with spaces')` → `error: 'INVALID_FORMAT'`
- `BadgeEngine` with a profile where all metrics are `0` → all badges `Locked`, all progress `0`
- `BadgeEngine` with a profile that exceeds all thresholds → all tiered badges `Unlocked`, progress `100`
- `ScoreEngine` with all-zero metrics → `githubScore: 0, openSourceScore: 0`
- `ScoreEngine` with very large metrics → both scores clamped at `10000`
- `RoadmapEngine` with 0 locked badges → returns empty steps array, `nextBadge: undefined`
- `computeActivityRate` with exactly 9 events in window → returns `null`
- `computeActivityRate` with exactly 10 events in window → returns `10 / 90`
- `SearchHistory` adding 21 usernames → stored list has exactly 20 entries

### Integration Tests

- Verify `Analyzer` calls all four API endpoints concurrently (mock all endpoints)
- Verify HTTP 404 from any endpoint surfaces `GBT_ERR_NOT_FOUND` error
- Verify HTTP 429 from any endpoint surfaces `GBT_ERR_RATE_LIMITED` error
- Verify React Query cache prevents second `Analyzer.analyse()` call within 5-minute window
- Verify `CompareView`, `Leaderboard`, and `ShareModal` chunks are not included in the initial bundle

### Accessibility Tests

- Run `jest-axe` on all major page section components
- Verify all icon-only buttons have `aria-label` attributes
- Verify error messages appear in `aria-live="polite"` region
- Verify skip-to-content link is present and functional

