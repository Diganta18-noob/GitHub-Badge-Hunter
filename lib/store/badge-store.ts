// lib/store/badge-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GitHubProfile } from '@/types';

interface BadgeState {
  favourites: string[];
  bookmarks: Record<string, GitHubProfile>;
  addFavourite: (username: string) => void;
  removeFavourite: (username: string) => void;
  addBookmark: (username: string, profile: GitHubProfile) => void;
  removeBookmark: (username: string) => void;
}

export const useBadgeStore = create<BadgeState>()(
  persist(
    (set) => ({
      favourites: [],
      bookmarks: {},
      addFavourite: (username) =>
        set((s) => ({
          favourites: s.favourites.includes(username)
            ? s.favourites
            : [...s.favourites, username],
        })),
      removeFavourite: (username) =>
        set((s) => ({
          favourites: s.favourites.filter((u) => u !== username),
        })),
      addBookmark: (username, profile) =>
        set((s) => ({
          bookmarks: { ...s.bookmarks, [username]: profile },
        })),
      removeBookmark: (username) =>
        set((s) => {
          const rest = { ...s.bookmarks };
          delete rest[username];
          return { bookmarks: rest };
        }),
    }),
    {
      name: 'gbt_favorites',
    },
  ),
);
