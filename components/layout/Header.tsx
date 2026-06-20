'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useUIStore } from '@/lib/store/ui-store';
import { MobileNav } from './MobileNav';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/compare', label: 'Compare' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/wrapped', label: 'Wrapped' },
] as const;

export function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const rpgMode = useUIStore((s) => s.rpgModeEnabled);
  const toggleRPG = useUIStore((s) => s.toggleRPGMode);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b-2 border-[#16211a] bg-[#f7f9f6]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bricolage font-extrabold text-[#16211a] transition-colors hover:text-[#1f6f4a]"
          >
            <span className="text-2xl">🏆</span>
            <span className="hidden sm:inline">Badge Hunter</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-2 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-all border-2 focus:outline-none focus:ring-2 focus:ring-[#1f6f4a] ${
                    isActive
                      ? 'border-[#16211a] bg-[#eef4ec] text-[#16211a]'
                      : 'border-transparent text-[#4f6156] hover:bg-[#eef4ec] hover:text-[#16211a] hover:border-[#16211a]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* RPG Mode toggle */}
            <button
              onClick={toggleRPG}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold border-2 border-[#16211a] transition-all focus:outline-none focus:ring-2 focus:ring-[#1f6f4a] ${
                rpgMode
                  ? 'bg-[#1f6f4a] text-white shadow-[0_2px_0_#16211a]'
                  : 'bg-[#eef4ec] text-[#16211a] hover:bg-[#cbd8cf] shadow-[0_2px_0_#16211a]'
              }`}
              aria-label="Toggle RPG Mode"
            >
              {rpgMode ? '⚔️ RPG' : '🎮 RPG'}
            </button>

            {/* Hamburger (mobile) */}
            <button
              className="rounded-lg p-2 text-[#16211a] border-2 border-[#16211a] bg-white transition-colors hover:bg-[#eef4ec] md:hidden focus:outline-none focus:ring-2 focus:ring-[#1f6f4a]"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Toggle navigation"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}
