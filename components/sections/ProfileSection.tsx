'use client';

import Image from 'next/image';
import { StatCounter } from '@/components/primitives/StatCounter';
import { formatDate } from '@/lib/utils/formatters';
import type { GitHubProfile } from '@/types';

interface ProfileSectionProps {
  profile: GitHubProfile;
  fromCache?: boolean;
}

export function ProfileSection({ profile, fromCache = false }: ProfileSectionProps) {
  return (
    <section className="news-card p-6 shadow-[0_4px_0_#16211a]">
      {fromCache && (
        <div className="mb-4 rounded-lg bg-[#fdfaf2] border border-[#b45309] px-3 py-2 text-xs text-[#b45309] font-bold">
          📌 Cached — last updated {formatDate(profile.fetchedAt)}
        </div>
      )}

      {/* Profile header */}
      <div className="flex items-start gap-4">
        <Image
          src={profile.avatarUrl}
          alt={profile.name}
          width={80}
          height={80}
          className="rounded-2xl border-2 border-[#16211a]"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bricolage font-extrabold text-[#16211a] truncate">
            {profile.name}
          </h2>
          <p className="text-sm text-[#4f6156] font-bold">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-1 text-sm text-[#16211a] line-clamp-2">{profile.bio}</p>
          )}
          <p className="mt-1 text-xs text-[#4f6156]">
            Joined {formatDate(profile.createdAt)} · {profile.accountAgeYears} years on GitHub
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <StatCounter value={profile.followers} label="Followers" />
        <StatCounter value={profile.following} label="Following" />
        <StatCounter value={profile.publicRepos} label="Repos" />
        <StatCounter value={profile.totalCommits} label="Commits" />
        <StatCounter value={profile.totalPRs} label="Pull Requests" />
        <StatCounter value={profile.totalIssues} label="Issues" />
        <StatCounter value={profile.starsReceived} label="Stars" />
        <StatCounter value={profile.forksReceived} label="Forks" />
        <StatCounter value={profile.totalGists} label="Gists" />
      </div>

      {/* Language distribution */}
      {profile.languages.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-bold text-[#16211a]">
            Top Languages
          </h3>
          <div className="flex h-3 overflow-hidden rounded-full border border-[#16211a]">
            {profile.languages.map((lang) => (
              <div
                key={lang.name}
                className="transition-all duration-500"
                style={{
                  width: `${lang.percentage ?? 0}%`,
                  backgroundColor: lang.color || '#6B7280',
                }}
                title={`${lang.name}: ${lang.percentage?.toFixed(1) ?? 0}%`}
              />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            {profile.languages.map((lang) => (
              <div key={lang.name} className="flex items-center gap-1.5 text-xs text-[#4f6156] font-bold">
                <span
                  className="h-2.5 w-2.5 rounded-full border border-[#16211a]"
                  style={{ backgroundColor: lang.color || '#6B7280' }}
                />
                {lang.name} ({lang.percentage?.toFixed(1) ?? 0}%)
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
