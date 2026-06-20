'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { heroStagger, fadeSlideUp } from '@/lib/utils/animation-variants';

export function HeroSection() {
  const prefersReduced = useReducedMotion();

  return (
    <motion.section
      className="relative overflow-hidden py-20 text-center sm:py-28"
      variants={prefersReduced ? undefined : heroStagger}
      initial="hidden"
      animate="visible"
    >
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-500/20 blur-[120px]" />
        <div className="absolute left-1/3 top-1/2 h-48 w-48 rounded-full bg-violet-500/15 blur-[100px]" />
      </div>

      <motion.div
        variants={prefersReduced ? undefined : fadeSlideUp}
        className="mx-auto max-w-3xl px-4"
      >
        <span className="mb-4 inline-block rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400">
          🏆 GitHub Achievement Tracker
        </span>

        <h1 className="mt-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
          Discover Your GitHub Badges
        </h1>
      </motion.div>

      <motion.p
        variants={prefersReduced ? undefined : fadeSlideUp}
        className="mx-auto mt-6 max-w-xl px-4 text-lg text-slate-400"
      >
        Enter any GitHub username to analyze achievement badges, track progress,
        and unlock your full developer potential.
      </motion.p>
    </motion.section>
  );
}
