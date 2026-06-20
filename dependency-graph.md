# Codebase Dependency Graph — Badge Hunter

This document traces import hierarchies, dependency trees, and highlights high-impact files that are critical to the application's core functionality.

---

## 1. Import Hierarchy Map

```
                       [app/page.tsx] (Home Search)
                             │
                             v
                     [app/u/[username]/page.tsx] (Profile Page)
                             │
            ┌────────────────┴────────────────┬────────────────┐
            v                                 v                v
    [lib/hooks/useAnalyze.ts]        [lib/engines/...]   [components/...]
            │                                 │                │
            ├─► /api/analyze/[username]       │                │
            │          │                      │                │
            │          v                      │                │
            │   [lib/engines/analyzer.ts]     │                │
            │          │                      │                │
            │          ├─► github-rest.ts     │                │
            │          ├─► github-graphql.ts  │                │
            │          └─► github-events.ts   │                │
            v                                 v                v
     [Zustand Stores]                 [Badge & Scores]   [UI Elements]
     (profile, badge, leaderboard)    (definitions.ts)   (BadgeGrid, cards)
```

---

## 2. High-Impact & Core System Files

These files contain critical business rules, credentials processing, or shared types, and should not be modified lightly:

- **`lib/data/badge-definitions.ts`:** Holds the definitive rules, tiers, thresholds, and checklist item evaluation logic for all 14 badges. Modifying this changes the badge assignment parameters globally.
- **`lib/api/github-graphql.ts`:** Manages the GraphQL query payloads sent to GitHub and handles the fallback estimations if no token is present.
- **`lib/hooks/useAnalyze.ts`:** Orchestrates the primary server fetch request, rehydrates ISO date fields, triggers the local computation pipelines, and populates the Zustand stores.
- **`app/api/analyze/[username]/route.ts`:** The sole server endpoint facilitating GitHub queries using the private token.
- **`types/index.ts`:** Declares every unified interface and TypeScript type mapping.

---

## 3. Library Dependencies

The core third-party packages that drive key features are:

- **State Management & Caching:** `@tanstack/react-query` & `zustand`
- **Animations:** `framer-motion`
- **Utility Bindings:** `clsx`, `tailwind-merge`, and `class-variance-authority` (CVA)
- **Exports & Visualization:** `jsPDF` (offline PDF reports) and `canvas-confetti` (celebrations on badge unlock)
