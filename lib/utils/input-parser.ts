// lib/utils/input-parser.ts

import type { ParsedInput } from '@/types';

const VALID_USERNAME_RE = /^[a-zA-Z0-9\-]{1,39}$/;
const GITHUB_URL_RE = /^(?:https?:\/\/)?github\.com\/([a-zA-Z0-9\-]{1,39})\/?$/;

export function parseInput(raw: string): ParsedInput {
  const trimmed = raw.trim();

  if (trimmed === '') {
    return { raw, username: null, error: 'EMPTY' };
  }

  // Try URL form first
  const urlMatch = trimmed.match(GITHUB_URL_RE);
  if (urlMatch) {
    return { raw, username: urlMatch[1], error: null };
  }

  // Bare username
  if (VALID_USERNAME_RE.test(trimmed)) {
    return { raw, username: trimmed, error: null };
  }

  return { raw, username: null, error: 'INVALID_FORMAT' };
}

export const INPUT_ERRORS = {
  EMPTY: 'Please enter a GitHub username or profile URL',
  INVALID_FORMAT: 'Invalid GitHub username format',
} as const;
