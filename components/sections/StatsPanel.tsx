'use client';

import { StatCounter } from '@/components/primitives/StatCounter';
import type { BadgeEvaluation, ScoreResult, RoadmapResult } from '@/types';

interface StatsPanelProps {
  evaluations: BadgeEvaluation[];
  scores: ScoreResult;
  roadmap: RoadmapResult;
}

export function StatsPanel({ evaluations, scores, roadmap }: StatsPanelProps) {
  const total = evaluations.length;
  const unlocked = evaluations.filter((e) => e.status === 'Unlocked').length;
  const locked = total - unlocked;
  const rare = evaluations.filter(
    (e) => e.status === 'Unlocked' && ['Rare', 'Epic', 'Legendary', 'Secret'].includes(e.definition.rarity),
  ).length;
  const secret = evaluations.filter(
    (e) => e.status === 'Unlocked' && e.definition.rarity === 'Secret',
  ).length;
  const progressPercentage = total > 0 ? Math.round((unlocked / total) * 1000) / 10 : 0;

  return (
    <section className="news-card p-6">
      <h2 className="mb-6 flex items-center gap-2 text-lg font-bricolage font-extrabold text-[var(--ink)]">
        <span className="text-xl">📊</span>
        Statistics
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
        <StatCounter value={total} label="Total Badges" />
        <StatCounter value={unlocked} label="Unlocked" />
        <StatCounter value={locked} label="Locked" />
        <StatCounter value={rare} label="Rare Badges" />
        <StatCounter value={secret} label="Secret Badges" />
        <StatCounter
          value={progressPercentage}
          label="Progress"
          format={(n) => `${n}%`}
        />
        <StatCounter value={scores.githubScore} label="GitHub Score" />
        <StatCounter value={scores.openSourceScore} label="OSS Score" />
        <StatCounter
          value={roadmap.totalEstimatedDays}
          label="Est. Days Left"
        />
      </div>
    </section>
  );
}
