'use client';

import { BadgeCard } from '@/components/primitives/BadgeCard';
import type { BadgeEvaluation } from '@/types';

interface BadgeGridProps {
  evaluations: BadgeEvaluation[];
  rpgMode: boolean;
}

export function BadgeGrid({ evaluations, rpgMode }: BadgeGridProps) {
  const unlocked = evaluations.filter((e) => e.status === 'Unlocked');
  const locked = evaluations.filter((e) => e.status !== 'Unlocked');

  return (
    <section>
      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <span className="text-xl">🏆</span>
            Unlocked Badges ({unlocked.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {unlocked.map((evaluation) => (
              <BadgeCard
                key={evaluation.definition.id}
                evaluation={evaluation}
                rpgMode={rpgMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* Locked / In Progress */}
      {locked.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <span className="text-xl">🔒</span>
            {rpgMode ? 'Quests Available' : 'Locked Badges'} ({locked.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {locked.map((evaluation) => (
              <BadgeCard
                key={evaluation.definition.id}
                evaluation={evaluation}
                rpgMode={rpgMode}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
