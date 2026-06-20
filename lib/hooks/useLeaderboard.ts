// lib/hooks/useLeaderboard.ts
'use client';

import { useMemo } from 'react';
import { useLeaderboardStore } from '@/lib/store/leaderboard-store';
import type { LeaderboardTab, LeaderboardEntry } from '@/types';

const TAB_METRIC_MAP: Record<LeaderboardTab, keyof LeaderboardEntry> = {
  mostBadges: 'badgeCount',
  fastestGrowth: 'badgesLast30Days',
  mostContributions: 'totalContributions',
  mostPRs: 'totalPRs',
};

export function useLeaderboard(tab: LeaderboardTab) {
  const entries = useLeaderboardStore((s) => s.entries);

  return useMemo(() => {
    const metric = TAB_METRIC_MAP[tab];
    return [...entries].sort(
      (a, b) => (b[metric] as number) - (a[metric] as number),
    );
  }, [entries, tab]);
}
