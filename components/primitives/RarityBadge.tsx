'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { rarityPulse, legendaryShimmer } from '@/lib/utils/animation-variants';
import type { BadgeRarity } from '@/types';

const RARITY_THEMES: Record<BadgeRarity, { bg: string; text: string; border: string }> = {
  Common: { bg: '#cbd8cf', text: '#16211a', border: '#16211a' },
  Rare: { bg: '#dceff7', text: '#0f5c78', border: '#0f5c78' },
  Epic: { bg: '#ebe5ff', text: '#6d4cc2', border: '#6d4cc2' },
  Legendary: { bg: '#f3eadc', text: '#8a4b12', border: '#8a4b12' },
  Secret: { bg: '#f7d6d6', text: '#b45309', border: '#b45309' },
};

interface RarityBadgeProps {
  rarity: BadgeRarity;
  size?: 'sm' | 'md';
}

export function RarityBadge({ rarity, size = 'sm' }: RarityBadgeProps) {
  const prefersReduced = useReducedMotion();

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';
  const theme = RARITY_THEMES[rarity];

  const shouldAnimate = !prefersReduced;
  const variants =
    rarity === 'Secret' && shouldAnimate
      ? rarityPulse
      : rarity === 'Legendary' && shouldAnimate
        ? legendaryShimmer
        : undefined;

  return (
    <motion.span
      className={`inline-flex items-center rounded font-mono font-bold border ${sizeClasses}`}
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
        borderColor: theme.border,
      }}
      variants={variants}
      initial={variants ? 'hidden' : undefined}
      animate={variants ? 'visible' : undefined}
    >
      {rarity}
    </motion.span>
  );
}
