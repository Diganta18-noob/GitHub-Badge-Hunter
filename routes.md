# Routing Map — Badge Hunter

This document maps all routes, layout hierarchies, dynamic parameters, and API endpoints.

---

## 1. Page Routes

| Route Pattern | Target File | Purpose | Authentication |
| :--- | :--- | :--- | :--- |
| `/` | `app/page.tsx` | Landing search and high-level project description | None |
| `/compare` | `app/compare/page.tsx` | Compare stats between two user profiles | None |
| `/leaderboard` | `app/leaderboard/page.tsx`| Persistence-based leaderboard sorting table | None |
| `/wrapped` | `app/wrapped/page.tsx` | Year-in-Review activity recap dashboard | None |
| `/u/[username]` | `app/u/[username]/page.tsx` | Core user profile analysis details | None |

---

## 2. API Routes

| Endpoint | Target File | HTTP Method | Response Format | Caching |
| :--- | :--- | :---: | :---: | :--- |
| `/api/analyze/[username]` | `app/api/analyze/[username]/route.ts` | `GET` | JSON (`GitHubProfile`) | `s-maxage=300, stale-while-revalidate=60` |
| `/api/og` | `app/api/og/route.tsx` | `GET` | PNG Image (1200x630) | None |
| `/api/share-card` | `app/api/share-card/route.tsx` | `GET` | PNG Image (1200x630) | `max-age=3600` |
| `/api/sitemap` | `app/api/sitemap/route.ts` | `GET` | XML Sitemap | None |

---

## 3. Layout Hierarchy

All routes inherit from the root layout:

```
[app/layout.tsx] (Root Layout, Font Definitions, HTML Wrapper)
   └── [app/providers.tsx] (React Query Client Provider)
          └── [Header] (Navigation, RPG Mode Toggle, Star on GitHub Count)
                 ├── [Page Component] (e.g. Home, Profile, Leaderboard)
                 └── [Footer] (Broadsheet style branding links)
```
