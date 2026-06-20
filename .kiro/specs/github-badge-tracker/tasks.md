# Implementation Plan: GitHub Badge Tracker

## Overview

Build a Next.js 14 (App Router) full-stack web application that lets any visitor enter a GitHub username and receive a comprehensive, animated analysis of their GitHub achievement badges. The implementation proceeds in eight layers: foundation → data & engines → state management → UI primitives → page sections → pages & routing → API routes & SEO → bonus features & tests.

All code is TypeScript. Styling uses TailwindCSS + Shadcn UI. Animations use Framer Motion. Server state uses React Query. Client state uses Zustand. Property-based tests use fast-check.

## Tasks

- [x] 1. Project scaffolding and configuration
  - [x] 1.1 Initialise Next.js 14 App Router project with TypeScript
    - Run `create-next-app` with `--typescript --tailwind --app --src-dir=false --import-alias="@/*"` flags
    - Verify `tsconfig.json` has `strict: true`, `paths` alias `@/*` pointing to root
    - Confirm `app/` directory structure is generated correctly
    - _Requirements: 17.1 (LCP ≤ 2.5 s budget starts here)_

  - [x] 1.2 Install and configure Shadcn UI
    - Run `npx shadcn-ui@latest init` with the Slate colour palette and CSS variables enabled
    - Add components needed across the project: `button`, `input`, `badge`, `dialog`, `tabs`, `skeleton`, `dropdown-menu`, `tooltip`
    - _Requirements: 19.1 (WCAG AA — Shadcn ships accessible primitives)_

  - [x] 1.3 Install and configure Framer Motion, React Query, and Zustand
    - Add `framer-motion`, `@tanstack/react-query`, `zustand` as exact-version dependencies
    - Create `app/providers.tsx` that wraps the tree with `QueryClientProvider` (staleTime 5 min, cacheTime 10 min) and Zustand DevTools in dev mode
    - Import providers in `app/layout.tsx`
    - _Requirements: 15 (animations), 17.4 (stale-while-revalidate)_

  - [x] 1.4 Install fast-check and configure the test runner
    - Add `fast-check`, `vitest`, `@vitest/coverage-v8`, `jest-axe`, `@testing-library/react`, `@testing-library/user-event` as exact-version dev dependencies
    - Create `vitest.config.ts` with path aliases, jsdom environment, and coverage thresholds matching the design targets (100% for input-parser and score-engine, 95% badge-engine, etc.)
    - Create `tests/unit/` and `tests/property/` directory stubs (`.gitkeep`)
    - _Requirements: design testing strategy_

  - [x] 1.5 Smoke-test scaffold setup
    - Write a single passing Vitest unit test (`tests/unit/scaffold.test.ts`) that imports `@/types` and asserts the module resolves without error
    - Run `vitest --run` and confirm all tests pass and coverage report generates
    - _Requirements: CI baseline_

- [x] 2. TypeScript type definitions (`types/index.ts`)
  - [x] 2.1 Define input, API response, and normalised profile types
    - Write `ParsedInput`, `GitHubRESTUser`, `GitHubGraphQLStats`, `LanguageEntry`, `GitHubEvent`, `GitHubOrg`, and `GitHubProfile` interfaces exactly as specified in the design document
    - Export all types from `types/index.ts`
    - _Requirements: 1 (input parsing), 2 (data fetching), 3 (profile display)_

  - [x] 2.2 Define badge, score, roadmap, leaderboard, and search history types
    - Write `BadgeTier`, `BadgeRarity`, `BadgeStatus`, `Difficulty` union types
    - Write `ChecklistItem`, `ChecklistItemDefinition`, `BadgeDefinition`, `BadgeTierDefinition`, `BadgeEvaluation` interfaces
    - Write `ScoreResult`, `RoadmapStep`, `RoadmapResult`, `LeaderboardTab`, `LeaderboardEntry`, `SearchHistoryEntry` interfaces
    - Export all from `types/index.ts`
    - _Requirements: 4 (badge calculation), 5 (rarity), 6 (roadmap), 10 (stats), 12 (leaderboard), 13 (search history)_

  - [x] 2.3 Define error taxonomy types
    - Write `ErrorCode` union type and `AnalyzerError` class with `code`, `httpStatus`, and `message` fields as specified in the design error handling section
    - Export from `types/index.ts`
    - _Requirements: 2.7, 2.8 (error states)_

- [x] 3. Badge definitions data (`lib/data/badge-definitions.ts`)
  - [x] 3.1 Implement all 14 core badge definitions
    - Write the `BADGE_DEFINITIONS` typed constant array in `lib/data/badge-definitions.ts`
    - Include all 14 badges: Pair Extraordinaire, Pull Shark, Starstruck, Galaxy Brain, Quickdraw, YOLO, Arctic Code Vault, Public Sponsor, Mars 2020, Developer Program Member, Open Source Contributor, Achievement Hunter, Early Adopter, and Secret Badge placeholder
    - Each definition must include `id`, `name`, `description`, `iconPath`, `rarity`, `difficulty`, `secret`, `metricKey`, `tiers[]`, and `checklistItems[]` with `evaluate` functions exactly matching design
    - _Requirements: 4.1 (badge list), 4.4 (rarity assignments), 5.1 (one rarity per badge), 7.1 (checklist items)_

  - [x] 3.2 Write property test: every badge has exactly one valid rarity (Property 5)
    - In `tests/property/badge-engine.prop.ts`, write a fast-check property asserting `BADGE_DEFINITIONS.every(d => VALID_RARITIES.includes(d.rarity))`
    - **Property 5: Every badge receives exactly one valid rarity class**
    - **Validates: Requirements 4.4, 5.1**
    - Run `vitest --run tests/property/badge-engine.prop.ts` and confirm it passes

- [x] 4. Utility layer
  - [x] 4.1 Implement `lib/utils/input-parser.ts`
    - Write `VALID_USERNAME_RE` and `GITHUB_URL_RE` regex constants
    - Implement `parseInput(raw: string): ParsedInput` — trim, try URL form, fall back to bare username, return error states `'EMPTY'` and `'INVALID_FORMAT'` as specified
    - Export `INPUT_ERRORS` constants object with the two user-facing messages
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 4.2 Write property test: input parsing round-trip (Property 1)
    - In `tests/property/input-parser.prop.ts`, generate valid usernames with `fc.stringMatching(/^[a-zA-Z0-9\-]{1,39}$/)`, wrap in each of the three URL formats, assert `parseInput` returns original username with `error: null`
    - **Property 1: Input parsing round-trip**
    - **Validates: Requirements 1.1, 1.2**
    - Run `vitest --run` to confirm pass

  - [x] 4.3 Write property test: invalid characters are always rejected (Property 2)
    - In `tests/property/input-parser.prop.ts`, generate strings containing characters outside `[a-zA-Z0-9\-]` (excluding valid URL prefixes), assert `parseInput` returns `error: 'INVALID_FORMAT'` and `username: null`
    - **Property 2: Invalid characters are always rejected**
    - **Validates: Requirements 1.4**
    - Run `vitest --run` to confirm pass

  - [x] 4.4 Write unit tests for `input-parser.ts`
    - Test `parseInput('')` → `error: 'EMPTY'`
    - Test `parseInput('user with spaces')` → `error: 'INVALID_FORMAT'`
    - Test all three URL forms produce the correct username
    - Confirm 100% coverage on `input-parser.ts`
    - _Requirements: 1.1–1.4_

  - [x] 4.5 Implement `lib/utils/formatters.ts`
    - Write `formatNumber(n: number): string` — comma separator for numbers > 999 (e.g., `1,234`)
    - Write `formatDate(d: Date): string` — locale-aware date string
    - Write `computeAccountAge(createdAt: Date): number` — whole years between date and now
    - Write `computeTopLanguages(languages: LanguageEntry[]): LanguageEntry[]` — top 8 by bytes, adds `percentage` field
    - _Requirements: 3.1, 3.3, 3.5_

  - [x] 4.6 Write property test: number formatter comma separators (Property 13)
    - Generate integers > 999 with `fc.integer({ min: 1000 })`, assert the formatted string contains commas at correct positions and that removing commas gives back the original number
    - **Property 13: Number formatter applies comma separators correctly**
    - **Validates: Requirements 3.3**

  - [x] 4.7 Write property test: top-languages percentages (Property 14)
    - Generate arbitrary `LanguageEntry[]` with `bytes > 0`, assert returned list has ≤ 8 entries, each has correct percentage, total ≤ 100
    - **Property 14: Top-languages computation returns correct percentages**
    - **Validates: Requirements 3.5**

  - [x] 4.8 Implement `lib/utils/animation-variants.ts`
    - Write all six Framer Motion variant objects: `fadeSlideUp`, `fadeSlideLeft`, `heroStagger`, `counterFade`, `rarityPulse`, `legendaryShimmer` with exact timing values from the design animation timing reference table
    - _Requirements: 15.1–15.6 (animation system)_

- [x] 5. Checkpoint — Run all tests
  - Run `vitest --run --coverage` and ensure all existing tests pass and coverage thresholds are met. Ask the user if anything is unclear before proceeding.

- [x] 6. GitHub API clients (`lib/api/`)
  - [x] 6.1 Implement `lib/api/github-rest.ts`
    - Write the `ghFetch<T>` helper with `Accept: application/vnd.github+json` header, optional Bearer token, and `next: { revalidate: 300 }` cache directive
    - Map HTTP 404 → `AnalyzerError('GBT_ERR_NOT_FOUND')`, HTTP 403/429 → `AnalyzerError('GBT_ERR_RATE_LIMITED')`, other non-ok → `AnalyzerError('GBT_ERR_UNKNOWN')`
    - Export `fetchRESTProfile(username)` and `fetchOrgs(username)` functions
    - _Requirements: 2.1, 2.4, 2.7, 2.8_

  - [x] 6.2 Implement `lib/api/github-graphql.ts`
    - Write the `STATS_QUERY` GraphQL document fetching `contributionsCollection`, `repositories` (first 100), `gists`, `packages` nodes as specified in design
    - Write `fetchGraphQLStats(username: string): Promise<GitHubGraphQLStats>` that POSTs to `https://api.github.com/graphql`, maps the response to `GitHubGraphQLStats`, and aggregates stars, forks, merged external PRs, and contributors from repository nodes
    - _Requirements: 2.2, 2.5_

  - [x] 6.3 Implement `lib/api/github-events.ts`
    - Write `fetchPublicEvents(username: string): Promise<GitHubEvent[]>` that fetches pages 1–3 concurrently with `Promise.all`, each at `per_page=100`, and catches per-page errors returning `[]` so a missing page does not abort the whole fetch
    - _Requirements: 2.3_

- [x] 7. Engine implementations (`lib/engines/`)
  - [x] 7.1 Implement `lib/engines/analyzer.ts`
    - Write the `Analyzer` class with `analyse(username: string): Promise<GitHubProfile>` method
    - Use `Promise.all` to execute all four fetches (REST profile, GraphQL stats, public events, orgs) concurrently
    - Write the `normalise()` function that merges all four API responses into a `GitHubProfile`, computing `accountAgeYears` and calling `computeTopLanguages`
    - Wrap each leg in individual try/catch; re-throw `AnalyzerError` with appropriate codes
    - _Requirements: 2.1–2.8_

  - [x] 7.2 Implement `lib/engines/badge-engine.ts`
    - Write the `BadgeEngine` class with `evaluate(profile: GitHubProfile): BadgeEvaluation[]` and `evaluateOne(def, profile)` private method
    - Compute `currentValue`, `earnedTiers`, `currentTier`, `nextTierDef`, `threshold`, `progress` (clamped 0–100), and `status` exactly as specified in design
    - Evaluate `checklistItems` by calling each `evaluate(profile)` function, compute `checklistCompletion`
    - _Requirements: 4.1–4.4, 7.1–7.3_

  - [x] 7.3 Write property test: badge progress clamped to [0, 100] (Property 4)
    - In `tests/property/badge-engine.prop.ts`, generate arbitrary non-negative `GitHubProfile` metric fields, run `BadgeEngine.evaluate`, assert every evaluation has `progress >= 0 && progress <= 100`
    - Use `fc.record` with `fc.nat()` for all numeric metric fields, `numRuns: 200`
    - **Property 4: Badge progress is always clamped to [0, 100]**
    - **Validates: Requirements 4.2**

  - [x] 7.4 Write property test: all defined badges are evaluated exactly once (Property 6)
    - Generate arbitrary profiles, assert `BadgeEngine.evaluate` returns array of length `BADGE_DEFINITIONS.length` with each badge ID appearing exactly once
    - **Property 6: Badge_Engine evaluates all defined badges for any profile**
    - **Validates: Requirements 4.1**

  - [x] 7.5 Write unit tests for `badge-engine.ts`
    - Test all-zero profile → all badges `Locked`, all progress `0`
    - Test profile exceeding all thresholds → tiered badges `Unlocked`, progress `100`
    - Test single badge where `currentValue` equals exactly the Bronze threshold → `Unlocked`, `currentTier: 'Bronze'`
    - _Requirements: 4.1–4.4, 7.1–7.3_

  - [x] 7.6 Implement `lib/engines/score-engine.ts`
    - Write `ScoreEngine` class with `compute(profile: GitHubProfile): ScoreResult`
    - Implement GitHub Score formula: `min(10000, commits×1 + prs×3 + issues×2 + stars×2 + followers×1 + orgs.length×5)`
    - Implement Open Source Score formula: `min(10000, mergedExternalPRs×5 + forksReceived×3 + contributorsToRepos×2)`
    - _Requirements: 10.1, 10.2_

  - [x] 7.7 Write property test: Score Engine formula and clamping (Property 9)
    - In `tests/property/score-engine.prop.ts`, generate non-negative metric values, compute expected scores independently, assert engine output matches formula and both scores are in `[0, 10000]`
    - Use `numRuns: 300`
    - **Property 9: Score Engine formulas are correct and clamped**
    - **Validates: Requirements 10.1, 10.2**

  - [x] 7.8 Write unit tests for `score-engine.ts`
    - Test all-zero profile → both scores `0`
    - Test extreme values → both scores clamped at `10000`
    - _Requirements: 10.1, 10.2_

  - [x] 7.9 Implement `lib/engines/roadmap-engine.ts`
    - Write `RoadmapEngine` class with `generate(evaluations, events): RoadmapResult`
    - Filter to non-Unlocked evaluations, sort by `progress` descending, pick `nextBadge` (index 0) and `top3` (indices 0–2)
    - Implement `computeActivityRate(events)` using 90-day rolling window: return `null` if < 10 events, else `windowEvents.length / 90`
    - Implement `stepsForBadge` — compute `remaining`, estimate days from rate (fallback 30), build `RoadmapStep`
    - Generate up to 10 steps for top 3 badges, sort steps ascending by `estimatedDays`, compute `totalEstimatedDays` and `estimatedCompletionDate`
    - _Requirements: 6.1–6.4, 8.1–8.6_

  - [x] 7.10 Write property test: roadmap steps sorted ascending (Property 10)
    - Generate arbitrary `BadgeEvaluation[]` containing at least one non-Unlocked entry, assert returned `steps` is sorted with `steps[i].estimatedDays <= steps[i+1].estimatedDays`
    - **Property 10: Roadmap steps are sorted ascending by estimatedDays**
    - **Validates: Requirements 8.3**

  - [x] 7.11 Write property test: roadmap step count ≤ 10 (Property 11)
    - Generate arbitrary `BadgeEvaluation[]` of any length, assert `steps.length <= 10`
    - **Property 11: Roadmap step count never exceeds 10**
    - **Validates: Requirements 8.1**

  - [x] 7.12 Write property test: steps reference only top-3 locked badges (Property 12)
    - Generate evaluations with ≥ 3 locked badges, assert all `step.targetBadgeId` values belong to the top-3 locked badge IDs by progress
    - **Property 12: Roadmap steps reference only top-3 locked badges**
    - **Validates: Requirements 8.1**

  - [x] 7.13 Write property test: activity rate estimation (Property 19)
    - Generate event arrays of varying sizes and timestamps; assert `computeActivityRate` returns `null` when window has < 10 events, otherwise returns `count/90`
    - **Property 19: Activity rate estimation from 90-day event window**
    - **Validates: Requirements 6.3, 6.4**

  - [x] 7.14 Write unit tests for `roadmap-engine.ts`
    - Test 0 locked badges → `steps: []`, `nextBadge: undefined`
    - Test exactly 9 events in 90-day window → `activityRate: null`, estimated days shown as fallback
    - Test exactly 10 events in 90-day window → `activityRate: 10/90`
    - _Requirements: 6.1–6.4, 8.1–8.6_

- [x] 8. Checkpoint — Engine test suite
  - Run `vitest --run --coverage`. All engine tests pass, coverage targets met. Ask the user if questions arise.

- [x] 9. Zustand stores (`lib/store/`)
  - [x] 9.1 Implement `lib/store/profile-store.ts`
    - Write `ProfileState` interface and `useProfileStore` with `zustand/middleware/persist`
    - Include state fields: `profile`, `evaluations`, `scores`, `roadmap`, `loading`, `error`
    - Include actions: `setProfile`, `setEvaluations`, `setScores`, `setRoadmap`, `setLoading`, `setError`, `reset`
    - Use `partialize` to persist only `profile` under key `gbt_profile_cache`
    - _Requirements: 2.9 (caching), 13.5 (bookmarks), 13.6 (cached banner)_

  - [x] 9.2 Implement `lib/store/badge-store.ts`
    - Write `BadgeState` interface and `useBadgeStore` with favourites (`string[]`) and bookmarks (`Record<string, GitHubProfile>`) persisted to `gbt_favorites` and `gbt_bookmarks` localStorage keys
    - Include actions: `addFavourite`, `removeFavourite`, `addBookmark`, `removeBookmark`
    - _Requirements: 13.4, 13.5_

  - [x] 9.3 Implement `lib/store/compare-store.ts`
    - Write `CompareState` with `profileA`, `profileB`, `evaluationsA`, `evaluationsB`, and setter actions
    - No persistence needed
    - _Requirements: 11.1–11.6_

  - [x] 9.4 Implement `lib/store/leaderboard-store.ts`
    - Write `LeaderboardState` with `entries: LeaderboardEntry[]` and `addEntry(entry)` action that upserts by username and recomputes all rank numbers
    - No persistence needed (session-only per requirements)
    - _Requirements: 12.1, 12.4_

  - [x] 9.5 Implement `lib/store/ui-store.ts`
    - Write `UIState` with `activeTab: LeaderboardTab`, `compareUsernameB`, `shareModalOpen`, `rpgModeEnabled`
    - Include actions: `setActiveTab`, `setCompareUsernameB`, `setShareModalOpen`, `toggleRPGMode`
    - No persistence
    - _Requirements: 11.1, 12.2, 14.6, 20.8_

- [x] 10. React Query hooks and localStorage hooks (`lib/hooks/`)
  - [x] 10.1 Implement `lib/hooks/useAnalyze.ts`
    - Write the `inFlight` Map singleton and `useAnalyze(username)` hook using `useQuery` with `queryKey: ['profile', username]`, `staleTime: 5 * 60 * 1000`, `cacheTime: 10 * 60 * 1000`
    - On query success, call `BadgeEngine.evaluate`, `ScoreEngine.compute`, `RoadmapEngine.generate`, and dispatch results to the Zustand profile store
    - Prevent duplicate in-flight requests for the same username by storing and returning the same Promise from the `inFlight` Map
    - _Requirements: 2.6, 2.9, 17.3, 17.4_

  - [x] 10.2 Write property test: cache idempotence (Property 3)
    - In `tests/property/cache.prop.ts`, mock `Analyzer.analyse` with a spy, call `useAnalyze` twice for the same username concurrently, assert the spy was called at most once and both callers received the same data object
    - **Property 3: Cache idempotence — at most one in-flight request per username**
    - **Validates: Requirements 2.9, 17.3**

  - [x] 10.3 Implement `lib/hooks/useSearchHistory.ts`
    - Write `useSearchHistory()` hook that reads/writes `gbt_search_history` in `localStorage`
    - Implement `addEntry(username)` that prepends, deduplicates by username, and trims to 20 entries
    - Implement `clearHistory()` and return the list as `SearchHistoryEntry[]` sorted most-recent-first
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 10.4 Write property test: search history invariants (Property 15)
    - In `tests/property/search-history.prop.ts`, generate arbitrary sequences of username additions (including duplicates), assert stored list has ≤ 20 entries, no duplicates, most-recent at index 0
    - **Property 15: Search history invariants**
    - **Validates: Requirements 13.1, 13.2**

  - [x] 10.5 Implement `lib/hooks/useLeaderboard.ts`
    - Write `useLeaderboard(tab: LeaderboardTab)` hook that reads `leaderboardStore.entries` and returns them sorted by the active tab metric in descending order
    - _Requirements: 12.2_

  - [x] 10.6 Write property test: leaderboard sorted descending per tab (Property 16)
    - Generate arbitrary `LeaderboardEntry[]`, assert `useLeaderboard` output is sorted descending by the correct metric for each of the four tabs
    - **Property 16: Leaderboard is correctly sorted for each tab**
    - **Validates: Requirements 12.2**

  - [x] 10.7 Implement `lib/hooks/useReducedMotion.ts`
    - Write the `useReducedMotion(): boolean` hook using `window.matchMedia('(prefers-reduced-motion: reduce)')`, subscribing to `change` events and cleaning up on unmount
    - _Requirements: 15.6_

- [x] 11. Layout components (`components/layout/`)
  - [x] 11.1 Implement `components/layout/Header.tsx`
    - Render logo, desktop navigation links (`/`, `/compare`, `/leaderboard`, `/wrapped`), RPG Mode toggle button (reads `uiStore.rpgModeEnabled`, calls `toggleRPGMode`), and a hamburger button (`md:hidden`) that opens MobileNav
    - Apply `aria-label="Toggle navigation"` to the hamburger button
    - Ensure nav links are `<a>` elements with visible focus rings (2 px outline, Requirement 19.2)
    - _Requirements: 16.4, 19.2, 19.3, 20.8_

  - [x] 11.2 Implement `components/layout/MobileNav.tsx`
    - Accept `isOpen: boolean` and `onClose: () => void` props
    - Render a full-screen overlay with nav links and close button on viewports < 768 px
    - Trap focus within the overlay while open; close on Escape key press
    - Minimum touch target size 44 × 44 px on all interactive elements
    - _Requirements: 16.3, 16.4, 19.1_

  - [x] 11.3 Implement `components/layout/Footer.tsx`
    - Render branding, links, and optional dark-mode note
    - All links must be accessible with visible focus rings
    - _Requirements: 19.2_

- [x] 12. Primitive components (`components/primitives/`)
  - [x] 12.1 Implement `components/primitives/ProgressBar.tsx`
    - Accept `value: number` (0–100), optional `color`, `animated` (default true), `height` (default 6 px)
    - On mount, animate fill from 0% to `value` over 600 ms ease-out using Framer Motion; when `useReducedMotion()` is true, skip animation and show final value immediately
    - _Requirements: 15.3_

  - [x] 12.2 Implement `components/primitives/StatCounter.tsx`
    - Accept `value: number`, `label: string`, `duration` (default 800 ms), optional `format` function
    - On mount, animate displayed number from 0 to `value` over `duration` ms using ease-out; when `useReducedMotion()` is true, display final value immediately
    - Apply `formatNumber` from formatters when no custom `format` prop is provided
    - _Requirements: 3.4, 15.4_

  - [x] 12.3 Implement `components/primitives/SkeletonCard.tsx`
    - Accept `variant: 'badge' | 'profile' | 'stat' | 'roadmap'`
    - Render Shadcn `<Skeleton>` elements arranged to match the approximate height and column structure of each section's loaded state
    - _Requirements: 2.10, 15.1_

  - [x] 12.4 Implement `components/primitives/RarityBadge.tsx`
    - Accept `rarity: BadgeRarity` and `size?: 'sm' | 'md'`
    - Render a coloured pill using the exact hex colours from the design: Common `#6B7280`, Rare `#2563EB`, Epic `#7C3AED`, Legendary `#F59E0B`, Secret `#0F172A`
    - When `rarity === 'Secret'`, apply the `rarityPulse` Framer Motion variant (2 s period) gated behind `!useReducedMotion()`
    - When `rarity === 'Legendary'`, apply the `legendaryShimmer` variant (3 s interval) gated behind `!useReducedMotion()`
    - _Requirements: 5.2, 5.3, 5.4_

  - [x] 12.5 Implement `components/primitives/ConfettiTrigger.tsx`
    - Accept `trigger: boolean` and optional `origin: { x: number; y: number }`
    - When `trigger` flips from `false` to `true`, fire a confetti burst using a lightweight canvas-confetti library; skip when `useReducedMotion()` is true
    - _Requirements: 7.4, 15.2_

  - [x] 12.6 Implement `components/primitives/BadgeCard.tsx`
    - Accept `evaluation: BadgeEvaluation`, `rpgMode: boolean`, and optional `onUnlock?: () => void`
    - Render badge icon (Next.js `<Image>` with `loading="lazy"`, meaningful `alt` text), name, tier label (or RPG rank when `rpgMode`), `RarityBadge`, `ProgressBar`, status pill, checklist (collapsible), and earned date or lock icon
    - When `status === 'Unlocked'`: full colour saturation + green checkmark. When `status === 'Locked'`: reduced opacity + grey lock icon
    - Apply `fadeSlideUp` Framer Motion variant with `whileInView` so card animates when it enters viewport; gate behind `!useReducedMotion()`
    - Apply hover lift shadow (150 ms) on pointer-enter; skip on touch devices
    - Place `<ConfettiTrigger trigger={...} />` to fire on first `Unlocked` state
    - All interactive elements (expand checklist button, etc.) must have `aria-label`
    - _Requirements: 4.5–4.10, 5.2–5.4, 7.2, 7.4, 15.2, 19.3, 19.6_

  - [x] 12.7 Implement `components/primitives/RoadmapStep.tsx`
    - Accept a `RoadmapStep` object and `index: number`
    - Render the step number, action text, target badge name, estimated days, and difficulty label
    - Render a connecting vertical line to the next step (not the last); strike-through text + green checkmark when `completed: true`
    - _Requirements: 8.2, 8.4, 8.5_

  - [x] 12.8 Implement `components/primitives/TimelineEntry.tsx`
    - Accept a `BadgeEvaluation` with optional `isUpcoming: boolean`
    - Render badge icon, name, tier label, and formatted earned date; display "Date not available" when `earnedAt` is null
    - For upcoming entries, show the estimated unlock date range from the roadmap
    - _Requirements: 9.2, 9.3_

- [x] 13. Checkpoint — Primitive component accessibility
  - Run `vitest --run` and confirm all unit tests pass. Run `jest-axe` accessibility checks on all primitive components. Ask the user if questions arise.

- [x] 14. Page section components (`components/sections/`)
  - [x] 14.1 Implement `components/sections/HeroSection.tsx`
    - Render the main heading and subheading with `heroStagger` + `fadeSlideUp` Framer Motion variants: heading at 0 ms delay, subheading at 150 ms delay, gated behind `!useReducedMotion()`
    - _Requirements: 15.5_

  - [x] 14.2 Implement `components/sections/SearchSection.tsx`
    - Render a controlled text `<input>` with associated `<label>` or `aria-label`
    - Debounce keystrokes 300 ms before triggering autocomplete suggestions from `useSearchHistory()`
    - Render the history dropdown below the input when focused and history is non-empty; selecting an entry populates the field and immediately triggers analysis
    - Display inline validation messages from `INPUT_ERRORS` constants in an `aria-live="polite"` region when input is invalid or empty on submit
    - Show "Analyze Profile" submit button with `min-h-[44px]` on mobile
    - _Requirements: 1.3–1.6, 13.3, 15.1, 19.4, 19.5_

  - [x] 14.3 Implement `components/sections/ProfileSection.tsx`
    - Accept `profile: GitHubProfile` and `scores: ScoreResult`
    - Render avatar (`<Image>` with `alt={profile.name}`), full name, `@username`, bio, account age
    - Render `StatCounter` row for all 9 numeric stats using monospace typeface; format values > 999 with commas
    - Render language distribution bar chart (Recharts `BarChart` or `PieChart`, lazy-loaded) for top 8 languages
    - Show "Cached — last updated {date}" banner when profile was loaded from localStorage bookmark
    - _Requirements: 3.1–3.5, 13.6, 19.6_

  - [x] 14.4 Implement `components/sections/BadgeGrid.tsx`
    - Accept `evaluations: BadgeEvaluation[]` and `rpgMode: boolean`
    - Render "Unlocked Badges" section header, then all `BadgeCard` components for unlocked evaluations
    - Render "Locked Badges" section header, then all `BadgeCard` components for locked/in-progress evaluations
    - Apply responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`
    - _Requirements: 4.5–4.10, 16.2_

  - [x] 14.5 Implement `components/sections/RoadmapPanel.tsx`
    - Accept `roadmap: RoadmapResult` and `rpgMode: boolean`
    - Render the Next Badge card (icon, name, current/threshold metric, remaining gap, difficulty, estimated days, requirements checklist with checked/unchecked items, ProgressBar)
    - Render ordered `RoadmapStep` list below the Next Badge card
    - Display total estimated days sum below the last step
    - When `activityRate` is null, display "Estimated time: depends on your activity"
    - _Requirements: 6.1–6.6, 8.1–8.6_

  - [x] 14.6 Implement `components/sections/TimelineView.tsx`
    - Accept `evaluations: BadgeEvaluation[]` and `roadmap: RoadmapResult`
    - Group earned badges by `earnedAt.getFullYear()`, sort years descending, render `TimelineEntry` per badge
    - Apply `fadeSlideLeft` Framer Motion variant on each year group entering viewport (300 ms), gated behind `!useReducedMotion()`
    - Append "Upcoming Badges" subsection with top-3 locked badges and their estimated unlock dates
    - _Requirements: 9.1–9.5_

  - [x] 14.7 Write property test: timeline groups badges by year (Property 17)
    - Generate `BadgeEvaluation[]` with arbitrary `earnedAt` dates spanning multiple years, assert each badge is in the bucket matching its year and buckets are in descending year order
    - **Property 17: Timeline groups badges into correct calendar years**
    - **Validates: Requirements 9.1**

  - [x] 14.8 Implement `components/sections/StatsPanel.tsx`
    - Accept `evaluations: BadgeEvaluation[]`, `scores: ScoreResult`, `roadmap: RoadmapResult`
    - Render 9 `StatCounter` cells (total badges, unlocked, locked, rare badges, secret badges, progress %, estimated completion date, GitHub Score, Open Source Score)
    - Compute `progressPercentage = round((unlockedCount / totalBadges) × 100, 1)`
    - Render counts for Rare-or-above badges under "Rare Badges" label and Secret badges count under "Secret Badges" label
    - Apply responsive grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-4`
    - _Requirements: 5.5, 10.1–10.5, 16.2_

  - [x] 14.9 Write property test: statistics aggregation counts consistent (Property 7)
    - Generate arbitrary `BadgeEvaluation[]`, compute stats manually, assert engine output satisfies `unlocked + locked = total`, correct rare count, and correct progress percentage
    - **Property 7: Statistics aggregation counts are consistent**
    - **Validates: Requirements 5.5, 10.3**

- [x] 15. Lazy-loaded section components
  - [x] 15.1 Implement `components/sections/CompareView.tsx` (lazy-loaded)
    - Accept `profileA`, `profileB`, `evaluationsA`, `evaluationsB`
    - Render two-column grid (`md:grid-cols-2`) with stacked single-column fallback at < 768 px
    - Render parallel rows for each metric (total badges, stars, repos, followers, PRs, commits, top 5 languages, contributions last year, activity frequency)
    - Highlight higher value in each row with accent `#15803D`; apply default text color when equal
    - Render badge-by-badge comparison table showing Unlocked / Locked / In Progress for each user
    - Export as the default export; consumer wraps with `next/dynamic` in the compare page
    - _Requirements: 11.2–11.6, 16.5_

  - [x] 15.2 Write property test: comparison highlight logic (Property 18)
    - Generate pairs of numeric values `(a, b)`, assert highlight function marks `a` with accent iff `a > b`, marks `b` with accent iff `b > a`, and defaults both when `a === b`
    - **Property 18: Comparison highlight logic correctly identifies the higher value**
    - **Validates: Requirements 11.5**

  - [x] 15.3 Implement `components/sections/Leaderboard.tsx` (lazy-loaded)
    - Render four `Tabs` (Most Badges, Fastest Growth, Most Contributions, Most PRs) using Shadcn Tabs
    - For each tab, render ranked rows: rank number, avatar (`<Image>`), username, metric value, trend indicator (▲ / ▼ / NEW)
    - When entry count < 3, display placeholder message "Analyze more profiles to populate the leaderboard."
    - Export as default export; consumer wraps with `next/dynamic` in the leaderboard page
    - _Requirements: 12.2–12.5_

  - [x] 15.4 Implement `components/sections/ShareModal.tsx` (lazy-loaded)
    - Accept `profile`, `evaluations`, `scores` props and `isOpen`/`onClose` callbacks
    - When opened, lazily import `share-service.ts` and call `generateShareCardCanvas` to render a preview `<img>`
    - Render "Download PNG" button (triggers canvas blob download named `{username}-github-badges.png`)
    - Render "Download PDF" button (lazily imports jsPDF via `share-service.generatePDF`)
    - Render "Copy Share Link" button that writes `https://{domain}/u/{username}` to clipboard
    - All buttons must have `aria-label`
    - Export as default export; consumer wraps with `next/dynamic`
    - _Requirements: 14.1–14.6, 17.5, 19.3_

- [x] 16. Share Service (`lib/services/share-service.ts`)
  - [x] 16.1 Implement canvas share card generation
    - Write `generateShareCardCanvas(profile, evaluations, scores): Promise<Blob>` using the HTML Canvas API
    - Canvas is 1200 × 630 px; render background `#0F172A`, avatar (120 × 120 px), name (bold 40 px Inter), `@username` (28 px), badge count (bold 72 px), top-3 badge icons (100 × 100 px each), GitHub Score, and branding footer
    - Return canvas blob as PNG
    - _Requirements: 14.1_

  - [x] 16.2 Implement PDF report generation (lazy)
    - Write `generatePDF(profile, evaluations, roadmap): Promise<void>` that dynamically imports `jspdf`
    - Build an A4 portrait PDF with: profile summary page, badge cards (all evaluated badges), roadmap steps, timeline
    - Trigger `doc.save('{username}-github-badge-report.pdf')`
    - _Requirements: 14.4, 17.5_

  - [x] 16.3 Implement Twitter and LinkedIn share card variants
    - Write `generateTwitterCard(...)` at 1200 × 600 px and `generateLinkedInCard(...)` at 1200 × 627 px using the same canvas layout adapted to each platform's aspect ratio
    - _Requirements: 14.2_

- [x] 17. Next.js pages and routing (`app/`)
  - [x] 17.1 Implement `app/layout.tsx`
    - Apply root metadata (title, description, OG, Twitter card tags) as specified in the SEO section of the design
    - Import and render `<Providers>` (React Query + Zustand DevTools)
    - Render `<Header>` and `<Footer>` layout components around `{children}`
    - Inject JSON-LD `WebApplication` structured data block via `<script type="application/ld+json">`
    - Configure Inter font via `next/font/google`
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

  - [x] 17.2 Implement `app/page.tsx` (home)
    - Render `<HeroSection>` and `<SearchSection>`
    - On successful analysis, push router to `/u/{username}` or render inline if preferred
    - _Requirements: 1.1–1.6, 15.5_

  - [x] 17.3 Implement `app/u/[username]/page.tsx` (profile page)
    - Call `useAnalyze(username)` on mount to trigger data fetch and engine pipeline
    - While loading: render `<SkeletonCard>` for each section
    - On error: render error message in `aria-live="polite"` region
    - On success: render `<ProfileSection>`, `<BadgeGrid>`, `<RoadmapPanel>`, `<TimelineView>`, `<StatsPanel>`, star/bookmark icon buttons
    - Export `generateMetadata` with per-user `og:title`, `og:image` (pointing to `/api/share-card?username=`), and `og:url`
    - _Requirements: 3.1–3.5, 4.1–4.10, 9.1–9.5, 10.1–10.5, 13.4–13.6, 18.2, 18.3_

  - [x] 17.4 Implement `app/u/[username]/opengraph-image.tsx`
    - Use Next.js `ImageResponse` API with `runtime: 'edge'` and size `{ width: 1200, height: 630 }`
    - Render minimal `<OGShareCard>` JSX (avatar + badge count) for speed
    - _Requirements: 18.2_

  - [x] 17.5 Implement `app/compare/page.tsx`
    - Render a second username input field; on submit, load both profiles concurrently via `useAnalyze`
    - Lazily load `CompareView` with `next/dynamic` (SSR disabled, loading fallback: `<SkeletonCard variant="profile">`)
    - Store second username in `uiStore.compareUsernameB`
    - _Requirements: 11.1–11.6, 17.5_

  - [x] 17.6 Implement `app/leaderboard/page.tsx`
    - Lazily load `Leaderboard` component with `next/dynamic`
    - Populate from `leaderboardStore.entries`
    - _Requirements: 12.1–12.5, 17.5_

  - [x] 17.7 Implement `app/wrapped/page.tsx`
    - Render the GitHub Wrapped summary for the current calendar year: top language, most active month, total contributions, badges earned this year
    - Use event data from `useAnalyze` already cached in profile store
    - _Requirements: 20.1_

  - [x] 17.8 Write property test: Wrapped filters to current year only (Property 22)
    - Generate event arrays spanning multiple calendar years, assert Wrapped computation includes only events from the current year
    - **Property 22: Wrapped data filters to current calendar year only**
    - **Validates: Requirements 20.1**

- [x] 18. Checkpoint — Page routing and lazy loading
  - Run `vitest --run`. Verify `CompareView`, `Leaderboard`, and `ShareModal` are NOT included in the initial bundle by checking the build output chunk list. Ask the user if questions arise.

- [x] 19. API routes (`app/api/`)
  - [x] 19.1 Implement `app/api/og/route.ts`
    - Use `ImageResponse` to return a static 1200 × 630 PNG with the Tracker's branding
    - Set `Cache-Control: public, max-age=3600`
    - _Requirements: 18.2_

  - [x] 19.2 Implement `app/api/share-card/route.ts`
    - Accept `?username=` query parameter
    - Fetch minimal profile data (avatar + badge count) server-side and render a 1200 × 630 `ImageResponse`
    - Set `Cache-Control: public, max-age=3600`
    - _Requirements: 14.1, 18.2_

  - [x] 19.3 Implement `app/api/sitemap/route.ts` and `public/robots.txt`
    - `sitemap/route.ts`: generate `sitemap.xml` listing root URL and `/u/{username}` for each analyzed profile; return with `Content-Type: application/xml`
    - `public/robots.txt`: permit all crawlers to index all routes (`User-agent: * / Allow: /`)
    - _Requirements: 18.5, 18.6_

- [x] 20. Bonus features
  - [x] 20.1 Implement Badge Predictor (`lib/engines/badge-predictor.ts`)
    - Write `predictBadges(evaluations, activityRate): Array<{ badge: BadgeEvaluation; probability: number }>` that computes probability scores in `[0, 1]` for each locked badge within a 90-day window
    - Sort output descending by probability
    - Render the predictor results in a collapsible panel on the profile page
    - _Requirements: 20.2_

  - [x] 20.2 Write property test: Badge Predictor probability scores valid (Property 23)
    - Generate arbitrary `BadgeEvaluation[]`, assert all returned probability scores are in `[0, 1]` and output is sorted descending
    - **Property 23: Badge Predictor probability scores are valid**
    - **Validates: Requirements 20.2**

  - [x] 20.3 Implement Contribution Streak Tracker
    - Write `computeStreaks(events: GitHubEvent[]): { currentStreak: number; longestStreak: number }` in `lib/engines/streak-engine.ts`
    - Render current and longest streaks in the StatsPanel or a dedicated streak widget on the profile page
    - _Requirements: 20.4_

  - [x] 20.4 Implement Repository Health Score
    - Write `computeRepoHealthScore(repo: RepoAttributes): number` in `lib/engines/repo-health.ts`
    - Score is additive: README (20), LICENSE (20), CONTRIBUTING (20), open issues (10), recent commit ≤ 90 days (30); clamped to `[0, 100]`
    - Render health scores for each of the user's public repositories in a collapsible panel
    - _Requirements: 20.5_

  - [x] 20.5 Write property test: Repository Health Score bounded and additive (Property 20)
    - Generate arbitrary combinations of the 5 boolean repository attributes, assert computed score equals the sum of matched weights and is in `[0, 100]`
    - **Property 20: Repository Health Score is bounded and additive**
    - **Validates: Requirements 20.5**

  - [x] 20.6 Implement Hacktoberfest Tracker
    - Write `countHacktoberfestPRs(events: GitHubEvent[]): number` that counts PullRequestEvent entries where `created_at` month is October (`getMonth() === 9`) and year equals current year
    - Render progress toward the 4-PR completion threshold in a dedicated widget
    - _Requirements: 20.6_

  - [x] 20.7 Write property test: Hacktoberfest counts only October PRs (Property 24)
    - Generate event arrays with varied months and years, assert counter counts exactly events in October of the current year
    - **Property 24: Hacktoberfest counter counts only October PRs of current year**
    - **Validates: Requirements 20.6**

  - [x] 20.8 Implement Open Source Recommendations panel
    - Write `fetchRecommendations(languages: string[]): Promise<Repo[]>` in `lib/api/github-rest.ts` using `GET /search/repositories?q=language:{lang}+label:"good+first+issue"&sort=stars`
    - Return up to 5 repos matching the user's top languages
    - Render in a collapsible panel on the profile page
    - _Requirements: 20.7_

  - [x] 20.9 Implement GitHub RPG Mode toggle
    - In `BadgeGrid` and `BadgeCard`, read `uiStore.rpgModeEnabled`; when true, replace tier labels (Bronze → Apprentice, Silver → Journeyman, Gold → Master) and render `ProgressBar` as an XP bar with a matching label
    - Toggle is already wired in `Header` (Task 11.1)
    - _Requirements: 20.8_

  - [x] 20.10 Implement Contribution Calendar Replay animation
    - Write a `ContributionReplay` component that plays back the user's contribution heatmap month by month using `contributionsCollection` data from GraphQL
    - Use Framer Motion to sequence month-by-month reveal; gate full animation behind `!useReducedMotion()`
    - Render inside the GitHub Wrapped page
    - _Requirements: 20.9_

  - [x] 20.11 Implement Achievement Notifications opt-in
    - Write `useAchievementNotifications(evaluations)` hook in `lib/hooks/useAchievementNotifications.ts`
    - On opt-in, request `Notification.permission`; on re-analysis when a badge transitions from non-Unlocked to Unlocked, fire a browser notification via the Notifications API
    - Render an opt-in toggle button in the profile page header area
    - _Requirements: 20.10_

  - [x] 20.12 Implement Weekly Challenge widget
    - Write `getWeeklyChallenge(evaluations): RoadmapStep` that returns one recommended action refreshed every Monday at 00:00 UTC, derived from the user's highest-progress locked badge
    - Render in a small card on the profile page
    - _Requirements: 20.3_

  - [x] 20.13 Write property test: checklist completion percentage consistent (Property 21)
    - Generate `ChecklistItem[]` of arbitrary length > 0, assert `checklistCompletion = round((metCount / totalCount) * 100)` and result is in `[0, 100]`
    - **Property 21: Checklist completion percentage is consistent**
    - **Validates: Requirements 7.3**

- [x] 21. Next Badge recommendation wiring (Property 8)
  - [x] 21.1 Write property test: next badge has maximum progress among locked badges (Property 8)
    - In `tests/property/roadmap-engine.prop.ts`, generate `BadgeEvaluation[]` containing at least one non-Unlocked entry, assert `roadmap.nextBadge` has the highest `progress` value among all entries with `status !== 'Unlocked'`
    - **Property 8: Next Badge is the locked badge with maximum progress**
    - **Validates: Requirements 6.1**

- [x] 22. Integration tests
  - [x] 22.1 Write integration test: Analyzer calls all four endpoints concurrently
    - Mock all four GitHub API endpoints with `vitest.mock` / MSW, call `Analyzer.analyse('testuser')`, assert all four mocks were called and the returned profile has correct field mapping
    - _Requirements: 2.1–2.6_

  - [x] 22.2 Write integration test: HTTP 404 from any endpoint surfaces correct error
    - Mock REST endpoint to return 404, assert `useAnalyze` error state has message "GitHub user not found..."
    - Repeat for GraphQL and Events endpoints
    - _Requirements: 2.7_

  - [x] 22.3 Write integration test: HTTP 429 surfaces rate-limit error
    - Mock any endpoint to return 429, assert error state message is "GitHub API rate limit reached..."
    - _Requirements: 2.8_

  - [x] 22.4 Write accessibility tests with jest-axe
    - Run `jest-axe` on rendered `SearchSection`, `BadgeCard`, `ProfileSection`, `StatsPanel`, `RoadmapPanel`, and `ShareModal`
    - Assert zero accessibility violations
    - _Requirements: 19.1–19.7_

- [x] 23. Final checkpoint — Full test suite
  - Run `vitest --run --coverage`. All unit, property, and integration tests pass. Coverage targets met. Run `next build` and confirm no TypeScript errors, no bundle-size regressions beyond design targets. Ask the user if questions arise.


## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP, but all 24 design properties should eventually be covered for production correctness
- Each task references specific requirements for traceability; implementation agents must read both `requirements.md` and `design.md` for full context
- The design document contains full code skeletons for all engines, stores, API clients, and animation variants — use them as the canonical implementation reference
- All property-based tests use fast-check with `numRuns: 200` minimum (300 for Score Engine)
- The `inFlight` Map in `useAnalyze` is a module-level singleton — do not move it inside the hook body
- Recharts and Chart.js must be loaded via `next/dynamic` to avoid bloating the initial bundle
- Badge icon SVGs live in `public/badges/` and must have meaningful `alt` text on every `<Image>` usage
- The `useReducedMotion()` hook must gate every Framer Motion variant and every confetti/counter animation


## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["1.5", "2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["3.1", "4.1", "4.5", "4.8"] },
    { "id": 3, "tasks": ["3.2", "4.2", "4.3", "4.4", "4.6", "4.7", "6.1", "6.2", "6.3"] },
    { "id": 4, "tasks": ["7.1", "7.2", "7.6", "9.1", "9.2", "9.3", "9.4", "9.5"] },
    { "id": 5, "tasks": ["7.3", "7.4", "7.5", "7.7", "7.8", "7.9", "10.3", "10.5", "10.7"] },
    { "id": 6, "tasks": ["7.10", "7.11", "7.12", "7.13", "7.14", "10.1", "10.4", "10.6"] },
    { "id": 7, "tasks": ["10.2", "11.1", "11.2", "11.3"] },
    { "id": 8, "tasks": ["12.1", "12.2", "12.3", "12.4", "12.5"] },
    { "id": 9, "tasks": ["12.6", "12.7", "12.8"] },
    { "id": 10, "tasks": ["14.1", "14.2", "14.3", "14.4", "14.5", "14.6", "14.8"] },
    { "id": 11, "tasks": ["14.7", "14.9", "15.1", "15.3", "15.4", "16.1", "16.2", "16.3"] },
    { "id": 12, "tasks": ["15.2", "17.1", "17.2"] },
    { "id": 13, "tasks": ["17.3", "17.4", "17.5", "17.6", "17.7", "19.1", "19.2", "19.3"] },
    { "id": 14, "tasks": ["17.8", "20.1", "20.3", "20.4", "20.6", "20.8", "20.9", "20.10", "20.11", "20.12"] },
    { "id": 15, "tasks": ["20.2", "20.5", "20.7", "20.13", "21.1"] },
    { "id": 16, "tasks": ["22.1", "22.2", "22.3", "22.4"] }
  ]
}
```
