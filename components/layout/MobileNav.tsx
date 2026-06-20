'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/compare', label: 'Compare' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/wrapped', label: 'Wrapped' },
] as const;

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Trap focus within overlay
  useEffect(() => {
    if (!isOpen || !navRef.current) return;

    const focusable = navRef.current.querySelectorAll<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])',
    );

    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex md:hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Nav panel */}
      <div
        ref={navRef}
        className="relative ml-auto flex w-72 flex-col bg-[#f7f9f6] border-l-2 border-[#16211a] p-6 shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="mb-8 self-end rounded-lg p-2 text-[#16211a] border-2 border-[#16211a] bg-white transition-colors hover:bg-[#eef4ec] focus:outline-none focus:ring-2 focus:ring-[#1f6f4a]"
          aria-label="Close navigation"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Links */}
        <nav className="flex flex-col gap-2">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`rounded-lg px-4 py-3 text-lg font-bold border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1f6f4a] ${
                  isActive
                    ? 'bg-[#1f6f4a] text-white border-[#16211a]'
                    : 'bg-white text-[#16211a] border-[#16211a] hover:bg-[#eef4ec]'
                }`}
                style={{ minHeight: 44 }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
