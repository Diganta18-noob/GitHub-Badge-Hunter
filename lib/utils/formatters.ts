// lib/utils/formatters.ts

import type { LanguageEntry } from '@/types';

/**
 * Format a number with comma separators.
 * e.g., 1234 → "1,234"
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/**
 * Format a date as a locale-aware date string.
 */
export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Compute the number of whole years between createdAt and now.
 */
export function computeAccountAge(createdAt: Date): number {
  const now = new Date();
  return Math.floor(
    (now.getTime() - createdAt.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
}

/**
 * Return the top 8 languages by bytes, each with a percentage field.
 * Percentages are computed relative to the total bytes of the top 8.
 */
export function computeTopLanguages(languages: LanguageEntry[]): LanguageEntry[] {
  if (languages.length === 0) return [];

  // Sort descending by bytes and take top 8
  const sorted = [...languages].sort((a, b) => b.bytes - a.bytes).slice(0, 8);

  // Compute total bytes of the top entries
  const totalBytes = sorted.reduce((sum, lang) => sum + lang.bytes, 0);

  if (totalBytes === 0) return sorted.map((lang) => ({ ...lang, percentage: 0 }));

  return sorted.map((lang) => ({
    ...lang,
    percentage: Math.round((lang.bytes / totalBytes) * 1000) / 10, // 1 decimal place
  }));
}
