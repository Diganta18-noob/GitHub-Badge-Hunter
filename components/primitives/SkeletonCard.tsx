interface SkeletonCardProps {
  variant: 'badge' | 'profile' | 'stat' | 'roadmap';
}

export function SkeletonCard({ variant }: SkeletonCardProps) {
  const heights: Record<string, string> = {
    badge: 'h-48',
    profile: 'h-64',
    stat: 'h-24',
    roadmap: 'h-56',
  };

  return (
    <div className={`${heights[variant]} animate-pulse rounded-[6px] border-2 border-[var(--line)] bg-[var(--cream)] p-4`}>
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded bg-[var(--line)]" />
        <div className="h-3 w-1/2 rounded bg-[var(--line)]" />
        {variant !== 'stat' && (
          <>
            <div className="h-3 w-5/6 rounded bg-[var(--line)]" />
            <div className="h-3 w-2/3 rounded bg-[var(--line)]" />
          </>
        )}
        {(variant === 'badge' || variant === 'roadmap') && (
          <>
            <div className="mt-4 h-2 w-full rounded bg-[var(--line)]" />
            <div className="h-3 w-1/4 rounded bg-[var(--line)]" />
          </>
        )}
        {variant === 'profile' && (
          <div className="mt-4 flex gap-3">
            <div className="h-16 w-16 rounded-full bg-[var(--line)]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 rounded bg-[var(--line)]" />
              <div className="h-3 w-3/4 rounded bg-[var(--line)]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
