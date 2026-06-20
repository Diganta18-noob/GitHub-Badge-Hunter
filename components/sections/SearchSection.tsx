'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { parseInput, INPUT_ERRORS } from '@/lib/utils/input-parser';
import { useSearchHistory } from '@/lib/hooks/useSearchHistory';

export function SearchSection() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { history, addEntry } = useSearchHistory();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced filter for autocomplete
  const [filteredHistory, setFilteredHistory] = useState(history);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (input.trim()) {
        setFilteredHistory(
          history.filter((entry) =>
            entry.username.toLowerCase().includes(input.trim().toLowerCase()),
          ),
        );
      } else {
        setFilteredHistory(history);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, history]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = useCallback(
    (username?: string) => {
      const raw = username ?? input;
      const result = parseInput(raw);

      if (result.error) {
        setError(INPUT_ERRORS[result.error]);
        return;
      }

      setError(null);
      setShowHistory(false);
      addEntry(result.username!);
      router.push(`/u/${result.username}`);
    },
    [input, addEntry, router],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="mx-auto max-w-xl px-4 pb-16">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              onFocus={() => history.length > 0 && setShowHistory(true)}
              onKeyDown={handleKeyDown}
              placeholder="Enter GitHub username or URL..."
              className="w-full font-hanken text-[15px] font-bold px-4 py-3 border-2 border-[#16211a] bg-white text-[#16211a] rounded-[6px] outline-none transition-shadow focus:ring-4 focus:ring-[#1f6f4a]/20 focus:border-[#1f6f4a] placeholder-[#4f6156]/50"
              aria-label="GitHub username or profile URL"
              id="search-input"
            />

            {/* History dropdown */}
            {showHistory && filteredHistory.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-[6px] border-2 border-[#16211a] bg-white shadow-xl"
              >
                {filteredHistory.map((entry) => (
                  <button
                    key={entry.username}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[var(--ink)] font-medium transition-colors hover:bg-[#eef4ec] border-b border-[#cbd8cf] last:border-b-0"
                    onClick={() => {
                      setInput(entry.username);
                      handleSubmit(entry.username);
                    }}
                  >
                    <span className="text-[#1f6f4a]">🔍</span>
                    <span>{entry.username}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => handleSubmit()}
            className="font-bricolage font-extrabold text-[15px] px-6 py-3 border-2 border-[#16211a] bg-[#1f6f4a] text-white cursor-pointer rounded-[6px] shadow-[0_4px_0_#16211a] hover:bg-[#155d3d] hover:translate-y-[1px] active:shadow-[0_1px_0_#16211a] active:translate-y-[3px] transition-all min-h-[46px]"
            id="search-button"
          >
            Analyze Profile
          </button>
        </div>

        {/* Error message */}
        {error && (
          <p
            className="mt-2 text-sm text-red-600 font-bold"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
