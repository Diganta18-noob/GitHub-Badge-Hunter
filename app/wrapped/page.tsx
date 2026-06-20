'use client';

import { useEffect, useState } from 'react';
import { useProfileStore } from '@/lib/store/profile-store';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { motion } from 'framer-motion';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function WrappedPage() {
  const profile = useProfileStore((s) => s.profile);
  const evaluations = useProfileStore((s) => s.evaluations);
  const prefersReduced = useReducedMotion();

  const [activeReplayMonth, setActiveReplayMonth] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (activeReplayMonth === null || !isPlaying) return;

    if (prefersReduced) {
      // Skip transition, show December state immediately
      setActiveReplayMonth(11);
      setIsPlaying(false);
      return;
    }

    const interval = setTimeout(() => {
      if (activeReplayMonth < 11) {
        setActiveReplayMonth((prev) => (prev !== null ? prev + 1 : 0));
      } else {
        setIsPlaying(false);
      }
    }, 400); // 400ms delay per month reveal

    return () => clearTimeout(interval);
  }, [activeReplayMonth, isPlaying, prefersReduced]);

  if (!profile) {
    return (
      <div className="w-full bg-[var(--paper)] text-[var(--ink)] min-h-screen py-16">
        <div className="mx-auto max-w-xl px-4 text-center">
          <div className="news-card p-8 bg-white shadow-[0_4px_0_#16211a]">
            <span className="text-5xl">🎁</span>
            <h1 className="mt-4 text-2xl font-bricolage font-extrabold text-[#16211a]">GitHub Wrapped</h1>
            <p className="mt-2 text-sm text-[#4f6156]">
              Analyze a profile first to see your GitHub Wrapped summary.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  // Property 22: Filter events to the current calendar year only
  const currentYearEvents = profile.recentEvents.filter(
    (e) => {
      try {
        return new Date(e.created_at).getFullYear() === currentYear;
      } catch {
        return false;
      }
    }
  );

  // Group events by month
  const monthCounts = new Array(12).fill(0);
  currentYearEvents.forEach((e) => {
    try {
      const month = new Date(e.created_at).getMonth();
      monthCounts[month]++;
    } catch {
      // Ignore invalid event dates
    }
  });

  const totalContributionsThisYear = currentYearEvents.length;
  const maxMonthVal = Math.max(...monthCounts);
  const maxMonthIndex = monthCounts.indexOf(maxMonthVal);
  const mostActiveMonth = totalContributionsThisYear > 0 ? MONTHS[maxMonthIndex] : 'N/A';

  const badgesThisYear = evaluations.filter(
    (e) => e.earnedAt && e.earnedAt.getFullYear() === currentYear
  ).length;

  const topLang = profile.languages[0];

  // Replay animation control
  const startReplay = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setActiveReplayMonth(0);
  };

  return (
    <div className="w-full bg-[var(--paper)] text-[var(--ink)] min-h-screen py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h1 className="mb-8 text-center text-3xl font-bricolage font-extrabold text-[#16211a]">
          🎁 {currentYear} GitHub Wrapped
        </h1>

        <div className="space-y-6">
          {/* Banner card */}
          <div className="news-card p-6 bg-gradient-to-br from-[#f3eadc]/30 to-white shadow-[0_4px_0_#16211a]">
            <p className="text-sm text-[#4f6156]">Your Year in Review · @{profile.username}</p>
            <h2 className="mt-2 text-4xl font-bricolage font-extrabold text-[#16211a]">
              {totalContributionsThisYear.toLocaleString()}
            </h2>
            <p className="text-sm text-[#4f6156]">Public Activity Events in {currentYear}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="news-card p-4 flex flex-col justify-between">
              <p className="text-xs text-[#4f6156] font-bold">Most Active Month</p>
              <p className="text-2xl font-extrabold text-[#8a4b12] mt-2">{mostActiveMonth}</p>
              <p className="text-[10px] text-[#4f6156] mt-1">
                {maxMonthVal > 0 ? `${maxMonthVal} contributions` : 'No events'}
              </p>
            </div>
            <div className="news-card p-4 flex flex-col justify-between">
              <p className="text-xs text-[#4f6156] font-bold">Top Language</p>
              <p className="text-2xl font-extrabold text-[#6d4cc2] mt-2">{topLang?.name ?? 'N/A'}</p>
              <p className="text-[10px] text-[#4f6156] mt-1">
                {topLang?.percentage ? `${topLang.percentage.toFixed(1)}% of code` : ''}
              </p>
            </div>
            <div className="news-card p-4 flex flex-col justify-between">
              <p className="text-xs text-[#4f6156] font-bold">Badges Earned</p>
              <p className="text-2xl font-extrabold text-[#1f6f4a] mt-2">{badgesThisYear}</p>
              <p className="text-[10px] text-[#4f6156] mt-1">Achievements unlocked this year</p>
            </div>
            <div className="news-card p-4 flex flex-col justify-between">
              <p className="text-xs text-[#4f6156] font-bold">Stars Received</p>
              <p className="text-2xl font-extrabold text-[#0f5c78] mt-2">{profile.starsReceived}</p>
              <p className="text-[10px] text-[#4f6156] mt-1">Across all public repositories</p>
            </div>
          </div>

          {/* Heatmap Playback Widget */}
          <div className="news-card p-6 space-y-4 shadow-[0_4px_0_#16211a]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#16211a]">📅 Activity Replay Heatmap</h3>
                <p className="text-xs text-[#4f6156]">Play back your monthly contribution levels</p>
              </div>
              <button
                onClick={startReplay}
                disabled={isPlaying}
                className="rounded-lg border-2 border-[#16211a] bg-[#1f6f4a] px-4 py-1.5 text-xs font-bold text-white shadow-[0_2px_0_#16211a] hover:bg-[#155d3d] transition-all disabled:opacity-50"
              >
                {isPlaying ? 'Playing...' : 'Play Replay'}
              </button>
            </div>

            {/* 12 Months Heatmap Grid */}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {MONTHS.map((name, index) => {
                const count = monthCounts[index];
                const intensity = maxMonthVal > 0 ? count / maxMonthVal : 0;
                const isHighlighted = activeReplayMonth === index;

                return (
                  <motion.div
                    key={name}
                    className={`rounded-xl border p-3 flex flex-col items-center justify-center transition-all ${
                      isHighlighted
                        ? 'border-[#1f6f4a] bg-[#eef4ec] shadow-lg scale-105'
                        : 'border-[#cbd8cf] bg-white'
                    }`}
                    animate={isHighlighted && !prefersReduced ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-[10px] font-bold text-[#4f6156]">{name.substring(0, 3)}</span>
                    <div
                      className="h-6 w-6 rounded-md mt-2 transition-all duration-300 border border-[#16211a]"
                      style={{
                        backgroundColor: count > 0
                          ? `rgba(31, 111, 74, ${Math.max(0.15, intensity)})` // Green scale based on intensity
                          : 'rgba(22, 33, 26, 0.05)'
                      }}
                    />
                    <span className="font-mono text-xs font-bold text-[#16211a] mt-1">{count}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
