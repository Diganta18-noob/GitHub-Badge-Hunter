// tests/unit/input-parser.test.ts

import { describe, it, expect } from 'vitest';
import { parseInput, INPUT_ERRORS } from '@/lib/utils/input-parser';

describe('Input Parser — Unit Tests', () => {
  it('returns EMPTY error for empty string', () => {
    const result = parseInput('');
    expect(result.error).toBe('EMPTY');
    expect(result.username).toBeNull();
  });

  it('returns EMPTY error for whitespace-only string', () => {
    const result = parseInput('   ');
    expect(result.error).toBe('EMPTY');
    expect(result.username).toBeNull();
  });

  it('returns INVALID_FORMAT for username with spaces', () => {
    const result = parseInput('user with spaces');
    expect(result.error).toBe('INVALID_FORMAT');
    expect(result.username).toBeNull();
  });

  it('returns INVALID_FORMAT for username with special characters', () => {
    const result = parseInput('user@name!');
    expect(result.error).toBe('INVALID_FORMAT');
    expect(result.username).toBeNull();
  });

  it('returns INVALID_FORMAT for username longer than 39 characters', () => {
    const longName = 'a'.repeat(40);
    const result = parseInput(longName);
    expect(result.error).toBe('INVALID_FORMAT');
    expect(result.username).toBeNull();
  });

  it('parses bare valid username', () => {
    const result = parseInput('torvalds');
    expect(result.username).toBe('torvalds');
    expect(result.error).toBeNull();
  });

  it('parses username with hyphens', () => {
    const result = parseInput('my-user-name');
    expect(result.username).toBe('my-user-name');
    expect(result.error).toBeNull();
  });

  it('parses https://github.com/username URL', () => {
    const result = parseInput('https://github.com/torvalds');
    expect(result.username).toBe('torvalds');
    expect(result.error).toBeNull();
  });

  it('parses http://github.com/username URL', () => {
    const result = parseInput('http://github.com/octocat');
    expect(result.username).toBe('octocat');
    expect(result.error).toBeNull();
  });

  it('parses github.com/username URL (no protocol)', () => {
    const result = parseInput('github.com/octocat');
    expect(result.username).toBe('octocat');
    expect(result.error).toBeNull();
  });

  it('handles trailing slash in URL', () => {
    const result = parseInput('https://github.com/torvalds/');
    expect(result.username).toBe('torvalds');
    expect(result.error).toBeNull();
  });

  it('trims whitespace from input', () => {
    const result = parseInput('  torvalds  ');
    expect(result.username).toBe('torvalds');
    expect(result.error).toBeNull();
  });

  it('preserves raw input in result', () => {
    const result = parseInput('  torvalds  ');
    expect(result.raw).toBe('  torvalds  ');
  });

  it('INPUT_ERRORS has correct messages', () => {
    expect(INPUT_ERRORS.EMPTY).toBe('Please enter a GitHub username or profile URL');
    expect(INPUT_ERRORS.INVALID_FORMAT).toBe('Invalid GitHub username format');
  });
});
