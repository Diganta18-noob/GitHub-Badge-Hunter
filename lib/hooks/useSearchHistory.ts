// lib/hooks/useSearchHistory.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import type { SearchHistoryEntry } from '@/types';

const STORAGE_KEY = 'gbt_search_history';
const MAX_ENTRIES = 20;

function readHistory(): SearchHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: SearchHistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage quota exceeded or unavailable
  }
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const addEntry = useCallback((username: string) => {
    setHistory((prev) => {
      // Deduplicate
      const filtered = prev.filter((e) => e.username !== username);
      // Prepend new entry
      const updated: SearchHistoryEntry[] = [
        { username, analyzedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, MAX_ENTRIES);

      writeHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    writeHistory([]);
  }, []);

  return { history, addEntry, clearHistory };
}
