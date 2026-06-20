# Badge Hunter — Project Memory & System Architecture

> **Last Updated:** June 20, 2026
> **Owner:** Diganta18-noob
> **Repository:** `Diganta18-noob/badge2`
> **Primary Purpose:** permanent codebase brain & reference documentation

---

## 1. Project Overview
**Badge Hunter** is a GitHub Achievement Badge Tracker and dashboard. Users can inspect any GitHub user profile to determine which of GitHub's 14 achievement badges they have unlocked, visualize their progress, check contribution streaks, get predictions for upcoming badges, generate learning/badge roadmaps, and see repo health stats. It is designed to make badge achievement queues legible and interactive.

---

## 2. Business Purpose (Project Purpose)
GitHub awards badges, but the criteria and progress metrics are often obscured or scattered. Badge Hunter solves this by providing a unified "control room" style portal.
- **Problem Solved:** Centralizes, calculates, and monitors badge progression, activity events, and repository health metrics in a single interface.
- **Target Audience:** Open-source contributors, GitHub developers, and gamification enthusiasts.
- **Workflow:** 
  1. User enters a GitHub username on the Home Page.
  2. The system triggers a backend API profile analysis.
  3. The client receives normalized profile data, runs calculations via pure engines (badge, streak, score, roadmap, predictor, health), and dispatches results to Zustand stores.
  4. The profile page renders details about badges, streaks, health scores, and recommended open-source repos.
  5. The user can compare profiles, view their Year-in-Review Wrapped heatmap, or inspect the persistent Leaderboard.

---

## 3. Tech Stack

- **Core Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3.4 + Custom CSS theme tokens (globals.css) using a "Cream Newspaper" aesthetic
- **State Management:** Zustand (with localStorage persistence)
- **Server Cache / Fetching:** `@tanstack/react-query` v5
- **Animation:** Framer Motion v12
- **UI Components:** Radix UI primitives (Dialog, DropdownMenu, Tabs, Tooltip, Slot) + Lucide React icons
- **Styling Utilities:** `class-variance-authority` (CVA), `clsx`, `tailwind-merge`
- **PDF Export:** jsPDF
- **Confetti:** canvas-confetti
- **Testing Suite:** Vitest + React Testing Library + jest-axe + fast-check

---

## 4. Repository Structure

```
c:/Antigravity/badge hunter 2/
├── app/                        # Next.js App Router folders
│   ├── api/                    # Server-side API routes
│   │   ├── analyze/[username]/ # Main API endpoint wrapping Analyzer
│   │   ├── og/                 # Dynamic Open Graph image generation
│   │   ├── share-card/         # Share card generation
│   │   └── sitemap/            # Sitemap XML generator
│   ├── compare/page.tsx        # Profile comparison page
│   ├── leaderboard/page.tsx    # Leaderboard view (Zustand entries list)
│   ├── wrapped/page.tsx        # Annual Activity Wrapped and heatmap replay
│   ├── u/[username]/page.tsx   # Detailed user profile page
│   ├── layout.tsx              # Root HTML wrapper and fonts loader
│   ├── page.tsx                # Landing search page
│   ├── providers.tsx           # React Query client provider wrapper
│   └── globals.css             # CSS variables and broadsheet tokens
│
├── components/                 # React UI elements
│   ├── layout/                 # Layout wrappers: Header, Footer, MobileNav
│   ├── primitives/             # Small UI items: BadgeCard, StatCounter, ProgressBar
│   └── sections/               # Large component sections: ProfileSection, BadgeGrid
│
├── lib/                        # Infrastructure and business logic
│   ├── api/                    # HTTP interaction layer
│   │   ├── github-rest.ts      # REST requests (user profiles, repos, recommendations)
│   │   ├── github-graphql.ts   # GraphQL stats (contributions, repo details)
│   │   └── github-events.ts    # Public events stream (300 items max)
│   ├── data/
│   │   └── badge-definitions.ts# Badge metrics, tiers, and checklist validators
│   ├── engines/                # Pure mathematical calculations
│   │   ├── analyzer.ts         # Directs API fetches -> Normalised GitHubProfile
│   │   ├── badge-engine.ts     # Computes badge unlock tiers and progress
│   │   ├── badge-predictor.ts  # 90-day probability prediction models
│   │   ├── roadmap-engine.ts   # Produces actionable milestones
│   │   ├── score-engine.ts     # Computes GitHub and Open Source health scores
│   │   ├── streak-engine.ts    # Computes contribution streaks from events
│   │   ├── repo-health.ts      # Computes per-repository health score (0-100)
│   │   └── hacktoberfest-engine.ts # Hacktoberfest qualifying PR counter
│   ├── hooks/
│   │   ├── useAnalyze.ts       # React Query data fetching hook
│   │   ├── useLeaderboard.ts   # Dynamic sorting of leaderboard entries
│   │   ├── useReducedMotion.ts # Accessibility query hook
│   │   └── useSearchHistory.ts # Local history of analyzed users
│   ├── store/                  # Zustand state containers
│   │   ├── profile-store.ts    # Holds last analyzed user profile data
│   │   ├── badge-store.ts      # Bookmark and favorite snapshotted profiles
│   │   ├── leaderboard-store.ts# Persisted list of ranked users
│   │   ├── compare-store.ts    # User comparison profile slots
│   │   └── ui-store.ts         # Dynamic non-persisted UI states
│   └── utils/
│       ├── formatters.ts       # Numeric and date formatting utils
│       ├── input-parser.ts     # Username validation utilities
│       └── animation-variants.ts # Motion configurations
│
├── tests/                      # Testing directory
│   ├── integration/            # Accessiblity and API error integration tests
│   ├── property/               # fast-check property testing definitions
│   └── unit/                   # Unit test definitions for engines and parsers
│
└── tsconfig.json, next.config.mjs, tailwind.config.ts # Configuration files
```

---

## 5. System Architecture
The application runs as a hybrid server-client system:

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT (Browser)                                  |
|                                                                                   |
|  [HomePage / Input] --(Router)--> [/u/[username] Page]                            |
|                                       |                                           |
|                                       v                                           |
|                              [useAnalyze Hook]                                    |
|                                       |                                           |
|                  +--------------------+--------------------+                      |
|                  | (React Query Cache Hit)                 | (Cache Miss)         |
|                  v                                         v                      |
|           Rehydrate Dates                           fetch(/api/analyze/...)       |
|                  |                                         |                      |
+------------------|-----------------------------------------|----------------------+
                   |                                         |
                   |                                         v
+------------------|-----------------------------------------|----------------------+
|                  |                  SERVER (Next.js)       |                      |
|                  |                                         v                      |
|                  |                              [GET /api/analyze/username]       |
|                  |                                         |                      |
|                  |                                         v                      |
|                  |                               [Analyzer.analyse()]             |
|                  |                                         |                      |
|                  |                                         +--> REST API /users   |
|                  |                                         +--> GraphQL API       |
|                  |                                         +--> Events API        |
|                  |                                         +--> REST API /orgs    |
|                  |                                         |                      |
|                  |                                         v                      |
|                  |                                  Merge & Normalise             |
|                  |                                         |                      |
|                  |                                         v                      |
|                  |                                   Return Profile JSON          |
|                  |                                         |                      |
+------------------|-----------------------------------------|----------------------+
                   |                                         |
                   +<----------------------------------------+
                   |
                   v
        [Calculations & Pipelines]
           - BadgeEngine.evaluate()
           - ScoreEngine.compute()
           - RoadmapEngine.generate()
           - computeStreaks()
           - predictBadges()
                   |
                   v
        [Dispatch to Stores]
           - profileStore  --> Cache profile
           - leaderboardStore --> Update ranks
           - localStorage  --> Hits counter
```

---

## 6. Routing Map
The project maps paths using Next.js App Router structure:

| Route | File | Purpose | Auth Required |
| :--- | :--- | :--- | :--- |
| `/` | `app/page.tsx` | Home page search screen and 'The Nine' badges layout | No |
| `/compare` | `app/compare/page.tsx` | Compares two profiles side-by-side | No |
| `/leaderboard` | `app/leaderboard/page.tsx`| Persisted Leaderboard rankings page | No |
| `/wrapped` | `app/wrapped/page.tsx` | Annual Activity Wrapped Heatmap and details page | No |
| `/u/[username]` | `app/u/[username]/page.tsx` | Complete profile analysis, statistics, and roadmaps | No |
| `/api/analyze/[username]`| `app/api/analyze/[username]/route.ts`| Backend endpoint triggering GitHub collection | No |
| `/api/og` | `app/api/og/route.tsx` | Open Graph dynamic image generator | No |
| `/api/share-card` | `app/api/share-card/route.tsx`| Sharing card dynamic image generator | No |
| `/api/sitemap` | `app/api/sitemap/route.ts`| XML Sitemap generator | No |

---

## 7. Frontend Architecture

### Component Hierarchy
- **Providers:** `QueryClientProvider` wraps the entire app layout.
- **Header & Footer:** Display broadsheet-like branding, the Star on GitHub live stars count, and a dark mode toggle (RPG mode).
- **Profile View Structure:**
  - `ProfileSection`: Displays name, avatar, bio, and account age.
  - `Streaks & Challenges Row`: Current and longest streaks, plus a dynamically generated weekly challenge.
  - `Predictions & Health Row`: `predictBadges` probability stats alongside `computeRepoHealthScore` metrics.
  - `BadgeGrid`: Evaluates the profile's stats against the 14 badges, displaying unlocked tiers or locking metrics.
  - `RoadmapPanel` & `TimelineView`: Shows next steps and chronological milestones.
  - `StatsPanel`: Displays raw counts, language breakdown, and scores.

### State Management
State is managed across two systems:
1. **React Query:** Manages server-side asynchronous data cache with a 5-minute stale time.
2. **Zustand Stores:**
   - `profile-store`: Caches details of the currently inspected user.
   - `badge-store`: Manages persistent arrays of bookmarked profile snapshots and favorites.
   - `leaderboard-store`: Persists analyzed profiles for ranking calculations.
   - `ui-store`: Handles dynamic layout parameters (e.g. RPG mode toggles).

---

## 8. Backend Architecture
The Next.js backend serves as a secure proxy layer. Since `process.env.GITHUB_TOKEN` is only available server-side, all data-fetching requests proxy through the server to request information from GitHub securely.

### API Controllers & SDKs
- **REST Client (`lib/api/github-rest.ts`):** Requests basic profile details (`/users/${username}`), repo list (`/users/${username}/repos`), org list (`/users/${username}/orgs`), and recommendations.
- **GraphQL Client (`lib/api/github-graphql.ts`):** Fires the query `UserStats` containing specific commit, issue, PR, and repository language breakdowns.
- **Events Client (`lib/api/github-events.ts`):** Requests public events across 3 pages (up to 300 entries) to calculate streak patterns.

---

## 9. Database Architecture
There is **no backend database** in this codebase.
- **Data Persistence:** Persistent storage is entirely client-side via Zustand using the `persist` middleware, which saves key states (`gbt_favorites`, `gbt_leaderboard`, `gbt_profile_cache`) directly to the browser's `localStorage`.
- **Backend Cache:** Next.js uses server-side route headers `Cache-Control: public, s-maxage=300, stale-while-revalidate=60` to cache analysis responses for 5 minutes.

---

## 10. Authentication Flow
There is **no user authentication** system in this application. The tracker works by query inputs targeting public GitHub profiles.
- **API Authentication:** Backend calls to GitHub APIs authenticate using the server's `GITHUB_TOKEN` environment variable, enabling higher rate limits (5,000 requests/hour) and GraphQL queries.

---

## 11. API Inventory

| Method | Endpoint | Purpose | Callers |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analyze/[username]` | Fetches, normalizes, and packages GitHub user profile stats | `useAnalyze` hook |
| `GET` | `/api/og` | Renders the Open Graph image response dynamically | HTML Meta tags |
| `GET` | `/api/share-card` | Generates sharing profile card image with dynamic username | `ShareModal` |
| `GET` | `/api/sitemap` | Generates xml sitemap structure | Search engines |

---

## 12. Environment Variables & Secrets
Only one environment variable is configured:
- `GITHUB_TOKEN`: The GitHub Personal Access Token (PAT) used to authorize server-side requests. Requires read-only permissions (`read:user`, `read:org`). Without this variable, the server falls back to REST calls, which limits data precision and imposes a strict rate limit of 60 requests/hour.

---

## 13. Dependency Graph
- **Critical Files:**
  - `lib/api/github-graphql.ts`: Core data collection layer.
  - `lib/hooks/useAnalyze.ts`: Main query wrapper and rehydration controller.
  - `lib/engines/analyzer.ts`: Normalization and merge controller.
  - `lib/data/badge-definitions.ts`: Definitive list of active badges and checklist logic.
  - `lib/store/leaderboard-store.ts`: Handles persistent scoreboards.

---

## 14. Performance Notes & Debt
- **Token Fallback Limitations:** Without a `GITHUB_TOKEN`, GraphQL queries fail, meaning commits, PRs, and issues are approximated from the public events stream, which only spans ~90 days. This causes metrics to appear lower than their actual historical values.
- **Badge Images:** SVG paths like `/badges/pair-extraordinaire.svg` are reference links; if the file is missing, the page shows the associated emoji.
- **Rate Limit Constraints:** If the unauthenticated rate limit is exhausted, requests will throw `GBT_ERR_RATE_LIMITED`.

---

## 15. Feature Inventory

| Feature Name | Purpose | Frontend Components | Backend Hooks | Ext. Integrations |
| :--- | :--- | :--- | :--- | :--- |
| **Profile Analysis** | Analyze GitHub user stats | `ProfileSection`, `StatsPanel` | `/api/analyze/[username]` | GitHub REST/GraphQL APIs |
| **Badge Evaluation** | Evaluate earned badges | `BadgeGrid`, `BadgeCard` | Client Engine | None |
| **Roadmap Milestones**| Steps to unlock next badges | `RoadmapPanel` | Client Engine | GitHub REST API |
| **Activity Heatmap** | Yearly heatmap visualization | `app/wrapped/page.tsx` | `/api/analyze/[username]` | None |
| **Leaderboard** | Rank analyzed profiles | `Leaderboard.tsx` | Client Store | None |
| **Profile Comparison**| Compare two users side-by-side| `CompareView.tsx` | `/api/analyze/[username]` | None |
| **Sharing Cards** | Social media sharing cards | `ShareModal` | `/api/share-card` | Vercel Image Response |
