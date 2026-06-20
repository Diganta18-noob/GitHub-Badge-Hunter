# Client-Side Database & Persistence Map — Badge Hunter

Badge Hunter does not utilize a backend SQL or NoSQL database. All data persistence and caching are handled directly on the client browser using Zustand stores with `persist` middleware configured for `localStorage`.

---

## 1. Storage Configuration

| LocalStorage Key | Store Name | Target state fields | Duration |
| :--- | :--- | :--- | :--- |
| `gbt_profile_cache` | `profile-store` | `profile` (excluding UI loading/error states) | Indefinite |
| `gbt_favorites` | `badge-store` | `favourites` (usernames), `bookmarks` (full profile maps) | Indefinite |
| `gbt_leaderboard` | `leaderboard-store` | `entries` (sorted and ranked leaderboard profiles) | Indefinite |

---

## 2. Store Schemas

### `profile-store` (`gbt_profile_cache`)
Caches the last successfully inspected user profile to prevent unnecessary API fetches upon page reloads.
- **Stored Object Schema:**
  ```typescript
  {
    "profile": GitHubProfile | null
  }
  ```

### `badge-store` (`gbt_favorites`)
Stores the user's customized bookmarks (offline snapshot of profile data) and favorited profile usernames.
- **Stored Object Schema:**
  ```typescript
  {
    "favourites": string[],                  // Array of usernames
    "bookmarks": Record<string, GitHubProfile> // Full profile data maps keyed by username
  }
  ```

### `leaderboard-store` (`gbt_leaderboard`)
Maintains the ranking board of profiles analyzed on the client's browser.
- **Stored Object Schema:**
  ```typescript
  {
    "entries": Array<{
      "username": string;
      "avatarUrl": string;
      "badgeCount": number;
      "badgesLast30Days": number;
      "totalContributions": number;
      "totalPRs": number;
      "trend": "up" | "down" | "new";
      "rank": number;
    }>
  }
  ```

---

## 3. Entity Relationships

Since there is no foreign key verification on localStorage:
- **`favourites` & `bookmarks`:** Elements of `favourites` correspond to keys in `bookmarks`.
- **`leaderboard-store`:** Contains a subset of statistics copied directly from active `GitHubProfile` objects upon successful query completion.
