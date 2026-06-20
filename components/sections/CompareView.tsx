'use client';

import Image from 'next/image';
import { formatNumber } from '@/lib/utils/formatters';
import type { GitHubProfile, BadgeEvaluation } from '@/types';

interface CompareViewProps {
  profileA: GitHubProfile;
  profileB: GitHubProfile;
  evaluationsA: BadgeEvaluation[];
  evaluationsB: BadgeEvaluation[];
}

export default function CompareView({
  profileA,
  profileB,
  evaluationsA,
  evaluationsB,
}: CompareViewProps) {
  // Metrics computation helper
  const getBadgeCount = (evals: BadgeEvaluation[]) =>
    evals.filter((e) => e.status === 'Unlocked').length;

  const getContributions = (p: GitHubProfile) =>
    p.totalCommits + p.totalPRs + p.totalIssues + p.totalDiscussions;

  const getActivityFrequency = (p: GitHubProfile) => {
    // events per day based on 90 days window
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - 90);
    const windowEvents = p.recentEvents.filter(
      (e) => new Date(e.created_at) >= windowStart
    );
    return windowEvents.length / 90;
  };

  const metrics = [
    {
      label: 'Unlocked Badges',
      valA: getBadgeCount(evaluationsA),
      valB: getBadgeCount(evaluationsB),
      format: (n: number) => String(n),
    },
    {
      label: 'Total Stars Received',
      valA: profileA.starsReceived,
      valB: profileB.starsReceived,
      format: formatNumber,
    },
    {
      label: 'Public Repositories',
      valA: profileA.publicRepos,
      valB: profileB.publicRepos,
      format: formatNumber,
    },
    {
      label: 'Followers',
      valA: profileA.followers,
      valB: profileB.followers,
      format: formatNumber,
    },
    {
      label: 'Total Pull Requests',
      valA: profileA.totalPRs,
      valB: profileB.totalPRs,
      format: formatNumber,
    },
    {
      label: 'Total Commits',
      valA: profileA.totalCommits,
      valB: profileB.totalCommits,
      format: formatNumber,
    },
    {
      label: 'Contributions (Last Year)',
      valA: getContributions(profileA),
      valB: getContributions(profileB),
      format: formatNumber,
    },
    {
      label: 'Recent Activity Frequency',
      valA: getActivityFrequency(profileA),
      valB: getActivityFrequency(profileB),
      format: (n: number) => `${n.toFixed(2)} events/day`,
    },
  ];

  // Compare Languages
  const getTop5LanguagesStr = (p: GitHubProfile) =>
    p.languages
      .slice(0, 5)
      .map((l) => `${l.name} (${l.percentage?.toFixed(1)}%)`)
      .join(', ') || 'None';

  // Badge list for comparison matrix
  const badgeMapA = new Map(evaluationsA.map((e) => [e.definition.id, e]));
  const badgeMapB = new Map(evaluationsB.map((e) => [e.definition.id, e]));

  // Get unique list of all badge definitions
  const allBadges = Array.from(
    new Map(
      [...evaluationsA, ...evaluationsB].map((e) => [e.definition.id, e.definition])
    ).values()
  );

  const getStatusLabel = (evalItem?: BadgeEvaluation) => {
    if (!evalItem) return 'Locked';
    return evalItem.status;
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'Unlocked':
        return 'text-[#1f6f4a] bg-[#eef4ec] border border-[#1f6f4a]/20';
      case 'InProgress':
        return 'text-[#b45309] bg-[#fef8e7] border border-[#b45309]/20';
      default:
        return 'text-[var(--soft)] bg-[var(--cream)] border border-[var(--line)]';
    }
  };

  const renderValueCell = (val: number, otherVal: number, formatted: string) => {
    const isHigher = val > otherVal;
    return (
      <td
        className={`px-6 py-4 text-center font-mono text-sm transition-all duration-300 ${
          isHigher ? 'font-extrabold' : ''
        }`}
        style={isHigher ? { color: '#1f6f4a' } : { color: '#4f6156' }}
      >
        {formatted}
        {isHigher && <span className="ml-1 text-xs">👑</span>}
      </td>
    );
  };

  return (
    <div className="w-full space-y-12">
      {/* Visual head-to-head card */}
      <div className="overflow-hidden rounded-[6px] border-2 border-[#16211a] bg-white">
        <div className="flex flex-col divide-y divide-[#16211a] sm:flex-row sm:divide-x sm:divide-y-0">
          {/* User A Card */}
          <div className="flex flex-1 items-center gap-4 p-6 bg-[#fcfaf2]">
            <Image
              src={profileA.avatarUrl}
              alt={profileA.name}
              width={64}
              height={64}
              className="rounded-full border-2 border-[#16211a]"
            />
            <div className="min-w-0">
              <h3 className="text-lg font-bricolage font-extrabold text-[var(--ink)] truncate">{profileA.name}</h3>
              <p className="text-sm font-mono font-bold text-[#1f6f4a]">@{profileA.username}</p>
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center bg-[#16211a] px-5 py-2 text-sm font-mono font-bold text-[#f7f9f6] sm:py-0">
            VS
          </div>

          {/* User B Card */}
          <div className="flex flex-1 items-center gap-4 p-6 bg-[#f2f8fc] justify-end text-right">
            <div className="min-w-0 order-2 sm:order-1">
              <h3 className="text-lg font-bricolage font-extrabold text-[var(--ink)] truncate">{profileB.name}</h3>
              <p className="text-sm font-mono font-bold text-[#0f5c78]">@{profileB.username}</p>
            </div>
            <Image
              src={profileB.avatarUrl}
              alt={profileB.name}
              width={64}
              height={64}
              className="rounded-full border-2 border-[#16211a] order-1 sm:order-2"
            />
          </div>
        </div>
      </div>

      {/* Metrics Table */}
      <div className="overflow-x-auto rounded-[6px] border-2 border-[#16211a] bg-white">
        <table className="w-full table-auto border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-[#16211a] bg-[#eef4ec]">
              <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink)]">Metric</th>
              <th className="px-6 py-4 text-center text-xs font-mono font-bold uppercase tracking-wider text-[#1f6f4a]">
                {profileA.username}
              </th>
              <th className="px-6 py-4 text-center text-xs font-mono font-bold uppercase tracking-wider text-[#0f5c78]">
                {profileB.username}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#16211a]/10">
            {metrics.map((row) => (
              <tr key={row.label} className="hover:bg-[#16211a]/5 transition-colors duration-150">
                <td className="px-6 py-4 text-sm font-bold text-[var(--ink)]">{row.label}</td>
                {renderValueCell(row.valA, row.valB, row.format(row.valA))}
                {renderValueCell(row.valB, row.valA, row.format(row.valB))}
              </tr>
            ))}
            {/* Top 5 Languages Row */}
            <tr className="hover:bg-[#16211a]/5 transition-colors duration-150">
              <td className="px-6 py-4 text-sm font-bold text-[var(--ink)]">Top 5 Languages</td>
              <td className="px-6 py-4 text-center text-xs text-[var(--soft)] font-mono max-w-xs truncate">
                {getTop5LanguagesStr(profileA)}
              </td>
              <td className="px-6 py-4 text-center text-xs text-[var(--soft)] font-mono max-w-xs truncate">
                {getTop5LanguagesStr(profileB)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Badge-by-Badge Matrix */}
      <div>
        <h3 className="mb-4 text-lg font-bricolage font-extrabold text-[var(--ink)] flex items-center gap-2">
          <span>🏆</span> Badge Comparison Matrix
        </h3>
        <div className="overflow-x-auto rounded-[6px] border-2 border-[#16211a] bg-white">
          <table className="w-full table-auto border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-[#16211a] bg-[#eef4ec]">
                <th className="px-6 py-4 text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink)]">Badge</th>
                <th className="px-6 py-4 text-center text-xs font-mono font-bold uppercase tracking-wider text-[#1f6f4a]">
                  {profileA.username}
                </th>
                <th className="px-6 py-4 text-center text-xs font-mono font-bold uppercase tracking-wider text-[#0f5c78]">
                  {profileB.username}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16211a]/10">
              {allBadges.map((badge) => {
                const evalA = badgeMapA.get(badge.id);
                const evalB = badgeMapB.get(badge.id);

                const statusA = getStatusLabel(evalA);
                const statusB = getStatusLabel(evalB);

                return (
                  <tr key={badge.id} className="hover:bg-[#16211a]/5 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🏆</span>
                        <div>
                          <p className="text-sm font-bricolage font-extrabold text-[var(--ink)]">{badge.name}</p>
                          <p className="text-[10px] font-mono font-bold uppercase text-[var(--soft)]">{badge.rarity}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-mono font-bold ${getStatusColorClass(
                          statusA
                        )}`}
                      >
                        {statusA.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-mono font-bold ${getStatusColorClass(
                          statusB
                        )}`}
                      >
                        {statusB.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
