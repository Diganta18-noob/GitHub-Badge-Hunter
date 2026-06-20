'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { fadeSlideUp } from '@/lib/utils/animation-variants';
import { ProgressBar } from './ProgressBar';
import { RarityBadge } from './RarityBadge';
import { ConfettiTrigger } from './ConfettiTrigger';
import { BADGE_EMOJIS } from '@/lib/data/badge-definitions';
import type { BadgeEvaluation } from '@/types';

interface BadgeCardProps {
  evaluation: BadgeEvaluation;
  rpgMode: boolean;
}

const RPG_TIER_MAP: Record<string, string> = {
  Bronze: 'Apprentice',
  Silver: 'Journeyman',
  Gold: 'Master',
  None: 'Novice',
};

export function BadgeCard({ evaluation, rpgMode }: BadgeCardProps) {
  const { definition, status, currentValue, threshold, progress, currentTier, checklistItems, checklistCompletion } = evaluation;
  const prefersReduced = useReducedMotion();
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isUnlocked = status === 'Unlocked';
  const tierLabel = rpgMode
    ? RPG_TIER_MAP[currentTier] ?? currentTier
    : currentTier;

  return (
    <motion.div
      className={`relative overflow-hidden news-card transition-all duration-150 ${
        isUnlocked
          ? 'bg-white border-2 border-[#16211a] shadow-[4px_4px_0_#16211a] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#16211a]'
          : 'bg-[#f7f9f6] opacity-75 border-2 border-[#16211a] hover:opacity-100 hover:shadow-[4px_4px_0_#16211a]'
      }`}
      variants={prefersReduced ? undefined : fadeSlideUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <ConfettiTrigger trigger={isUnlocked} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`relative h-14 w-14 flex-shrink-0 rounded-xl p-2 border border-[#16211a] ${
            isUnlocked ? 'bg-[#eef4ec]' : 'bg-[#f7f9f6] opacity-50 grayscale'
          }`}>
            {!imageError ? (
              <Image
                src={definition.iconPath}
                alt={`${definition.name} badge icon`}
                width={40}
                height={40}
                loading="lazy"
                className="h-full w-full object-contain relative z-10"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-2xl z-0">
                {BADGE_EMOJIS[definition.id] || '🏆'}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bricolage font-extrabold text-[#16211a] truncate">
              {definition.name}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <RarityBadge rarity={definition.rarity} size="sm" />
              {currentTier !== 'None' && (
                <span className="text-xs font-bold text-[#4f6156]">
                  {tierLabel}
                </span>
              )}
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex-shrink-0">
            {isUnlocked ? (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1f6f4a] text-xs font-bold text-white border border-[#16211a]" aria-label="Unlocked">
                ✓
              </span>
            ) : (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#cbd8cf] text-xs font-bold text-[#16211a] border border-[#16211a]" aria-label="Locked">
                🔒
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-xs text-[#4f6156] leading-relaxed">
          {definition.description}
        </p>

        {/* Progress */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-[#4f6156] font-bold">
              {rpgMode ? 'XP' : 'Progress'}
            </span>
            <span className="font-mono text-[#16211a] font-bold">
              {currentValue} / {threshold}
            </span>
          </div>
          <ProgressBar
            value={progress}
            color={isUnlocked ? '#1f6f4a' : '#8a4b12'}
          />
          <p className="mt-1 text-right text-xs font-mono font-bold text-[#4f6156]">
            {Math.round(progress)}%
          </p>
        </div>

        {/* Checklist (collapsible) */}
        {checklistItems.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setChecklistOpen(!checklistOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-[#cbd8cf] bg-white px-2 py-1.5 text-xs font-bold text-[#16211a] transition-all hover:bg-[#eef4ec] focus:outline-none focus:ring-2 focus:ring-[#1f6f4a]"
              aria-label={`${checklistOpen ? 'Collapse' : 'Expand'} checklist for ${definition.name}`}
            >
              <span>Checklist ({checklistCompletion}%)</span>
              <svg
                className={`h-3.5 w-3.5 transition-transform ${checklistOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {checklistOpen && (
              <ul className="mt-1.5 space-y-1 px-2">
                {checklistItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-xs font-bold">
                    <span className={item.met ? 'text-[#1f6f4a]' : 'text-[#4f6156]'}>
                      {item.met ? '✓' : '○'}
                    </span>
                    <span className={item.met ? 'text-[#16211a]' : 'text-[#4f6156]'}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
