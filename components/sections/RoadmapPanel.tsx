'use client';

import { ProgressBar } from '@/components/primitives/ProgressBar';
import { RoadmapStep } from '@/components/primitives/RoadmapStep';
import { formatDate } from '@/lib/utils/formatters';
import { BADGE_EMOJIS } from '@/lib/data/badge-definitions';
import type { RoadmapResult } from '@/types';

interface RoadmapPanelProps {
  roadmap: RoadmapResult;
  rpgMode: boolean;
}

export function RoadmapPanel({ roadmap, rpgMode }: RoadmapPanelProps) {
  const { nextBadge, steps, totalEstimatedDays, estimatedCompletionDate, activityRate } = roadmap;

  return (
    <section className="news-card p-6 shadow-[0_4px_0_#16211a]">
      <h2 className="mb-6 flex items-center gap-2 text-lg font-bricolage font-extrabold text-[#16211a]">
        <span className="text-xl">{rpgMode ? '🗺️' : '🎯'}</span>
        {rpgMode ? 'Quest Log' : 'Badge Roadmap'}
      </h2>

      {/* Next Badge card */}
      {nextBadge && (
        <div className="mb-6 rounded-[6px] border-2 border-[#16211a] bg-[#fdfaf2] p-4 shadow-[2px_2px_0_#16211a]">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#16211a] bg-[#f3eadc] text-2xl">
              {BADGE_EMOJIS[nextBadge.definition.id] || '🎯'}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bricolage font-extrabold text-[#16211a]">
                {rpgMode ? 'Next Quest' : 'Next Badge'}: {nextBadge.definition.name}
              </h3>
              <p className="mt-0.5 text-xs text-[#4f6156] font-bold">
                {nextBadge.currentValue} / {nextBadge.threshold} · {nextBadge.definition.difficulty} difficulty
              </p>
            </div>
          </div>

          <div className="mt-3">
            <ProgressBar value={nextBadge.progress} color="#8a4b12" />
            <p className="mt-1 text-right text-xs font-mono font-bold text-[#4f6156]">
              {Math.round(nextBadge.progress)}% complete
            </p>
          </div>

          {/* Requirements checklist */}
          {nextBadge.checklistItems.length > 0 && (
            <div className="mt-3 space-y-1">
              {nextBadge.checklistItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-xs font-bold">
                  <span className={item.met ? 'text-[#1f6f4a]' : 'text-[#4f6156]'}>
                    {item.met ? '✓' : '○'}
                  </span>
                  <span className={item.met ? 'text-[#16211a]' : 'text-[#4f6156]'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Steps */}
      {steps.length > 0 ? (
        <div className="space-y-0">
          {steps.map((step, idx) => (
            <RoadmapStep
              key={step.id}
              step={step}
              index={idx}
              isLast={idx === steps.length - 1}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#4f6156] font-bold">
          🎉 All badges unlocked! No roadmap needed.
        </p>
      )}

      {/* Footer summary */}
      {steps.length > 0 && (
        <div className="mt-4 rounded-[6px] border border-[#16211a] bg-[#eef4ec] px-4 py-3 text-xs font-mono font-bold text-[#16211a]">
          {activityRate !== null ? (
            <p>
              Estimated total: ~{totalEstimatedDays} days · Target completion:{' '}
              {formatDate(estimatedCompletionDate)}
            </p>
          ) : (
            <p>Estimated time: depends on your activity</p>
          )}
        </div>
      )}
    </section>
  );
}
