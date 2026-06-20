'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { fadeSlideLeft } from '@/lib/utils/animation-variants';
import { TimelineEntry } from '@/components/primitives/TimelineEntry';
import type { BadgeEvaluation } from '@/types';

interface TimelineViewProps {
  evaluations: BadgeEvaluation[];
}

export function TimelineView({ evaluations }: TimelineViewProps) {
  const prefersReduced = useReducedMotion();

  // Group earned badges by year
  const earned = evaluations.filter((e) => e.status === 'Unlocked' && e.earnedAt);
  const yearGroups = new Map<number, BadgeEvaluation[]>();

  earned.forEach((e) => {
    const year = e.earnedAt!.getFullYear();
    if (!yearGroups.has(year)) yearGroups.set(year, []);
    yearGroups.get(year)!.push(e);
  });

  const sortedYears = Array.from(yearGroups.keys()).sort((a, b) => b - a);

  // Upcoming badges (top 3 locked by progress)
  const upcoming = evaluations
    .filter((e) => e.status !== 'Unlocked')
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  // If no earned badges have dates, show all unlocked
  const unlockedWithoutDates = evaluations.filter(
    (e) => e.status === 'Unlocked' && !e.earnedAt,
  );

  return (
    <section className="news-card p-6">
      <h2 className="mb-6 flex items-center gap-2 text-lg font-bricolage font-extrabold text-[var(--ink)]">
        <span className="text-xl">📅</span>
        Badge Timeline
      </h2>

      {/* Year groups */}
      {sortedYears.map((year) => (
        <motion.div
          key={year}
          className="mb-6"
          variants={prefersReduced ? undefined : fadeSlideLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h3 className="mb-3 text-xs font-mono font-bold text-[#8a4b12] uppercase tracking-wider">{year}</h3>
          <div className="space-y-2">
            {yearGroups.get(year)!.map((e) => (
              <TimelineEntry key={e.definition.id} evaluation={e} />
            ))}
          </div>
        </motion.div>
      ))}

      {/* Unlocked without dates */}
      {unlockedWithoutDates.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-mono font-bold text-[#1f6f4a] uppercase tracking-wider">Unlocked</h3>
          <div className="space-y-2">
            {unlockedWithoutDates.map((e) => (
              <TimelineEntry key={e.definition.id} evaluation={e} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-mono font-bold text-[var(--soft)] uppercase tracking-wider">
            Upcoming Badges
          </h3>
          <div className="space-y-2">
            {upcoming.map((e) => (
              <TimelineEntry
                key={e.definition.id}
                evaluation={e}
                isUpcoming
              />
            ))}
          </div>
        </div>
      )}

      {sortedYears.length === 0 && unlockedWithoutDates.length === 0 && (
        <p className="text-sm text-[var(--soft)]">
          No badge history available yet. Start contributing to unlock badges!
        </p>
      )}
    </section>
  );
}
