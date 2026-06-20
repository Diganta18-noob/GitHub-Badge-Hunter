// lib/utils/animation-variants.ts
// Framer Motion variant objects per the design animation timing reference table.

import type { Variants } from 'framer-motion';

/**
 * Fade + slide up — used for cards and section entries.
 * Duration: 400ms, ease-out
 */
export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

/**
 * Fade + slide from left — used for timeline year groups.
 * Duration: 300ms, ease-out
 */
export const fadeSlideLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

/**
 * Hero stagger container — orchestrates staggered children entry.
 * Stagger children by 150ms.
 */
export const heroStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0,
    },
  },
};

/**
 * Counter fade — used for stat counter number animations.
 * Duration: 800ms, ease-out
 */
export const counterFade: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

/**
 * Rarity pulse — pulsing animation for Secret badge pills.
 * 2-second period infinite loop.
 */
export const rarityPulse: Variants = {
  hidden: { opacity: 0.6 },
  visible: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Legendary shimmer — glowing shimmer effect for Legendary badges.
 * 3-second interval infinite loop.
 */
export const legendaryShimmer: Variants = {
  hidden: { opacity: 0.8, filter: 'brightness(1)' },
  visible: {
    opacity: [0.8, 1, 0.8],
    filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
