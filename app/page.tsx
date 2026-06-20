'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BADGE_DEFINITIONS, BADGE_EMOJIS } from '@/lib/data/badge-definitions';
import { useLeaderboardStore } from '@/lib/store/leaderboard-store';
import { parseInput, INPUT_ERRORS } from '@/lib/utils/input-parser';

const RARITY_COLORS: Record<string, string> = {
  'Common': 'bg-[#cbd8cf] text-[#16211a]',
  'Rare': 'bg-[#dceff7] text-[#0f5c78]',
  'Epic': 'bg-[#ebe5ff] text-[#6d4cc2]',
  'Legendary': 'bg-[#f3eadc] text-[#8a4b12]',
  'Secret': 'bg-[#f7d6d6] text-[#b45309]',
};

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  const profilesCheckedCount = useLeaderboardStore((s) => s.profilesCheckedCount);
  const fetchProfilesCheckedCount = useLeaderboardStore((s) => s.fetchProfilesCheckedCount);
  const hits = mounted ? profilesCheckedCount : 0;

  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchProfilesCheckedCount();

    // Fetch repository stars
    fetch('https://api.github.com/repos/Diganta18-noob/badge2')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch stars');
      })
      .then((data) => {
        if (data && typeof data.stargazers_count === 'number') {
          setStars(data.stargazers_count);
        }
      })
      .catch((err) => {
        console.error('Error fetching repo stars:', err);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInput(username);
    if (parsed.error || !parsed.username) {
      setError(INPUT_ERRORS[parsed.error || 'INVALID_FORMAT']);
      return;
    }
    setError(null);
    router.push(`/u/${parsed.username}`);
  };

  // Filter the first 9 key badges for "The Nine" section
  const theNineBadges = [
    'pull-shark',
    'quickdraw',
    'galaxy-brain',
    'yolo',
    'starstruck',
    'open-source-contributor',
    'pair-extraordinaire',
    'arctic-code-vault',
    'public-sponsor'
  ];
  
  const displayBadges = BADGE_DEFINITIONS.filter(b => theNineBadges.includes(b.id));

  return (
    <div className="max-w-[1180px] mx-auto px-6 pb-20">
      {/* Newspaper Header */}
      <header className="news-header">
        <div className="news-kicker">BH BADGE HUNTER · V0.1</div>
        <h1 className="news-title">
          GitHub <em>Badge</em> Hunter
        </h1>
        <p className="max-w-[680px] text-[#4f6156] text-[17px] mt-2 leading-relaxed">
          Pick a repo, point it at your fork of the badge bot, and watch every achievement tier fill up — 
          Pull Shark, Quickdraw, Galaxy Brain, all nine. Workflows still run on GitHub; this is the control room.
        </p>
        
        <div className="flex flex-wrap gap-4 mt-6 items-center">
          {/* People Checked Counter */}
          <div className="inline-flex items-center gap-4 border-2 border-[#16211a] dark:border-[var(--ink)] bg-[#f7f9f6] dark:bg-[var(--paper)] px-4 py-2 rounded-[6px] h-[52px] select-none shadow-[3px_3px_0_#16211a] dark:shadow-[3px_3px_0_var(--ink)]">
            <div className="flex flex-col justify-center leading-none font-mono text-[#16211a] dark:text-[var(--ink)]">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#4f6156] dark:text-[var(--soft)] whitespace-nowrap">PEOPLE CHECKED</span>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#16211a] dark:text-[var(--ink)] whitespace-nowrap mt-0.5">PROFILES</span>
            </div>
            <div className="flex items-center gap-[1px] font-mono text-sm font-bold p-0.5 rounded-[4px] border h-[32px] news-counter-wrapper">
              {hits.toLocaleString().split('').map((char, index) => (
                <span 
                  key={index} 
                  className={`inline-flex items-center justify-center rounded-[2px] font-mono font-black text-xs ${
                    char === ',' 
                      ? 'w-[8px] news-counter-comma' 
                      : 'w-[16px] h-[26px] news-counter-digit'
                  }`}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          {/* Star on GitHub Button */}
          <a 
            href="https://github.com/Diganta18-noob/badge2" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group bg-[#16211a] dark:bg-[var(--ink)] text-white dark:text-[var(--paper)] border-2 border-[#16211a] dark:border-[var(--ink)] rounded-[6px] hover:bg-[#1f6f4a] dark:hover:bg-[#26895b] hover:border-[#1f6f4a] dark:hover:border-[#26895b] flex items-center justify-center gap-2.5 font-mono text-xs font-extrabold uppercase px-5 h-[52px] transition-all whitespace-nowrap box-border shadow-[3px_3px_0_#16211a] dark:shadow-[3px_3px_0_var(--ink)] hover:translate-y-[1px] dark:hover:translate-y-[1px] hover:shadow-[2px_2px_0_#16211a] dark:hover:shadow-[2px_2px_0_var(--ink)] active:translate-y-[3px] active:shadow-none"
            style={{ textTransform: 'uppercase' }}
          >
            <svg className="h-5 w-5 fill-white dark:fill-[var(--paper)] transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
            </svg>
            <span>Star on GitHub</span>
            {stars !== null && (
              <span className="bg-[#cbd8cf] dark:bg-[var(--paper)]/25 text-[#16211a] dark:text-[var(--paper)] rounded px-1.5 py-0.5 text-[10px] font-black ml-1 border border-[#16211a] dark:border-[var(--paper)]/50 group-hover:bg-white dark:group-hover:bg-[var(--paper)] group-hover:text-[#1f6f4a] dark:group-hover:text-[var(--ink)] transition-colors">
                ★ {stars}
              </span>
            )}
          </a>
        </div>

        <div className="absolute right-0 top-[30px] text-right text-[10.5px] text-[#4f6156] font-mono leading-relaxed hidden sm:block">
          BADGES <b className="text-[#16211a]">9</b> TRACKED<br />
          SRC · <b className="text-[#16211a]">GITHUB ACTIONS</b>
        </div>
      </header>

      {/* Why This Exists Section */}
      <section className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 md:gap-7 py-8 border-b-2 border-[#cbd8cf]">
        <div className="news-tag">Why this exists</div>
        <div className="max-w-[800px] text-[16.5px] text-[#4f6156] leading-relaxed">
          <strong className="text-[#16211a] font-bricolage text-[20px] block mb-1">
            GitHub awards profile badges, but the work to earn them is scattered.
          </strong>
          The bot creates PRs, opens issues, posts discussions, reacts to comments on a schedule. This dashboard makes the queue legible: one screen per badge, every workflow run, every tier threshold, every Telegram ping — in one place.
        </div>
      </section>

      {/* Input Search Block (Kolkata Router Style) */}
      <section className="py-8 border-b-2 border-[#cbd8cf]">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
          <div className="relative">
            <label htmlFor="username" className="block text-[11px] font-mono tracking-wider uppercase text-[#4f6156] mb-2 font-bold">
              Analyze Username — Enter GitHub Username
            </label>
            <input 
              id="username"
              type="text" 
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Diganta18-noob" 
              className="w-full font-hanken text-[18px] font-bold px-[15px] py-[15px] border-2 border-[#16211a] bg-white text-[#16211a] rounded-[6px] outline-none transition-shadow focus:ring-4 focus:ring-[#1f6f4a]/20 focus:border-[#1f6f4a]"
            />
          </div>
          <button 
            type="submit"
            className="font-bricolage font-extrabold text-[18px] px-7 py-3.5 border-2 border-[#16211a] bg-[#1f6f4a] text-white cursor-pointer h-[56px] rounded-[6px] shadow-[0_4px_0_#16211a] hover:bg-[#155d3d] hover:translate-y-[1px] active:shadow-[0_1px_0_#16211a] active:translate-y-[3px] transition-all"
          >
            Analyze Profile
          </button>
        </form>
        {error && (
          <p className="mt-2 text-sm text-red-600 font-bold" role="alert">
            {error}
          </p>
        )}
      </section>

      {/* The Nine Section */}
      <section className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 md:gap-7 pt-8">
        <div className="news-tag">The Nine</div>
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayBadges.map((badge) => {
              const emoji = BADGE_EMOJIS[badge.id] || '🏆';
              const rarityColor = RARITY_COLORS[badge.rarity] || 'bg-[#cbd8cf] text-[#16211a]';
              return (
                <div key={badge.id} className="news-card flex flex-col justify-between p-5 min-h-[220px]">
                  <div>
                    {/* Top Row with emoji and status */}
                    <div className="flex justify-between items-start">
                      <div className="text-4xl p-2 bg-[#eef4ec] border border-[#16211a] rounded-[6px]">
                        {emoji}
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border border-[#16211a] font-bold ${rarityColor}`}>
                        {badge.rarity.toUpperCase()}
                      </span>
                    </div>

                    {/* Badge details */}
                    <h3 className="font-bricolage text-[18px] font-extrabold mt-4 text-[#16211a]">
                      {badge.name}
                    </h3>
                    <p className="text-[13px] text-[#4f6156] mt-2 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>

                  {/* Difficulty / Tiers preview */}
                  <div className="mt-4 pt-3 border-t border-[#cbd8cf] flex justify-between items-center text-[11px] font-mono text-[#4f6156]">
                    <span>DIFF: <b>{badge.difficulty.toUpperCase()}</b></span>
                    <span>TIERS: <b>{badge.tiers.length}</b></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
