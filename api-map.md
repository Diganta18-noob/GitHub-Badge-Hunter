# API Inventory — Badge Hunter

This document provides a detailed catalog of the application's backend API endpoints, input payloads, and integration behaviors.

---

## 1. REST Endpoint Reference

### `GET /api/analyze/[username]`
- **Target File:** `app/api/analyze/[username]/route.ts`
- **Purpose:** Fetches, normalizes, and aggregates a user's complete GitHub profile stats.
- **Path Parameters:**
  - `username` (string, required): GitHub username to query.
- **Success Response (200 OK):**
  Returns a serialized `GitHubProfile` JSON object.
  ```json
  {
    "username": "Diganta18-noob",
    "name": "Diganta",
    "avatarUrl": "https://avatars.githubusercontent.com/u/...",
    "bio": "Developer bio...",
    "createdAt": "2020-01-01T00:00:00.000Z",
    "accountAgeYears": 6,
    "followers": 15,
    "following": 10,
    "publicRepos": 18,
    "totalCommits": 450,
    "totalPRs": 12,
    "totalIssues": 3,
    "totalDiscussions": 0,
    "totalGists": 2,
    "totalPackages": 0,
    "starsReceived": 25,
    "forksReceived": 4,
    "mergedExternalPRs": 1,
    "contributorsToRepos": 0,
    "organizations": [],
    "languages": [
      { "name": "TypeScript", "bytes": 45000, "color": "#3178c6" }
    ],
    "recentEvents": [],
    "fetchedAt": "2026-06-20T22:00:00.000Z",
    "repositories": []
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"error": "Username is required"}`
  - `404 Not Found`: `{"error": "GitHub user not found. Please check the username and try again.", "code": "GBT_ERR_NOT_FOUND"}`
  - `403 / 429 Forbidden/Too Many Requests`: `{"error": "GitHub API rate limit reached. Please try again in a few minutes.", "code": "GBT_ERR_RATE_LIMITED"}`
  - `500 Internal Server Error`: `{"error": "An unknown error occurred"}`
- **Dependencies:**
  - `lib/api/github-rest.ts`
  - `lib/api/github-graphql.ts`
  - `lib/api/github-events.ts`
  - `lib/engines/analyzer.ts`

---

## 2. Dynamic Image Rendering Endpoints

### `GET /api/og`
- **Target File:** `app/api/og/route.tsx`
- **Purpose:** Renders the generic 1200x630 Open Graph preview image dynamically using Next.js Edge runtime and `@vercel/og` (`ImageResponse`).
- **Query Parameters:** None.
- **Success Response (200 OK):** PNG image payload.

### `GET /api/share-card`
- **Target File:** `app/api/share-card/route.tsx`
- **Purpose:** Renders a 1200x630 share card matching the broadsheet aesthetic, containing the dynamic username parameter.
- **Query Parameters:**
  - `username` (string, optional, defaults to `'unknown'`): Profile owner name.
- **Success Response (200 OK):** PNG image payload with `Cache-Control: public, max-age=3600`.
