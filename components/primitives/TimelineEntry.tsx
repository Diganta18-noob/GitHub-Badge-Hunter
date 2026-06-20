import { formatDate } from '@/lib/utils/formatters';
import { BADGE_EMOJIS } from '@/lib/data/badge-definitions';
import type { BadgeEvaluation } from '@/types';

interface TimelineEntryProps {
  evaluation: BadgeEvaluation;
  isUpcoming?: boolean;
}

export function TimelineEntry({ evaluation, isUpcoming = false }: TimelineEntryProps) {
  const { definition, currentTier, earnedAt } = evaluation;

  return (
    <div className={`flex items-center gap-3 rounded-[6px] border-2 p-3 transition-colors ${
      isUpcoming
        ? 'bg-[#fef8e7] border-[#b45309]/30'
        : 'bg-[var(--cream)] border-[#16211a]'
    }`}>
      {/* Icon */}
      <div className={`flex h-10 w-10 items-center justify-center rounded-[6px] border-2 border-[#16211a] text-lg ${
        isUpcoming ? 'bg-[#f5e6c4]' : 'bg-white'
      }`}>
        {isUpcoming ? '🔮' : (BADGE_EMOJIS[definition.id] || '🏆')}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bricolage font-extrabold text-[var(--ink)] truncate">
          {definition.name}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          {currentTier !== 'None' && (
            <span className="text-xs font-mono font-bold text-[var(--soft)] bg-white px-1.5 py-0.5 rounded border border-[#16211a]">
              {currentTier}
            </span>
          )}
          <span className="text-xs text-[var(--soft)]">
            {isUpcoming
              ? 'Estimated unlock'
              : earnedAt
                ? formatDate(earnedAt)
                : 'Date not available'}
          </span>
        </div>
      </div>
    </div>
  );
}
