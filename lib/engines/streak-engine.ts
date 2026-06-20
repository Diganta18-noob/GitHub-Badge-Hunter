import type { GitHubEvent } from '@/types';

/**
 * Computes the current and longest contribution streaks in consecutive days.
 */
export function computeStreaks(events: GitHubEvent[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (events.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // 1. Extract and normalize dates to YYYY-MM-DD
  const dateSet = new Set<string>();
  events.forEach((e) => {
    try {
      const dateStr = new Date(e.created_at).toISOString().split('T')[0];
      dateSet.add(dateStr);
    } catch {
      // Ignore invalid date strings
    }
  });

  if (dateSet.size === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // 2. Sort dates in ascending order
  const sortedDates = Array.from(dateSet).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  // 3. Compute streaks
  let longestStreak = 0;
  let currentStreak = 0;
  let runningStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);

    // Check difference in days
    const diffTime = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      runningStreak++;
    } else if (diffDays > 1) {
      longestStreak = Math.max(longestStreak, runningStreak);
      runningStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, runningStreak);

  // 4. Calculate current streak
  // A streak is active if the user made a contribution today or yesterday
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const lastContributionStr = sortedDates[sortedDates.length - 1];
  const isActive = lastContributionStr === todayStr || lastContributionStr === yesterdayStr;

  if (isActive) {
    // Current streak is the length of the final consecutive segment
    currentStreak = runningStreak;
  } else {
    currentStreak = 0;
  }

  return { currentStreak, longestStreak };
}
