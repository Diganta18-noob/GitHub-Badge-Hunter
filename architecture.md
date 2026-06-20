# System Architecture — Badge Hunter

This document details the system design, API caching, client computation pipeline, and offline persistence patterns of the Badge Hunter application.

---

## 1. Architectural Design

```
                     +----------------------------+
                     |       Client Browser       |
                     +--------------+-------------+
                                    |
                        HTTP Requests (JSON)
                                    |
                                    v
                     +--------------+-------------+
                     |        Next.js Server      |
                     +--------------+-------------+
                                    |
                        Authenticated HTTPS API Calls
                                    |
                                    v
                     +--------------+-------------+
                     |         GitHub API         |
                     +----------------------------+
```

### Server-Client Proxy Boundary
To bypass client-side CORS issues and secure credentials:
- **Server Responsibilities:** Node.js API handlers retrieve user profiles, repos, and events. These handlers authenticate with GitHub using the `GITHUB_TOKEN` secret. They normalize the response data and append Next.js Cache-Control headers.
- **Client Responsibilities:** The client calls `/api/analyze/[username]`. Using the normalized data, the client runs computations (Zustand store dispatch, badges, streaks, and roadmap estimations) entirely in the browser.

---

## 2. Calculation Pipeline

When user profile data is returned from the API route, the `useAnalyze` hook triggers the following synchronous pipeline:

```
[Normalized Profile Data]
           │
           ├──> [BadgeEngine] ──> Evaluates 14 badges -> BadgeEvaluation[]
           │
           ├──> [ScoreEngine] ──> Calculates GitHub & OSS health scores
           │
           ├──> [RoadmapEngine] ──> Computes estimated days & roadmap milestones
           │
           ├──> [streak-engine] ──> Counts consecutive contribution days from events
           │
           └──> [badge-predictor] ──> Predicts unlocking probability in 90 days
```

---

## 3. Caching and Refresh Strategy

To stay within GitHub API rate limits (5,000 requests/hour with token; 60 requests/hour without), caching is implemented at two layers:

1. **Server-Side Route Cache:**
   The Next.js API route returns data with:
   `Cache-Control: public, s-maxage=300, stale-while-revalidate=60`
   Vercel edge networks cache these requests for 5 minutes.

2. **Client-Side Query Cache:**
   React Query manages client state caching:
   `staleTime: 5 * 60 * 1000` (5 minutes)
   `gcTime: 10 * 60 * 1000` (10 minutes)

---

## 4. Offline Snapshots & Storage

Zustand handles persistent storage using the `persist` middleware:

- **Bookmarks:** Profile data is snapshotted and stored in the `gbt_favorites` localStorage key under the `bookmarks` dictionary. When a user loads a bookmarked profile, the hook bypasses the network fetch and serves the offline snapshot.
- **Leaderboards:** The `gbt_leaderboard` key persists analyzed profile ranks across browser sessions.
