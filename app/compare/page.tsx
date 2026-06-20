'use client';

import { useState } from 'react';
import { useAnalyze } from '@/lib/hooks/useAnalyze';
import { parseInput } from '@/lib/utils/input-parser';
import dynamic from 'next/dynamic';
import { SkeletonCard } from '@/components/primitives/SkeletonCard';
import { useUIStore } from '@/lib/store/ui-store';

const CompareView = dynamic(() => import('@/components/sections/CompareView'), {
  loading: () => <SkeletonCard variant="profile" />,
  ssr: false,
});

export default function ComparePage() {
  const [usernameA, setUsernameA] = useState('');
  const [usernameB, setUsernameB] = useState('');
  const [activeA, setActiveA] = useState<string | null>(null);
  const [activeB, setActiveB] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const setCompareUsernameB = useUIStore((s) => s.setCompareUsernameB);

  const queryA = useAnalyze(activeA);
  const queryB = useAnalyze(activeB);

  const handleCompare = () => {
    const resultA = parseInput(usernameA);
    const resultB = parseInput(usernameB);

    if (resultA.error || resultB.error) {
      setErrorMsg('Please enter two valid GitHub usernames.');
      return;
    }

    setErrorMsg(null);
    setActiveA(resultA.username);
    setActiveB(resultB.username);
    if (resultB.username) {
      setCompareUsernameB(resultB.username);
    }
  };

  return (
    <div className="w-full bg-[var(--paper)] text-[var(--ink)] min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-center text-3xl font-bricolage font-extrabold text-[#16211a]">
          ⚔️ Compare Profiles
        </h1>

        {/* Input row */}
        <div className="mx-auto mb-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={usernameA}
            onChange={(e) => setUsernameA(e.target.value)}
            placeholder="First username..."
            className="flex-1 rounded-[6px] border-2 border-[#16211a] bg-white px-4 py-3 text-sm text-[#16211a] placeholder-[#4f6156] focus:outline-none focus:ring-4 focus:ring-[#1f6f4a]/20 focus:border-[#1f6f4a]"
          />
          <span className="self-center text-xl text-[#4f6156] font-bold">vs</span>
          <input
            type="text"
            value={usernameB}
            onChange={(e) => setUsernameB(e.target.value)}
            placeholder="Second username..."
            className="flex-1 rounded-[6px] border-2 border-[#16211a] bg-white px-4 py-3 text-sm text-[#16211a] placeholder-[#4f6156] focus:outline-none focus:ring-4 focus:ring-[#1f6f4a]/20 focus:border-[#1f6f4a]"
          />
          <button
            onClick={handleCompare}
            className="min-h-[44px] rounded-[6px] border-2 border-[#16211a] bg-[#1f6f4a] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_#16211a] hover:bg-[#155d3d] hover:translate-y-[1px] active:translate-y-[3px] active:shadow-[0_1px_0_#16211a] transition-all"
          >
            Compare
          </button>
        </div>

        {errorMsg && (
          <p className="mb-4 text-center text-sm text-red-600 font-bold">{errorMsg}</p>
        )}

        {/* Compare grid */}
        {(activeA || activeB) && (
          <div className="space-y-6">
            {queryA.isLoading || queryB.isLoading ? (
              <div className="grid gap-8 md:grid-cols-2">
                <SkeletonCard variant="profile" />
                <SkeletonCard variant="profile" />
              </div>
            ) : queryA.data && queryB.data ? (
              <CompareView
                profileA={queryA.data.profile}
                profileB={queryB.data.profile}
                evaluationsA={queryA.data.evaluations}
                evaluationsB={queryB.data.evaluations}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
