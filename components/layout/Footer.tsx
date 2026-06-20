import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t-2 border-[#16211a] bg-[#f7f9f6]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Branding */}
          <div className="flex items-center gap-2 text-sm text-[var(--soft)]">
            <span className="text-lg">🏆</span>
            <span>Badge Hunter — GitHub Achievement Tracker</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-[var(--soft)] transition-colors hover:text-[#1f6f4a] focus:outline-none focus:ring-2 focus:ring-[#1f6f4a] focus:ring-offset-2 focus:ring-offset-[#f7f9f6] rounded"
            >
              Home
            </Link>
            <Link
              href="/compare"
              className="text-sm text-[var(--soft)] transition-colors hover:text-[#1f6f4a] focus:outline-none focus:ring-2 focus:ring-[#1f6f4a] focus:ring-offset-2 focus:ring-offset-[#f7f9f6] rounded"
            >
              Compare
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--soft)] transition-colors hover:text-[#1f6f4a] focus:outline-none focus:ring-2 focus:ring-[#1f6f4a] focus:ring-offset-2 focus:ring-offset-[#f7f9f6] rounded"
            >
              GitHub
            </a>
          </nav>
        </div>

        <p className="mt-4 text-center text-xs text-[var(--soft)]/70">
          Built with Next.js, TailwindCSS, and ❤️. Not affiliated with GitHub, Inc.
        </p>
      </div>
    </footer>
  );
}
