# Badge Hunter — Codebase Memory

> **Last updated:** June 20, 2026
> **Owner:** Diganta18-noob
> **Repo:** `Diganta18-noob/badge2`
> **Live URL:** https://badge-hunter.vercel.app
> **Brand Name:** Badge Hunter

---

## 1. Project Overview

**Badge Hunter** is a GitHub Achievement Badge Tracker web app. Users enter a GitHub username to analyze their profile — it evaluates which of GitHub's 14 achievement badges the user has unlocked, shows progress, generates roadmaps, computes streaks, predicts future badges, and scores repo health.

### Core Features
- **Profile Analysis** — Fetch GitHub data via REST + GraphQL APIs, display stats (followers, repos, commits, PRs, issues, stars, forks, gists, languages)
- **Badge Evaluation** — 14 badge definitions evaluated against the profile (Quickdraw, YOLO, Pull Shark, Starstruck, Galaxy Brain, Pair Extraordinaire, etc.)
- **Badge Roadmap** — Step-by-step plan to unlock the next badge
- **Badge Timeline** — Chronological view of unlocked & upcoming badges
- **Streak Tracking** — Current and longest contribution streaks from events
- **Badge Predictor** — 90-day probability predictions for upcoming badges
- **Repo Health Scores** — Per-repo scores based on README, license, issues
- **Compare** — Side-by-side comparison of two GitHub profiles
- **Leaderboard** — Rank analyzed profiles by badges, contributions, PRs, growth
- **Wrapped** — "GitHub Wrapped" yearly summary with activity heatmap replay
- **Share** — Share cards, PDF export, profile sharing
- **RPG Mode** — Toggle for gamified UI styling
- **Notifications** — Browser notifications for newly unlocked badges
- **Offline Bookmarks** — Save profile snapshots for offline viewing
- **Profiles Checked Counter** — Mechanical counter on home page (localStorage)
- **Star on GitHub Button** — Live star count from the repo API

---

## 2. Tech Stack

| Layer          | Technology                               |
|----------------|------------------------------------------|
| Framework      | **Next.js 14** (App Router, `app/` dir)  |
| Language       | **TypeScript**                           |
| Styling        | **Tailwind CSS 3.4** + custom CSS tokens |
| State Mgmt     | **Zustand** (with `persist` middleware)  |
| Server Cache   | **React Query** (`@tanstack/react-query` v5) |
| Animation      | **Framer Motion** v12                    |
| UI Primitives  | **Radix UI** (Dialog, DropdownMenu, Tabs, Tooltip, Slot) |
| Icons          | **Lucide React**                         |
| Styling Utils  | **CVA** (class-variance-authority), **clsx**, **tailwind-merge** |
| PDF Export     | **jsPDF**                                |
| Confetti       | **canvas-confetti**                      |
| Testing        | **Vitest** + **React Testing Library** + **jest-axe** |

---

## 3. Directory Structure

```
badge-hunter-2/
├── app/                        # Next.js App Router pages
│   ├── api/                    # API routes (server-side)
│   │   ├── analyze/[username]/ # ← Main data-fetching route (server-side)
│   │   ├── og/                 # Open Graph image generation
│   │   ├── share-card/         # Share card image generation
│   │   └── sitemap/            # Sitemap generation
│   ├── compare/page.tsx        # Compare two profiles
│   ├── leaderboard/page.tsx    # Leaderboard page
│   ├── wrapped/page.tsx        # GitHub Wrapped summary
│   ├── u/[username]/page.tsx   # User profile analysis page
│   ├── layout.tsx              # Root layout (fonts, Header, Footer, Providers)
│   ├── page.tsx                # Home page
│   ├── providers.tsx           # React Query provider
│   └── globals.css             # Tailwind + custom CSS tokens
│
├── components/
│   ├── layout/                 # Header, Footer, MobileNav
│   ├── primitives/             # BadgeCard, StatCounter, ProgressBar, SkeletonCard,
│   │                           #   RarityBadge, RoadmapStep, TimelineEntry, ConfettiTrigger
│   ├── sections/               # ProfileSection, BadgeGrid, RoadmapPanel, TimelineView,
│   │                           #   StatsPanel, CompareView, Leaderboard, ShareModal,
│   │                           #   HeroSection, SearchSection
│   └── ui/                     # shadcn/ui base components
│
├── lib/
│   ├── api/                    # GitHub API clients
│   │   ├── github-rest.ts      # REST API (/users, /repos, /orgs, /search)
│   │   ├── github-graphql.ts   # GraphQL API (contributions, languages, repos detail)
│   │   └── github-events.ts    # Public events API (3 pages, up to 300 events)
│   ├── data/
│   │   └── badge-definitions.ts # All 14 badge definitions, emojis, tiers, checklist
│   ├── engines/                # Pure computation engines
│   │   ├── analyzer.ts         # Orchestrates API calls → normalised GitHubProfile
│   │   ├── badge-engine.ts     # Evaluates badges against profile
│   │   ├── badge-predictor.ts  # 90-day badge probability predictions
│   │   ├── roadmap-engine.ts   # Generates step-by-step roadmap to next badge
│   │   ├── score-engine.ts     # Computes GitHub + OSS scores
│   │   ├── streak-engine.ts    # Current + longest streak from events
│   │   ├── repo-health.ts      # Per-repo health score (README, license, issues)
│   │   └── hacktoberfest-engine.ts # Hacktoberfest-related logic
│   ├── hooks/
│   │   ├── useAnalyze.ts       # Main data hook: fetches from /api/analyze/[username],
│   │   │                       #   runs badge/score/roadmap engines, updates stores
│   │   ├── useLeaderboard.ts   # Sorts leaderboard entries by active tab metric
│   │   ├── useReducedMotion.ts # Respects prefers-reduced-motion
│   │   └── useSearchHistory.ts # Tracks recent profile searches
│   ├── store/                  # Zustand stores
│   │   ├── profile-store.ts    # Persisted: current profile, evaluations, scores, roadmap
│   │   ├── badge-store.ts      # Persisted: favourites, bookmarks (offline snapshots)
│   │   ├── leaderboard-store.ts# Persisted: all analyzed profiles for leaderboard ranking
│   │   ├── compare-store.ts    # Compare page state
│   │   └── ui-store.ts         # Non-persisted: active tab, RPG mode, share modal state
│   ├── utils/
│   │   ├── formatters.ts       # formatNumber, formatDate, computeAccountAge, computeTopLanguages
│   │   ├── input-parser.ts     # Parse/validate GitHub username input
│   │   └── animation-variants.ts # Framer Motion animation variant objects
│   └── utils.ts                # cn() helper (clsx + tailwind-merge)
│
├── types/
│   └── index.ts                # ALL TypeScript types/interfaces for the entire app
│
├── tests/                      # Vitest test files
├── public/                     # Static assets
├── .env.local                  # GITHUB_TOKEN (not committed, in .gitignore)
└── package.json
```

---

## 4. Design System & Styling Conventions

### Theme: "Cream Newspaper" Aesthetic
The design is inspired by a **vintage newspaper/broadsheet** look with a cream paper background, dark ink borders, thick card shadows, and monospace kickers. Think "Kolkata travel router" meets a retro dashboard.

### Color Palette
| Token            | Hex       | Usage                              |
|------------------|-----------|------------------------------------|
| `--paper`        | `#f7f9f6` | Page background                    |
| `--ink`          | `#16211a` | Primary text, borders              |
| `--soft`         | `#4f6156` | Secondary text, muted labels       |
| `--line`         | `#cbd8cf` | Subtle borders, dividers           |
| `--cream`        | `#eef4ec` | Card backgrounds, hover states     |
| `--accent-color` | `#1f6f4a` | Primary green accent (buttons, links, badges) |
| `--accent2-color`| `#0f5c78` | Blue accent (compare, secondary)   |
| Amber            | `#b45309` | Warnings, weekly challenges        |
| Amber bg         | `#fdfaf2` | Warning card backgrounds           |

### Typography (Google Fonts via `next/font`)
| CSS Variable      | Font                  | Usage                        |
|--------------------|-----------------------|------------------------------|
| `--font-bricolage` | Bricolage Grotesque   | Headings (h1–h6), brand      |
| `--font-hanken`    | Hanken Grotesk        | Body text (default)          |
| `--font-spline`    | Spline Sans Mono      | Monospace: counters, labels, code, kickers |

### CSS Class Conventions
| Class                   | Purpose                                                  |
|-------------------------|----------------------------------------------------------|
| `.news-header`          | Section header with 3px bottom border                    |
| `.news-kicker`          | Small monospace uppercase label (e.g., "BH BADGE HUNTER") |
| `.news-title`           | Hero headline with responsive `clamp()` sizing           |
| `.news-card`            | Standard card: white bg, 2px dark border, 6px radius, lift-on-hover shadow |
| `.news-tag`             | Section tag label (monospace, green, uppercase)           |
| `.news-button-primary`  | Dark button with shadow, hover-to-accent transition      |
| `.news-button-secondary`| Light button variant                                     |

### Key Design Patterns
- **All cards** use `border-2 border-[#16211a]` + `rounded-[6px]`
- **Shadows** follow the "layered paper" look: `shadow-[0_4px_0_#16211a]` or `shadow-[3px_3px_0_#16211a]`
- **Buttons** use `shadow-[0_4px_0_#16211a]` with `hover:translate-y-[1px]` and `active:translate-y-[3px]` for physical press feel
- **Color coding**: Green (`#1f6f4a`) = positive/unlocked, Amber (`#b45309`) = warning/in-progress, Red = errors
- **Rarity color map**: Common=`#cbd8cf`, Rare=`#dceff7`, Epic=`#ebe5ff`, Legendary=`#f3eadc`, Secret=`#f7d6d6`

---

## 5. Data Flow Architecture

### How data moves through the app:

```
User enters username on Home Page
  │
  ▼
Navigate to /u/[username]
  │
  ▼
useAnalyze(username) hook fires
  │
  ├─ React Query checks cache (staleTime: 5min)
  │   └─ Cache hit? → return cached data, skip fetch
  │
  ├─ Cache miss → fetch('/api/analyze/${username}')
  │     │
  │     ▼
  │   SERVER: /api/analyze/[username]/route.ts
  │     │
  │     ├─ Analyzer.analyse(username) runs on server
  │     │   ├─ fetchRESTProfile()        → user info (followers, repos, etc.)
  │     │   ├─ fetchGraphQLStats()       → commits, PRs, issues, languages, stars (needs GITHUB_TOKEN)
  │     │   ├─ fetchPublicEvents()       → 300 recent events (for streaks, fallback counts)
  │     │   └─ fetchOrgs()               → organization memberships
  │     │
  │     └─ Returns serialized GitHubProfile JSON
  │
  ├─ Client rehydrates Date fields from ISO strings
  │
  ├─ Client-side engines (pure computations):
  │   ├─ BadgeEngine.evaluate(profile)      → BadgeEvaluation[]
  │   ├─ ScoreEngine.compute(profile)       → ScoreResult
  │   └─ RoadmapEngine.generate(evals, events) → RoadmapResult
  │
  ├─ Dispatch to Zustand stores:
  │   ├─ profileStore  → profile, evaluations, scores, roadmap
  │   └─ leaderboardStore → auto-add entry for this user
  │
  └─ Increment localStorage "profiles checked" counter
```

### Store Persistence Map
| Store              | localStorage Key    | Persisted Fields                    |
|--------------------|---------------------|-------------------------------------|
| `profile-store`    | `gbt_profile_cache` | `profile` only                      |
| `badge-store`      | `gbt_favorites`     | `favourites`, `bookmarks`           |
| `leaderboard-store`| `gbt_leaderboard`   | `entries` (all analyzed profiles)   |
| `ui-store`         | _(not persisted)_   | Resets on page refresh              |
| `compare-store`    | _(not persisted)_   | Resets on page refresh              |

---

## 6. GitHub API Strategy

### With `GITHUB_TOKEN` (`.env.local`)
- **GraphQL API** returns accurate: `totalCommitContributions`, `totalPullRequestContributions`, `totalIssueContributions`, `totalGists`, `totalPackages`, per-repo language bytes, stars, forks, README/license/contributing file presence
- **REST API** returns: user profile (followers, repos, bio, created_at, public_gists), orgs
- **Events API** returns: last 300 public events (for streaks)

### Without `GITHUB_TOKEN` (fallback)
- **GraphQL API** fails → falls back to REST repos endpoint for stars/forks/languages (estimated)
- **REST API** returns: same user profile data
- **Events API** returns: same events (used for commit/PR/issue count fallback)
- `totalCommits` counted from PushEvent payloads in events
- `totalPRs` counted from PullRequestEvent events
- `totalIssues` counted from IssuesEvent events
- `totalGists` falls back to `rest.public_gists`
- ⚠️ Events only cover last ~90 days — counts will be lower than reality

### Rate Limits
- REST: 60 req/hr (unauthenticated) or 5000 req/hr (with token)
- GraphQL: Requires token, 5000 points/hr
- API route caches responses: `s-maxage=300, stale-while-revalidate=60`
- React Query cache: `staleTime: 5min`, `gcTime: 10min`

---

## 7. Badge Definitions (14 total)

| ID                     | Name                          | Metric Key           | Tiers              | Rarity    |
|------------------------|-------------------------------|----------------------|---------------------|-----------|
| `pull-shark`           | Pull Shark                    | `totalPRs`           | 2/16/128           | Rare      |
| `quickdraw`            | Quickdraw                     | `totalPRs`           | 1                  | Common    |
| `galaxy-brain`         | Galaxy Brain                  | `totalDiscussions`   | 2/8/16             | Epic      |
| `yolo`                 | YOLO                          | `totalPRs`           | 1                  | Common    |
| `starstruck`           | Starstruck                    | `starsReceived`      | 16/128/512         | Rare      |
| `pair-extraordinaire`  | Pair Extraordinaire           | `totalPRs`           | 10/24/48           | Rare      |
| `arctic-code-vault`    | Arctic Code Vault Contributor | `totalCommits`       | 1                  | Legendary |
| `public-sponsor`       | Public Sponsor                | `totalPRs`           | 1                  | Legendary |
| `mars-2020`            | Mars 2020 Helicopter Contrib. | `totalCommits`       | 1                  | Legendary |
| `dev-program-member`   | Developer Program Member      | `totalPRs`           | 1                  | Common    |
| `open-source-contributor`| Open Source Contributor      | `mergedExternalPRs`  | 1                  | Common    |
| `achievement-hunter`   | Achievement Hunter            | `totalPRs`           | 5                  | Rare      |
| `early-adopter`        | Early Adopter                 | `accountAgeYears`    | 1                  | Common    |
| `secret-badge-1`       | ??? Secret Badge              | `totalCommits`       | 1                  | Secret    |

---

## 8. Key Architecture Decisions

1. **Server-side API route for GitHub calls** — `/api/analyze/[username]/route.ts` runs on the server where `GITHUB_TOKEN` is available via `process.env`. The client hooks fetch from this endpoint, not directly from GitHub APIs.

2. **Client-side engine computation** — Badge evaluation, scoring, roadmap generation are pure functions that run on the client after receiving the profile data. This keeps the API route thin and allows instant re-computation.

3. **Zustand with `persist` for cross-page state** — Profile data, favourites, bookmarks, and leaderboard entries survive page navigation and refresh via `localStorage`.

4. **React Query for data caching** — `useAnalyze` uses `@tanstack/react-query` with query key `['profile', username]`. Prevents duplicate requests and provides loading/error states.

5. **In-flight deduplication** — `fetchProfile()` uses a module-level `Map<string, Promise>` to prevent duplicate API calls for the same username.

6. **Date rehydration** — API route serializes `Date` objects as ISO strings. Client rehydrates them in `useAnalyze` after fetch.

7. **Dynamic imports** — `ShareModal`, `CompareView`, `Leaderboard` are loaded with `next/dynamic` to reduce initial bundle size.

---

## 9. Environment Variables

| Variable       | Required | Description                                     |
|----------------|----------|-------------------------------------------------|
| `GITHUB_TOKEN` | Optional | GitHub PAT for full API accuracy. Scopes: `read:user`, `read:org`. Set in `.env.local`. |

---

## 10. Important Files Quick Reference

| What                    | File                                        |
|-------------------------|---------------------------------------------|
| Home page               | `app/page.tsx`                              |
| Profile page            | `app/u/[username]/page.tsx`                 |
| API data route          | `app/api/analyze/[username]/route.ts`       |
| Type definitions        | `types/index.ts`                            |
| Badge definitions       | `lib/data/badge-definitions.ts`             |
| Main data hook          | `lib/hooks/useAnalyze.ts`                   |
| GitHub REST client      | `lib/api/github-rest.ts`                    |
| GitHub GraphQL client   | `lib/api/github-graphql.ts`                 |
| Data normalizer         | `lib/engines/analyzer.ts`                   |
| Global CSS tokens       | `app/globals.css`                           |
| Root layout + fonts     | `app/layout.tsx`                            |
| Tailwind config         | `tailwind.config.ts`                        |

---

## 11. Testing

- **Runner:** Vitest with jsdom environment
- **Command:** `npm run test` → `vitest --run`
- **Libraries:** `@testing-library/react`, `jest-axe` (accessibility), `fast-check` (property-based)
- **Coverage:** `@vitest/coverage-v8`

---

## 12. Conventions & Rules

- **Never remove existing comments** — preserve all inline documentation
- **All cards** use the `.news-card` pattern or equivalent inline TW classes
- **Hardcoded colors** use the palette from Section 4 — do not introduce new brand colors without discussion
- **Font usage**: Bricolage for headings, Hanken for body, Spline Mono for code/labels
- **Badge emojis** are defined in `BADGE_EMOJIS` in `badge-definitions.ts` — use these, not arbitrary emoji
- **State**: Use Zustand stores for shared state, React Query for server data, local state for component-only UI
- **All GitHub API calls** MUST go through the server-side API route (`/api/analyze/[username]`) — never call GitHub APIs directly from client components
