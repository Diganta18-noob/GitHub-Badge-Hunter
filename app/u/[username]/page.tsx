'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAnalyze } from '@/lib/hooks/useAnalyze';
import { useUIStore } from '@/lib/store/ui-store';
import { useBadgeStore } from '@/lib/store/badge-store';
import { useLeaderboardStore } from '@/lib/store/leaderboard-store';
import { ProfileSection } from '@/components/sections/ProfileSection';
import { BadgeGrid } from '@/components/sections/BadgeGrid';
import { RoadmapPanel } from '@/components/sections/RoadmapPanel';
import { TimelineView } from '@/components/sections/TimelineView';
import { StatsPanel } from '@/components/sections/StatsPanel';
import { SkeletonCard } from '@/components/primitives/SkeletonCard';
import { computeStreaks } from '@/lib/engines/streak-engine';
import { predictBadges } from '@/lib/engines/badge-predictor';
import { computeRepoHealthScore } from '@/lib/engines/repo-health';
import { fetchRecommendations, type RecommendedRepo } from '@/lib/api/github-rest';
import type { BadgeEvaluation } from '@/types';

const ShareModal = dynamic(() => import('@/components/sections/ShareModal'), {
  ssr: false,
});

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  
  const rpgMode = useUIStore((s) => s.rpgModeEnabled);
  const shareModalOpen = useUIStore((s) => s.shareModalOpen);
  const setShareModalOpen = useUIStore((s) => s.setShareModalOpen);

  const { favourites, bookmarks, addFavourite, removeFavourite, addBookmark, removeBookmark } = useBadgeStore();
  const addLeaderboardEntry = useLeaderboardStore((s) => s.addEntry);

  const { data, isLoading, error } = useAnalyze(username);

  const [recommendations, setRecommendations] = useState<RecommendedRepo[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [prevUnlockedCount, setPrevUnlockedCount] = useState<number | null>(null);

  // Check notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Fetch recommendations once languages load
  useEffect(() => {
    if (data && data.profile.languages.length > 0) {
      fetchRecommendations(data.profile.languages.map((l) => l.name))
        .then(setRecommendations)
        .catch(err => console.error('Failed to load recommendations:', err));
    }
  }, [data]);

  // Populate leaderboard whenever data is available
  useEffect(() => {
    if (data) {
      const { profile, evaluations } = data;
      const unlockedCount = evaluations.filter((e) => e.status === 'Unlocked').length;
      const recentWindow = new Date();
      recentWindow.setDate(recentWindow.getDate() - 30);
      const recentEvents = profile.recentEvents.filter(
        (e) => new Date(e.created_at) >= recentWindow,
      );
      addLeaderboardEntry({
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        badgeCount: unlockedCount,
        badgesLast30Days: recentEvents.length > 0 ? Math.min(unlockedCount, 3) : 0,
        totalContributions: profile.totalCommits + profile.totalPRs + profile.totalIssues,
        totalPRs: profile.totalPRs,
        trend: recentEvents.length > 10 ? 'up' : recentEvents.length > 0 ? 'new' : 'down',
      });
    }
  }, [data, addLeaderboardEntry]);

  // Monitor newly unlocked badges to fire notification
  useEffect(() => {
    if (data) {
      const unlockedCount = data.evaluations.filter((e) => e.status === 'Unlocked').length;
      if (prevUnlockedCount !== null && unlockedCount > prevUnlockedCount) {
        if (Notification.permission === 'granted') {
          new Notification('🏆 Achievement Unlocked!', {
            body: `You unlocked new badges on GitHub Badge Tracker for @${username}!`,
          });
        }
      }
      setPrevUnlockedCount(unlockedCount);
    }
  }, [data, username, prevUnlockedCount]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <SkeletonCard variant="profile" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} variant="badge" />
          ))}
        </div>
        <SkeletonCard variant="roadmap" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div
          className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8"
          role="alert"
          aria-live="polite"
        >
          <span className="text-4xl">😔</span>
          <h2 className="mt-4 text-xl font-bold text-white">Analysis Failed</h2>
          <p className="mt-2 text-sm text-slate-400">
            {error instanceof Error ? error.message : 'An unknown error occurred while analyzing this profile.'}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { profile, evaluations, scores, roadmap } = data;

  const isFavorited = favourites.includes(profile.username);
  const isBookmarked = !!bookmarks[profile.username];

  const handleFavoriteToggle = () => {
    if (isFavorited) {
      removeFavourite(profile.username);
    } else {
      addFavourite(profile.username);
    }
  };

  const handleBookmarkToggle = () => {
    if (isBookmarked) {
      removeBookmark(profile.username);
    } else {
      addBookmark(profile.username, profile);
    }
  };

  const requestNotifications = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
  };

  // Streaks
  const streaks = computeStreaks(profile.recentEvents);

  // Predictions
  const predictions = predictBadges(evaluations, roadmap.activityRate);

  // Weekly Challenge
  const getWeeklyChallenge = (evals: BadgeEvaluation[]) => {
    const locked = evals
      .filter((e) => e.status !== 'Unlocked')
      .sort((a, b) => b.progress - a.progress);
    if (locked.length === 0) return null;
    const target = locked[0];
    const remaining = target.threshold - target.currentValue;
    const metric = target.definition.metricKey.replace(/total|s$/gi, '').toLowerCase();
    return {
      name: target.definition.name,
      action: `Contribute ${remaining} more ${metric}${remaining > 1 ? 's' : ''} to unlock ${target.definition.name}!`,
    };
  };
  const weeklyChallenge = getWeeklyChallenge(evaluations);

  return (
    <div className="w-full bg-[var(--paper)] text-[var(--ink)] min-h-screen py-8">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        {/* Header / Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-[#16211a] bg-white p-4 shadow-[0_4px_0_#16211a]">
          <div className="flex items-center gap-3">
            <button
              onClick={handleFavoriteToggle}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#16211a] bg-white text-lg transition-colors hover:bg-[#eef4ec]"
            >
              {isFavorited ? '⭐' : '☆'}
            </button>
            <button
              onClick={handleBookmarkToggle}
              aria-label={isBookmarked ? 'Delete bookmark' : 'Bookmark profile data'}
              className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#16211a] bg-white text-lg transition-colors hover:bg-[#eef4ec]"
            >
              {isBookmarked ? '📌' : '📍'}
            </button>
            <button
              onClick={() => setShareModalOpen(true)}
              aria-label="Open share options"
              className="rounded-lg border-2 border-[#16211a] bg-[#1f6f4a] px-4 py-2 text-sm font-bold text-white shadow-[0_4px_0_#16211a] hover:bg-[#155d3d] hover:translate-y-[1px] active:translate-y-[3px] active:shadow-[0_1px_0_#16211a] transition-all"
            >
              📢 Share Profile
            </button>
          </div>

          <button
            onClick={requestNotifications}
            className={`rounded-lg border-2 border-[#16211a] px-4 py-2 text-xs font-bold transition-all ${
              notificationsEnabled
                ? 'bg-[#eef4ec] text-[#1f6f4a]'
                : 'bg-white text-[#16211a] hover:bg-[#eef4ec]'
            }`}
          >
            {notificationsEnabled ? '🔔 Notifications On' : '🔕 Enable Notifications'}
          </button>
        </div>

        {isBookmarked && (
          <div className="rounded-lg bg-[#fdfaf2] border-2 border-[#b45309] px-4 py-3 text-sm text-[#b45309] font-bold">
            📌 Cached — displaying saved offline snapshot.
          </div>
        )}

        {/* Main Profile Info */}
        <ProfileSection profile={profile} />

        {/* Streaks & Weekly Challenge Row */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Current Streak */}
          <div className="news-card p-5 text-center flex flex-col justify-center">
            <span className="text-3xl mb-1">🔥</span>
            <h4 className="text-xs font-bold text-[#4f6156] uppercase tracking-wider">Current Streak</h4>
            <p className="mt-1 font-mono text-3xl font-bold text-[#16211a]">{streaks.currentStreak} Days</p>
          </div>

          {/* Longest Streak */}
          <div className="news-card p-5 text-center flex flex-col justify-center">
            <span className="text-3xl mb-1">⚡</span>
            <h4 className="text-xs font-bold text-[#4f6156] uppercase tracking-wider">Longest Streak</h4>
            <p className="mt-1 font-mono text-3xl font-bold text-[#16211a]">{streaks.longestStreak} Days</p>
          </div>

          {/* Weekly Challenge */}
          {weeklyChallenge && (
            <div className="news-card border-2 border-[#b45309] bg-[#fdfaf2] p-5 flex flex-col justify-center">
              <h4 className="text-xs font-bold text-[#b45309] uppercase tracking-wider">Weekly Challenge</h4>
              <p className="mt-2 text-sm font-bold text-[#16211a]">{weeklyChallenge.action}</p>
            </div>
          )}
        </div>

        {/* Badge Predictor and Repository Health */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Badge Predictor */}
          <div className="news-card p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#16211a] flex items-center gap-2">
              <span>🔮</span> Next 90 Days Predictions
            </h3>
            <div className="divide-y divide-[#cbd8cf] max-h-[300px] overflow-y-auto pr-2">
              {predictions.slice(0, 5).map(({ badge, probability }) => (
                <div key={badge.definition.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#16211a] truncate">{badge.definition.name}</p>
                    <p className="text-xs text-[#4f6156]">Current progress: {Math.round(badge.progress)}%</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-mono text-xs font-bold text-[#b45309]">
                      {Math.round(probability * 100)}% Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Repo Health Grid */}
          <div className="news-card p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#16211a] flex items-center gap-2">
              <span>🩺</span> Repository Health Scores
            </h3>
            <div className="divide-y divide-[#cbd8cf] max-h-[300px] overflow-y-auto pr-2">
              {profile.repositories.slice(0, 5).map((repo) => {
                const score = computeRepoHealthScore(repo);
                return (
                  <div key={repo.name} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#16211a] truncate">{repo.name}</p>
                      <p className="text-xs text-[#4f6156]">
                        Issues: {repo.openIssuesCount} · README: {repo.hasReadme ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <span className={`font-mono text-sm font-bold ${
                      score >= 80 ? 'text-[#1f6f4a]' : score >= 50 ? 'text-[#b45309]' : 'text-red-600'
                    }`}>
                      {score}/100
                    </span>
                  </div>
                );
              })}
              {profile.repositories.length === 0 && (
                <p className="text-sm text-[#4f6156] py-4">No public repositories found.</p>
              )}
            </div>
          </div>
        </div>

        {/* OS Project Suggestions */}
        {recommendations.length > 0 && (
          <div className="news-card p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#16211a] flex items-center gap-2">
              <span>🌱</span> Recommended Open Source Repositories
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-[#cbd8cf] bg-white p-4 hover:border-[#1f6f4a] hover:bg-[#eef4ec]/50 shadow-[0_2px_0_#16211a] transition-all duration-150"
                >
                  <h4 className="text-sm font-bold text-[#16211a] truncate">{repo.name}</h4>
                  <p className="text-xs text-[#4f6156] mt-1 line-clamp-2 min-h-[32px]">{repo.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-[#4f6156]">
                    <span>⭐ {repo.stargazers_count.toLocaleString()}</span>
                    <span>{repo.language}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Badges Grid */}
        <BadgeGrid evaluations={evaluations} rpgMode={rpgMode} />

        {/* Roadmap & Timeline */}
        <div className="grid gap-8 lg:grid-cols-2">
          <RoadmapPanel roadmap={roadmap} rpgMode={rpgMode} />
          <TimelineView evaluations={evaluations} />
        </div>

        {/* Statistics */}
        <StatsPanel evaluations={evaluations} scores={scores} roadmap={roadmap} />

        {/* Lazy-loaded Share Modal */}
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          profile={profile}
          evaluations={evaluations}
          scores={scores}
          roadmap={roadmap}
        />
      </div>
    </div>
  );
}
