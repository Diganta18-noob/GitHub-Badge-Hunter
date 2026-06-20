'use client';

import dynamic from 'next/dynamic';
import { SkeletonCard } from '@/components/primitives/SkeletonCard';

const Leaderboard = dynamic(() => import('@/components/sections/Leaderboard'), {
  loading: () => <SkeletonCard variant="profile" />,
  ssr: false,
});

export default function LeaderboardPage() {
  return (
    <div className="w-full bg-[var(--paper)] text-[var(--ink)] min-h-screen py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-center text-3xl font-bricolage font-extrabold text-[#16211a]">
          🏅 Leaderboard
        </h1>

        <Leaderboard />
      </div>
    </div>
  );
}
