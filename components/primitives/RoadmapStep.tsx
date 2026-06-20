import type { RoadmapStep as RoadmapStepType } from '@/types';

interface RoadmapStepProps {
  step: RoadmapStepType;
  index: number;
  isLast?: boolean;
}

export function RoadmapStep({ step, index, isLast = false }: RoadmapStepProps) {
  const difficultyColors: Record<string, string> = {
    Easy: 'text-[#1f6f4a] bg-[#eef4ec] border border-[#1f6f4a]/20',
    Medium: 'text-[#8a4b12] bg-[#fdf6e2] border border-[#8a4b12]/20',
    Hard: 'text-[#b45309] bg-[#fef2f2] border border-[#b45309]/20',
  };

  return (
    <div className="relative flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold border-2 border-[#16211a] ${
            step.completed
              ? 'bg-[#1f6f4a] text-white'
              : 'bg-[var(--cream)] text-[var(--ink)]'
          }`}
        >
          {step.completed ? '✓' : index + 1}
        </div>
        {!isLast && (
          <div className="h-full w-0.5 bg-[#16211a]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <p className={`text-sm font-bold ${
          step.completed ? 'text-[#4f6156]/60 line-through' : 'text-[var(--ink)]'
        }`}>
          {step.action}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
            difficultyColors[step.difficulty] ?? 'text-[var(--soft)] bg-[var(--cream)] border border-[var(--line)]'
          }`}>
            {step.difficulty.toUpperCase()}
          </span>
          <span className="text-xs text-[var(--soft)]">
            ~{step.estimatedDays} day{step.estimatedDays !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
