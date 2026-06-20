'use client';

import Image from 'next/image';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { useUIStore } from '@/lib/store/ui-store';
import type { LeaderboardTab } from '@/types';

const TABS: { key: LeaderboardTab; label: string }[] = [
  { key: 'mostBadges', label: 'Most Badges' },
  { key: 'fastestGrowth', label: 'Fastest Growth' },
  { key: 'mostContributions', label: 'Most Contributions' },
  { key: 'mostPRs', label: 'Most PRs' },
];

export default function Leaderboard() {
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const entries = useLeaderboard(activeTab);

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-[6px] border-2 border-[#16211a] px-4 py-2 text-xs font-mono font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#1f6f4a] ${
              activeTab === tab.key
                ? 'bg-[#1f6f4a] text-white shadow-[0_2px_0_#16211a]'
                : 'bg-[var(--cream)] text-[var(--ink)] hover:bg-[var(--line)] shadow-[0_2px_0_#16211a]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Entries */}
      {entries.length < 3 ? (
        <div className="news-card p-12 text-center">
          <span className="text-4xl">🔍</span>
          <p className="mt-4 text-sm text-[var(--soft)] font-medium">
            Analyze more profiles to populate the leaderboard.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, idx) => (
            <div
              key={entry.username}
              className={`flex items-center gap-4 rounded-[6px] border-2 border-[#16211a] p-4 transition-all ${
                idx === 0
                  ? 'bg-[#fdf6e2] shadow-[3px_3px_0_var(--ink)]'
                  : idx === 1
                    ? 'bg-[#f1f5f9] shadow-[2px_2px_0_var(--ink)]'
                    : idx === 2
                      ? 'bg-[#fcf0ea] shadow-[1px_1px_0_var(--ink)]'
                      : 'bg-white hover:shadow-[2px_2px_0_var(--ink)] hover:-translate-y-0.5'
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ink)] text-xs font-mono font-bold text-[var(--paper)] border-2 border-[var(--ink)]">
                {idx + 1}
              </span>
              <Image
                src={entry.avatarUrl || '/badges/default-avatar.png'}
                alt={`${entry.username}'s avatar`}
                width={36}
                height={36}
                className="rounded-full border-2 border-[#16211a]"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bricolage font-extrabold text-[var(--ink)] truncate">
                  {entry.username}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-extrabold text-[var(--ink)]">
                  {activeTab === 'mostBadges' && `${entry.badgeCount} Badges`}
                  {activeTab === 'fastestGrowth' && `+${entry.badgesLast30Days} Last 30d`}
                  {activeTab === 'mostContributions' && `${entry.totalContributions} Contribs`}
                  {activeTab === 'mostPRs' && `${entry.totalPRs} PRs`}
                </p>
                <p className={`text-[10px] font-mono font-bold ${
                  entry.trend === 'up'
                    ? 'text-[#1f6f4a]'
                    : entry.trend === 'down'
                      ? 'text-red-600'
                      : 'text-[#0f5c78]'
                }`}>
                  {entry.trend === 'up' && '▲ GROWING'}
                  {entry.trend === 'down' && '▼ SLOWING'}
                  {entry.trend === 'new' && '★ NEW ENTRY'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
